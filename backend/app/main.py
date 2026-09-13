import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
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
        "comunitaria y sugiere convocatorias de voluntariado cercanas. "
        "La autenticación y el CRUD básico viven directamente en Supabase; "
        "este backend existe para la lógica que no es un simple query "
        "(distancias, agregaciones, futuras notificaciones push)."
    ),
    version="0.1.0",
)

# En desarrollo permitimos cualquier origen. En producción, restringe
# esto al dominio real de tu frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "huellas-verdes-api"}


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


@app.get("/threats/nearby", response_model=list[Threat])
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


@app.post("/threats/check-duplicates")
def check_duplicates(payload: DuplicateCheckRequest):
    """Antes de crear un reporte, el frontend consulta este endpoint para
    saber si ya existe una amenaza muy cercana (posible duplicado) y
    para estimar a cuántos reportes previos se le podría sumar una
    validación en lugar de crear uno nuevo."""
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


@app.get("/volunteer-calls/nearby")
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


@app.get("/stats/summary")
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
