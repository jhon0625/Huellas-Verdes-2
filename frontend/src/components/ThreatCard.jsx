import { ThumbsUp, ThumbsDown, MapPin } from 'lucide-react'
import HuellaIcon from './HuellaIcon'

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

  const photoSrc = threat.photo_url || threat.local_photo_url

  return (
    <article className="threat-card">
      <div className="row-top">
        <h3>{title}</h3>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          {threat.synced === false && (
            <span
              className="badge"
              style={{
                background: '#e67e22',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              ⏳ Local
            </span>
          )}
          {confirmations >= 3 && (
            <span
              className="badge"
              style={{
                background: '#2e7d32',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Este reporte fue verificado por 3 o más personas (+1.000 huellas al creador)"
            >
              <HuellaIcon size={12} variant="solid" color="#ffffff" />
              Verificado (+1.000)
            </span>
          )}
          {dismissals >= 3 && (
            <span
              className="badge"
              style={{
                background: '#c0392b',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 600,
              }}
              title="Este reporte acumuló 3 o más descartes (-1.000 huellas)"
            >
              ⚠️ Descartado (-1.000)
            </span>
          )}
          <span className={`badge badge-status-${status}`}>{STATUS_LABELS[status] || status}</span>
        </div>
      </div>

      {photoSrc && (
        <img
          src={photoSrc}
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

      {threat.synced === false ? (
        <div
          style={{
            padding: '8px 12px',
            marginTop: 10,
            borderRadius: 8,
            background: 'rgba(230, 126, 34, 0.1)',
            color: '#b35400',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>⏳ Guardado localmente. Se sincronizará con la comunidad al tener conexión.</span>
        </div>
      ) : (
        onVote && (
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
        )
      )}
    </article>
  )
}
