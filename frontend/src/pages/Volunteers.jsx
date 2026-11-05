import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { HandHeart, Plus } from 'lucide-react'
import TopBar from '../components/TopBar'
import VolunteerCard from '../components/VolunteerCard'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Volunteers() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [counts, setCounts] = useState({})  // { [event_id]: number }
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('volunteer_events')
        .select('*')
        .in('status', ['open', 'closed', 'done'])
        .order('event_date', { ascending: true })

      if (error) throw error
      setEvents(data ?? [])

      // Cargar conteo de inscripciones para cada evento
      if (data && data.length > 0) {
        const ids = data.map((e) => e.id)
        const { data: regs } = await supabase
          .from('volunteer_registrations')
          .select('event_id')
          .in('event_id', ids)

        const countMap = {}
        ;(regs ?? []).forEach((r) => {
          countMap[r.event_id] = (countMap[r.event_id] ?? 0) + 1
        })
        setCounts(countMap)
      }
    } catch (err) {
      console.error('Error cargando voluntariados:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="section-screen section-screen-volunteers">
      <TopBar title="Voluntariados" subtitle="Convocatorias activas de ONG cerca de ti" />

      <div className="page-intro page-intro-volunteers">
        <div>
          <span className="page-intro-kicker">Acción colectiva</span>
          <h2>Manos que cuidan el territorio</h2>
          <p>Inscríbete, participa y gana huellas por cuidar el planeta.</p>
        </div>
        <HandHeart size={27} />
      </div>

      {/* Botón para crear evento — disponible para todos */}
      <button
        onClick={() => navigate('/voluntariados/crear')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          margin: '0 16px 16px',
          padding: '12px 20px',
          background: 'linear-gradient(135deg, #2e7d32, #43a047)',
          color: '#fff',
          border: 'none',
          borderRadius: 14,
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(46,125,50,0.35)',
        }}
      >
        <Plus size={18} />
        Crear convocatoria
      </button>

      {loading && <div className="loading-row">Buscando convocatorias...</div>}

      {!loading && events.length === 0 && (
        <div className="empty-state">
          <HandHeart size={30} style={{ marginBottom: 10, opacity: 0.5 }} />
          <h3>Sin convocatorias por ahora</h3>
          <p>
            Cuando una ONG publique una actividad de voluntariado, aparecerá aquí.
          </p>
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className="threat-list">
          {events.map((ev) => (
            <VolunteerCard
              key={ev.id}
              event={ev}
              registrationCount={counts[ev.id] ?? 0}
              onClick={() => navigate(`/voluntariados/${ev.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
