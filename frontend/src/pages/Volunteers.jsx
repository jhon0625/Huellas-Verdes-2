import { useEffect, useState } from 'react'
import { HandHeart, Users } from 'lucide-react'
import TopBar from '../components/TopBar'
import { useGeolocation } from '../lib/useGeolocation'
import { api } from '../lib/api'

export default function Volunteers() {
  const { position } = useGeolocation()
  const [calls, setCalls] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .volunteerCallsNearby(position.lat, position.lng, 40)
      .then(setCalls)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [position.lat, position.lng])

  return (
    <>
      <TopBar title="Voluntariados" subtitle="Convocatorias activas de ONG cerca de ti" />

      {loading && <div className="loading-row">Buscando convocatorias...</div>}

      {!loading && calls.length === 0 && (
        <div className="empty-state">
          <HandHeart size={30} style={{ marginBottom: 10, opacity: 0.5 }} />
          <h3>Sin convocatorias por ahora</h3>
          <p>
            Cuando una ONG cree una convocatoria ligada a un reporte cercano, aparecerá
            aquí automáticamente.
          </p>
        </div>
      )}

      {!loading && calls.length > 0 && (
        <div className="threat-list">
          {calls.map((c) => (
            <article key={c.id} className="threat-card">
              <div className="row-top">
                <h3>{c.title}</h3>
              </div>
              {c.description && <p className="desc">{c.description}</p>}
              <div className="meta-row">
                <span>
                  <Users size={12} style={{ verticalAlign: -1 }} /> {c.needed_volunteers} voluntarios buscados
                </span>
                {typeof c.distance_km === 'number' && <span>{c.distance_km.toFixed(1)} km</span>}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
