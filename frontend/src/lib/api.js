async function request(path, options = {}) {
  const res = await fetch(path, {
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
  health: () => request('/api/health'),
  threatsNearby: (lat, lng, radiusKm = 5) =>
    request(`/api/threats/nearby?lat=${lat}&lng=${lng}&radius_km=${radiusKm}`),
  checkDuplicates: (lat, lng, radiusMeters = 300) =>
    request('/api/threats/check-duplicates', {
      method: 'POST',
      body: JSON.stringify({ lat, lng, radius_meters: radiusMeters }),
    }),
  volunteerCallsNearby: (lat, lng, radiusKm = 15) =>
    request(`/api/volunteer-calls/nearby?lat=${lat}&lng=${lng}&radius_km=${radiusKm}`),
  statsSummary: () => request('/api/stats/summary'),
}
