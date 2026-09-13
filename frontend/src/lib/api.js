const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Error ${res.status} en ${path}: ${text}`)
  }
  return res.json()
}

export const api = {
  health: () => request('/health'),
  threatsNearby: (lat, lng, radiusKm = 5) =>
    request(`/threats/nearby?lat=${lat}&lng=${lng}&radius_km=${radiusKm}`),
  checkDuplicates: (lat, lng, radiusMeters = 300) =>
    request('/threats/check-duplicates', {
      method: 'POST',
      body: JSON.stringify({ lat, lng, radius_meters: radiusMeters }),
    }),
  volunteerCallsNearby: (lat, lng, radiusKm = 15) =>
    request(`/volunteer-calls/nearby?lat=${lat}&lng=${lng}&radius_km=${radiusKm}`),
  statsSummary: () => request('/stats/summary'),
}
