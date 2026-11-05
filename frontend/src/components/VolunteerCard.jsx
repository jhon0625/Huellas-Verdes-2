import { Calendar, MapPin, Users } from 'lucide-react'
import HuellaIcon from './HuellaIcon'

const STATUS_LABEL = {
  open: { label: 'Abierto', color: '#2e7d32' },
  closed: { label: 'Cerrado', color: '#c62828' },
  done: { label: 'Finalizado', color: '#757575' },
  draft: { label: 'Borrador', color: '#f57c00' },
}

export default function VolunteerCard({ event, registrationCount = 0, onClick }) {
  const st = STATUS_LABEL[event.status] ?? STATUS_LABEL.open
  const dateStr = new Date(event.event_date).toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
  })

  return (
    <article
      className="threat-card volunteer-card"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Estado + recompensa */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: st.color,
            background: st.color + '18',
            borderRadius: 8,
            padding: '2px 8px',
            letterSpacing: 0.3,
          }}
        >
          {st.label}
        </span>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            fontWeight: 700,
            color: '#2e7d32',
          }}
        >
          <HuellaIcon size={14} variant="gradient" />
          +{event.huellas_reward.toLocaleString('es-CO')} huellas
        </span>
      </div>

      {/* Título */}
      <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#1a3d2b' }}>
        {event.title}
      </h3>

      {event.description && (
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 13,
            color: '#555',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.description}
        </p>
      )}

      {/* Metadatos */}
      <div className="meta-row" style={{ flexWrap: 'wrap', gap: '6px 14px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Calendar size={12} />
          {dateStr}
        </span>
        {event.location_name && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={12} />
            {event.location_name}
          </span>
        )}
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Users size={12} />
          {registrationCount} {registrationCount === 1 ? 'inscrito' : 'inscritos'}
        </span>
      </div>
    </article>
  )
}
