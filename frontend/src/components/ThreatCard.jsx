import { ThumbsUp, ThumbsDown, MapPin } from 'lucide-react'

export const CATEGORY_LABELS = {
  incendios_forestales: 'Incendios forestales',
  animales_en_peligro: 'Animales en peligro',
  deforestacion: 'Deforestación',
  dano_ecosistemas: 'Daño a ecosistemas',
  reforestacion: 'Reforestación',
}

const STATUS_LABELS = {
  sin_validar: 'Sin validar',
  confirmado: 'Confirmado',
  descartado: 'Descartado',
  resuelto: 'Resuelto',
}

export default function ThreatCard({ threat, onVote, voting, hasVoted }) {
  const {
    title,
    description,
    category,
    status,
    confirmations = 0,
    dismissals = 0,
    distance_km,
    created_at,
  } = threat

  const when = created_at
    ? new Date(created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
    : null

  return (
    <article className="threat-card">
      <div className="row-top">
        <h3>{title}</h3>
        <span className={`badge badge-status-${status}`}>{STATUS_LABELS[status] || status}</span>
      </div>

      {threat.photo_url && (
        <img
          src={threat.photo_url}
          alt={`Evidencia del reporte: ${title}`}
          style={{
            display: 'block',
            width: '100%',
            maxHeight: 240,
            objectFit: 'cover',
            borderRadius: 8,
            marginTop: 12,
          }}
        />
      )}

      {description && <p className="desc">{description}</p>}

      <div className="meta-row">
        <span>{CATEGORY_LABELS[category] || category}</span>
        {typeof distance_km === 'number' && (
          <span>
            <MapPin size={12} style={{ verticalAlign: -1 }} /> {distance_km.toFixed(1)} km
          </span>
        )}
        {when && <span>{when}</span>}
      </div>

      {onVote && (
        <div className="vote-row">
          <button
            className="btn-confirm"
            disabled={voting || hasVoted}
            onClick={() => onVote(threat.id, true)}
          >
            <ThumbsUp size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            Sí, estoy viendo ({confirmations})
          </button>
          <button
            className="btn-dismiss"
            disabled={voting || hasVoted}
            onClick={() => onVote(threat.id, false)}
          >
            <ThumbsDown size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            No lo estoy viendo ({dismissals})
          </button>
        </div>
      )}
    </article>
  )
}
