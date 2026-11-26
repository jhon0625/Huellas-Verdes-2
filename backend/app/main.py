import asyncio
import io
import json
import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from google import genai
from google.genai import types
from PIL import Image
from pydantic import BaseModel

from .geo import haversine_km
from .supabase_client import get_supabase

load_dotenv()

DEFAULT_RADIUS_KM = float(os.environ.get("DEFAULT_RADIUS_KM", 3))

app = FastAPI(
    title="Huellas Verdes API",
    description=(
        "API de apoyo para la app Huellas Verdes: calcula cercanía "
        "geográfica, arma el feed de amenazas con su nivel de confianza "
        "comunitaria, sugiere convocatorias de voluntariado cercanas e "
        "identifica especies mediante comparación visual local e híbrida."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "huellas-verdes-api",
        "indexed_species": len(species_catalog),
    }


class Threat(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    category: str
    lat: float
    lng: float
    status: str
    photo_url: Optional[str] = None
    created_at: str
    confirmations: int = 0
    dismissals: int = 0
    total_votes: int = 0
    distance_km: Optional[float] = None


@app.get("/api/threats/nearby", response_model=list[Threat])
def threats_nearby(
    lat: float = Query(..., description="Latitud del usuario"),
    lng: float = Query(..., description="Longitud del usuario"),
    radius_km: float = Query(DEFAULT_RADIUS_KM, gt=0, le=200),
):
    """Devuelve las amenazas dentro de un radio dado, ordenadas por
    cercanía, incluyendo el puntaje de validación comunitaria."""
    supabase = get_supabase()
    res = supabase.table("threats_with_score").select("*").execute()
    rows = res.data or []

    nearby = []
    for row in rows:
        distance = haversine_km(lat, lng, row["lat"], row["lng"])
        if distance <= radius_km:
            row["distance_km"] = round(distance, 3)
            nearby.append(row)

    nearby.sort(key=lambda r: r["distance_km"])
    return nearby


class DuplicateCheckRequest(BaseModel):
    lat: float
    lng: float
    radius_meters: float = 300


@app.post("/api/threats/check-duplicates")
def check_duplicates(payload: DuplicateCheckRequest):
    """Antes de crear un reporte, el frontend consulta este endpoint para
    saber si ya existe una amenaza muy cercana (posible duplicado)."""
    supabase = get_supabase()
    res = supabase.table("threats").select("*").execute()
    rows = res.data or []

    radius_km = payload.radius_meters / 1000
    matches = []
    for row in rows:
        distance = haversine_km(payload.lat, payload.lng, row["lat"], row["lng"])
        if distance <= radius_km:
            row["distance_km"] = round(distance, 4)
            matches.append(row)

    matches.sort(key=lambda r: r["distance_km"])
    return {"possible_duplicates": matches}


@app.get("/api/volunteer-calls/nearby")
def volunteer_calls_nearby(
    lat: float = Query(...),
    lng: float = Query(...),
    radius_km: float = Query(DEFAULT_RADIUS_KM * 3, gt=0, le=500),
):
    """Convocatorias de voluntariado cuya amenaza asociada está cerca
    del usuario, para agilizar la convocatoria de la ONG."""
    supabase = get_supabase()
    calls_res = supabase.table("volunteer_calls").select("*").execute()
    threats_res = supabase.table("threats").select("id, lat, lng").execute()
    threats_by_id = {t["id"]: t for t in (threats_res.data or [])}

    results = []
    for call in calls_res.data or []:
        threat = threats_by_id.get(call.get("threat_id"))
        if not threat:
            continue
        distance = haversine_km(lat, lng, threat["lat"], threat["lng"])
        if distance <= radius_km:
            call["distance_km"] = round(distance, 3)
            results.append(call)

    results.sort(key=lambda r: r["distance_km"])
    return results


@app.get("/api/stats/summary")
def stats_summary():
    """Números generales para un panel simple: total de amenazas,
    confirmadas, y voluntariados activos."""
    supabase = get_supabase()
    threats = supabase.table("threats").select("id, status").execute().data or []
    calls = supabase.table("volunteer_calls").select("id").execute().data or []

    confirmed = sum(1 for t in threats if t["status"] == "confirmado")
    resolved = sum(1 for t in threats if t["status"] == "resuelto")

    return {
        "total_threats": len(threats),
        "confirmed_threats": confirmed,
        "resolved_threats": resolved,
        "active_volunteer_calls": len(calls),
    }


# ==================== MÓDULO EDUCATIVO (CATÁLOGO LOCAL + GEMINI VISION) ====================

BASE_DIR = Path(__file__).resolve().parent.parent
SPECIES_DIR = BASE_DIR / "especies"
CATALOG_PATH = SPECIES_DIR / "catalogo.json"

species_catalog: dict[str, dict] = {}


def load_species_catalog():
    """Carga el catálogo ligero de especies desde catalogo.json sin usar PyTorch ni CLIP."""
    global species_catalog
    if CATALOG_PATH.exists():
        try:
            with open(CATALOG_PATH, "r", encoding="utf-8") as f:
                species_catalog = json.load(f)
        except Exception:
            species_catalog = {}


def save_catalog():
    try:
        SPECIES_DIR.mkdir(parents=True, exist_ok=True)
        with open(CATALOG_PATH, "w", encoding="utf-8") as f:
            json.dump(species_catalog, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"No se pudo guardar catalogo.json: {e}")


load_species_catalog()


class SpeciesResponse(BaseModel):
    es_ser_vivo: bool
    mensaje_error: str
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


GEMINI_MODELS = [
    "gemini-3.8-flash",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
]


def _error_species_response(mensaje: str) -> SpeciesResponse:
    return SpeciesResponse(
        es_ser_vivo=False,
        mensaje_error=mensaje,
        nombre_comun="",
        nombre_cientifico="",
        categoria="",
        nivel_alerta="ninguna",
        advertencia_seguridad="",
        habitat="",
        rol_ecologico="",
        estado_conservacion="",
        dato_curioso="",
        consejo_proteccion="",
    )


async def _call_gemini_species(
    api_key: str, contents, timeout_per_model: float = 18.0
) -> SpeciesResponse:
    """Llama a Gemini probando modelos de respaldo ante saturación (503) o no disponibilidad."""
    client = genai.Client(api_key=api_key)
    last_error = None

    for attempt in range(2):
        for model_name in GEMINI_MODELS:
            try:
                response = await asyncio.wait_for(
                    client.aio.models.generate_content(
                        model=model_name,
                        contents=contents,
                        config=types.GenerateContentConfig(
                            response_mime_type="application/json",
                            response_schema=SpeciesResponse,
                            temperature=0.2,
                        ),
                    ),
                    timeout=timeout_per_model,
                )
                return SpeciesResponse.model_validate_json(response.text)
            except Exception as e:
                last_error = e
                err_text = str(e)
                print(f"Gemini ({model_name}, intento {attempt + 1}) falló: {err_text}")
                # Si es error de clave inválida, no tiene sentido seguir probando modelos
                if "API_KEY_INVALID" in err_text or "401" in err_text or "403" in err_text:
                    raise

        if attempt == 0:
            await asyncio.sleep(2.0)

    raise last_error or RuntimeError("No se obtuvo respuesta de Gemini.")


async def get_or_generate_species_info(key: str) -> SpeciesResponse:
    """Devuelve la ficha desde catalogo.json o la genera con Gemini y la guarda en caché."""
    if key in species_catalog:
        info = species_catalog[key]
        # Si quedó guardada una ficha genérica vieja, la ignoramos para regenerarla con datos reales
        if (
            "advertencia_seguridad" in info
            and not info.get("nombre_cientifico", "").startswith("Especie nativa (")
        ):
            return SpeciesResponse(
                es_ser_vivo=True,
                mensaje_error="",
                nombre_comun=info["nombre_comun"],
                nombre_cientifico=info["nombre_cientifico"],
                categoria=info["categoria"],
                nivel_alerta=info.get("nivel_alerta", "precaucion"),
                advertencia_seguridad=info["advertencia_seguridad"],
                habitat=info["habitat"],
                rol_ecologico=info["rol_ecologico"],
                estado_conservacion=info["estado_conservacion"],
                dato_curioso=info["dato_curioso"],
                consejo_proteccion=info["consejo_proteccion"],
            )

    readable_name = key.replace("-", " ").replace("_", " ").strip().capitalize()
    api_key = os.getenv("GEMINI_API_KEY")

    if api_key:
        try:
            prompt = (
                f"Eres un biólogo experto de 'Huellas Verdes' en Colombia. "
                f"Genera una ficha educativa precisa y específica en español para la especie '{readable_name}' "
                f"presente en ecosistemas de Colombia. Marca 'es_ser_vivo' como True y 'mensaje_error' vacío. "
                f"Incluye su nombre científico real, categoría taxonómica (Ave, Mamífero, Reptil, Planta, Insecto, etc.) "
                f"y estado de conservación UICN real. "
                f"Evalúa estrictamente su seguridad para humanos y mascotas: en 'nivel_alerta' usa únicamente "
                f"'peligro' (si es venenosa, tóxica al tacto/ingestión o peligrosa), 'precaucion' "
                f"(si puede morder/arañar si se manipula, transmite enfermedades o tiene espinas/irritantes) "
                f"o 'ninguna' (si es completamente inofensiva). En 'advertencia_seguridad' escribe una recomendación "
                f"específica sobre esta especie para el ciudadano."
            )
            parsed = await _call_gemini_species(api_key, prompt)
            species_catalog[key] = parsed.model_dump(exclude={"es_ser_vivo", "mensaje_error"})
            save_catalog()
            return parsed
        except Exception as e:
            print(f"Error generando ficha con Gemini para {readable_name}: {e}")

    # Respaldo temporal (NO se guarda en catalogo.json para reintentar luego con Gemini)
    return SpeciesResponse(
        es_ser_vivo=True,
        mensaje_error="",
        nombre_comun=readable_name,
        nombre_cientifico=f"Especie nativa ({readable_name})",
        categoria="Biodiversidad Local",
        nivel_alerta="precaucion",
        advertencia_seguridad="Observa a una distancia prudente, evita tocar o manipular el ejemplar y mantén alejadas a las mascotas.",
        habitat="Ecosistemas naturales, bosques y zonas verdes de Colombia.",
        rol_ecologico="Contribuye al equilibrio ecológico, la polinización, dispersión de semillas o control natural de su entorno.",
        estado_conservacion="Especie registrada en catálogo local",
        dato_curioso="Forma parte de la riqueza biológica monitoreada por la comunidad de Huellas Verdes.",
        consejo_proteccion="Protege su hábitat natural, evita extraer ejemplares y reporta amenazas cercanas en el mapa.",
    )


@app.post("/api/identify-species", response_model=SpeciesResponse)
async def identify_species(file: UploadFile = File(...)):
    """Identifica seres vivos usando Gemini Vision (sin PyTorch/CLIP) y guarda fichas en catalogo.json."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo enviado debe ser una imagen válida.")

    try:
        image_bytes = await file.read()
        Image.open(io.BytesIO(image_bytes)).verify()

        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return _error_species_response(
                "La clave GEMINI_API_KEY no está configurada en el servidor. "
                "Pídele al administrador que la agregue en las variables de entorno."
            )

        try:
            prompt = (
                "Eres el biólogo experto de la app 'Huellas Verdes'. Analiza esta imagen. "
                "Si NO es un ser vivo real (por ejemplo: un objeto, vehículo, edificio, pantalla, dibujo o paisaje sin foco), "
                "responde con 'es_ser_vivo': false, 'nivel_alerta': 'ninguna', 'advertencia_seguridad': '' "
                "y en 'mensaje_error' explica brevemente qué ves y pide enfocar una planta o animal. "
                "Si SÍ es un animal, planta, hongo o insecto real (silvestre o doméstico), responde con 'es_ser_vivo': true, "
                "'mensaje_error': '', evalúa en 'nivel_alerta' ('peligro', 'precaucion' o 'ninguna') si es venenosa, tóxica "
                "o requiere precaución, redacta 'advertencia_seguridad' como recomendación prioritaria para el usuario, "
                "y completa el resto de la ficha educativa en español."
            )
            parsed = await _call_gemini_species(
                api_key,
                [
                    prompt,
                    types.Part.from_bytes(data=image_bytes, mime_type=file.content_type),
                ],
            )

            if parsed.es_ser_vivo and parsed.nombre_comun:
                new_key = (
                    parsed.nombre_comun.lower()
                    .strip()
                    .replace(" ", "-")
                    .replace("á", "a")
                    .replace("é", "e")
                    .replace("í", "i")
                    .replace("ó", "o")
                    .replace("ú", "u")
                    .replace("ñ", "n")
                )
                if new_key and new_key not in species_catalog:
                    species_catalog[new_key] = parsed.model_dump(
                        exclude={"es_ser_vivo", "mensaje_error"}
                    )
                    save_catalog()

            return parsed
        except asyncio.TimeoutError:
            return _error_species_response(
                "La IA tardó demasiado en responder. Intenta de nuevo en unos segundos."
            )
        except Exception as e:
            error_str = str(e)
            print(f"Error Gemini Vision: {error_str}")
            if "503" in error_str or "UNAVAILABLE" in error_str:
                return _error_species_response(
                    "Los servidores de Gemini están temporalmente saturados por alta demanda. "
                    "Por favor espera unos segundos e intenta de nuevo."
                )
            return _error_species_response(f"Error al conectar con Gemini: {error_str[:200]}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al analizar la imagen: {str(e)}")


# ==================== SERVIR FRONTEND COMPILADO (REACT + VITE) ====================

FRONTEND_DIST_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
)
FRONTEND_ASSETS_DIR = os.path.join(FRONTEND_DIST_DIR, "assets")

if os.path.isdir(FRONTEND_ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=FRONTEND_ASSETS_DIR), name="assets")


@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    if full_path == "api" or full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Ruta de API no encontrada")

    if os.path.isdir(FRONTEND_DIST_DIR):
        candidate = os.path.realpath(os.path.join(FRONTEND_DIST_DIR, full_path))
        if (
            full_path
            and candidate.startswith(os.path.realpath(FRONTEND_DIST_DIR) + os.sep)
            and os.path.isfile(candidate)
        ):
            return FileResponse(candidate)

        index_path = os.path.join(FRONTEND_DIST_DIR, "index.html")
        if os.path.isfile(index_path):
            return FileResponse(index_path)

    raise HTTPException(
        status_code=404,
        detail="Frontend no compilado. Ejecuta 'npm run build' en la carpeta frontend.",
    )