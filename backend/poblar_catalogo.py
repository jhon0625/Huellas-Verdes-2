import asyncio
import json
import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel

load_dotenv()

SPECIES_DIR = Path(__file__).resolve().parent / "especies"
CATALOG_PATH = SPECIES_DIR / "catalogo.json"


class SpeciesItem(BaseModel):
    clave_archivo: str
    nombre_comun: str
    nombre_cientifico: str
    categoria: str
    nivel_alerta: str
    advertencia_seguridad: str
    habitat: str
    rol_ecologico: str
    estado_conservacion: str
    dato_curioso: str
    consejo_proteccion: str


class SpeciesBatch(BaseModel):
    especies: list[SpeciesItem]


def get_available_models(client: genai.Client) -> list[str]:
    """Consulta los modelos reales disponibles en tu API Key."""
    preferred = [
        "gemini-2.5-flash-lite",
        "gemini-3.8-flash",
        "gemini-2.5-pro",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
    ]
    try:
        available = [
            m.name.replace("models/", "")
            for m in client.models.list()
            if "generateContent" in (m.supported_actions or [])
        ]
        ordered = [m for m in preferred if m in available]
        for m in available:
            if "flash" in m and m not in ordered and "audio" not in m and "image" not in m:
                ordered.append(m)
        if ordered:
            return ordered
    except Exception:
        pass
    return preferred


async def generate_batch(
    client: genai.Client, models: list[str], batch_items: list[tuple[str, str]]
) -> list[SpeciesItem]:
    items_text = "\n".join([f"- clave_archivo: '{k}' -> especie: '{name}'" for k, name in batch_items])
    prompt = (
        "Eres un biólogo experto de 'Huellas Verdes' en Colombia. "
        "Genera fichas educativas precisas y específicas en español para cada una de las siguientes especies "
        "presentes en ecosistemas de Colombia. Mantén exactamente el mismo 'clave_archivo' que se te entrega.\n\n"
        "Para cada especie incluye:\n"
        "- nombre_comun y nombre_cientifico real.\n"
        "- categoria taxonómica (Ave, Mamífero, Reptil, Anfibio, Planta, Insecto, Arácnido, Hongo, etc.).\n"
        "- estado_conservacion UICN real (ej. Preocupación menor (LC), Vulnerable (VU), En peligro (EN), etc.).\n"
        "- nivel_alerta: usa únicamente 'peligro' (si es venenosa, tóxica al tacto/ingestión o peligrosa), "
        "'precaucion' (si puede morder/arañar si se manipula, transmite enfermedades o tiene espinas/irritantes) "
        "o 'ninguna' (si es completamente inofensiva).\n"
        "- advertencia_seguridad: recomendación específica de seguridad para humanos y mascotas sobre esa especie.\n\n"
        f"Lista de especies a procesar:\n{items_text}"
    )

    for model_name in models:
        for attempt in range(3):
            try:
                print(f"   🤖 Consultando {model_name} (intento {attempt + 1})...")
                response = await asyncio.wait_for(
                    client.aio.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            response_mime_type="application/json",
                            response_schema=SpeciesBatch,
                            temperature=0.2,
                        ),
                    ),
                    timeout=35.0,
                )
                parsed = SpeciesBatch.model_validate_json(response.text)
                return parsed.especies
            except Exception as e:
                err = str(e)
                if "503" in err or "UNAVAILABLE" in err or "429" in err:
                    print(f"   ⏳ {model_name} saturado, esperando 4s...")
                    await asyncio.sleep(4)
                    continue
                print(f"   ⚠️ {model_name} no disponible: {err[:120]}")
                break
    return []


async def main():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ No se encontró GEMINI_API_KEY en backend/.env")
        return

    client = genai.Client(api_key=api_key)
    models = get_available_models(client)
    print(f"📡 Modelos disponibles en tu clave: {models}\n")

    catalog = {}
    if CATALOG_PATH.exists():
        try:
            with open(CATALOG_PATH, "r", encoding="utf-8") as f:
                catalog = json.load(f)
        except Exception:
            catalog = {}

    valid_exts = {".jpg", ".jpeg", ".png", ".webp"}
    images = [p for p in sorted(SPECIES_DIR.iterdir()) if p.suffix.lower() in valid_exts]

    pending: list[tuple[str, str]] = []
    for img_path in images:
        key = img_path.stem
        existing = catalog.get(key, {})
        if (
            "advertencia_seguridad" in existing
            and not existing.get("nombre_cientifico", "").startswith("Especie nativa (")
        ):
            continue
        readable_name = key.replace("-", " ").replace("_", " ").strip().capitalize()
        pending.append((key, readable_name))

    print(f"🔍 Total fotos: {len(images)} | Ya listas: {len(images) - len(pending)} | Pendientes: {len(pending)}\n")

    if not pending:
        print("✅ ¡Todas las especies ya tienen su ficha real en catalogo.json!")
        return

    BATCH_SIZE = 15
    for i in range(0, len(pending), BATCH_SIZE):
        batch = pending[i : i + BATCH_SIZE]
        print(f"📦 Procesando lote {i // BATCH_SIZE + 1} ({len(batch)} especies)...")
        results = await generate_batch(client, models, batch)

        if results:
            for item in results:
                data = item.model_dump()
                key = data.pop("clave_archivo")
                catalog[key] = data
            with open(CATALOG_PATH, "w", encoding="utf-8") as f:
                json.dump(catalog, f, ensure_ascii=False, indent=2)
            print(f"   💾 Guardadas {len(results)} fichas en catalogo.json\n")
        else:
            print("   ❌ Este lote falló por saturación. Vuelve a ejecutar el script en unos segundos.\n")

        await asyncio.sleep(2)

    print("🎉 Proceso finalizado.")


if __name__ == "__main__":
    asyncio.run(main())