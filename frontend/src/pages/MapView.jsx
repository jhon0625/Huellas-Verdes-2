import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Plus } from 'lucide-react'
import TopBar from '../components/TopBar'
import NewThreatModal from '../components/NewThreatModal'
import { CATEGORY_LABELS } from '../components/ThreatCard'
import { useGeolocation } from '../lib/useGeolocation'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { api } from '../lib/api'

// Iconos por color según nivel de confianza / estado.
const iconFor = (status) => {
  const color = { sin_validar: '#8A7A4E', confirmado: '#B98A1D', descartado: '#A2481F', resuelto: '#2E5A3D' }[status] || '#1F3D2B'
  return L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

const meIcon = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 0 0 4px rgba(37,99,235,.25)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

function Recenter({ position }) {
  const map = useMap()
  useEffect(() => {
    map.setView([position.lat, position.lng], map.getZoom())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position.lat, position.lng])
  return null
}

function ClickCatcher({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

export default function MapView() {
  const { position, status } = useGeolocation()
  const { user } = useAuth()
  const [threats, setThreats] = useState([])
  const [loading, setLoading] = useState(true)
  const [draftPosition, setDraftPosition] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const loadThreats = useCallback(async () => {
    try {
      const data = await api.threatsNearby(position.lat, position.lng, 25)
      setThreats(data)
    } catch (err) {
      console.error('No se pudieron cargar las amenazas cercanas', err)
    } finally {
      setLoading(false)
    }
  }, [position.lat, position.lng])

  useEffect(() => {
    loadThreats()
  }, [loadThreats])

  async function handleCreateThreat(payload) {
    setSubmitting(true)
    setFormError(null)
    const { error } = await supabase.from('threats').insert({
      reporter_id: user.id,
      title: payload.title,
      description: payload.description || null,
      category: payload.category,
      lat: payload.lat,
      lng: payload.lng,
    })
    setSubmitting(false)
    if (error) {
      setFormError('No se pudo publicar el reporte. Intenta de nuevo.')
      return
    }
    setDraftPosition(null)
    loadThreats()
  }

  return (
    <>
      <TopBar
        title="Mapa de amenazas"
        subtitle={
          status === 'locating'
            ? 'Ubicando tu posición...'
            : `${threats.length} reportes en un radio de 25 km`
        }
      />

      <div className="map-wrap">
        <MapContainer center={[position.lat, position.lng]} zoom={13} zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Recenter position={position} />
          <ClickCatcher onPick={setDraftPosition} />

          <Marker position={[position.lat, position.lng]} icon={meIcon}>
            <Popup>Tu ubicación actual</Popup>
          </Marker>

          {threats.map((t) => (
            <Marker key={t.id} position={[t.lat, t.lng]} icon={iconFor(t.status)}>
              <Popup>
                <strong>{t.title}</strong>
                <br />
                {CATEGORY_LABELS[t.category] || t.category}
                <br />
                {t.confirmations} confirmaciones · {t.dismissals} descartes
              </Popup>
            </Marker>
          ))}

          {draftPosition && (
            <Marker position={[draftPosition.lat, draftPosition.lng]} icon={iconFor('sin_validar')} />
          )}
        </MapContainer>
      </div>

      <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--ink-soft)', margin: '10px 20px 0' }}>
        Toca cualquier punto del mapa para marcar el lugar exacto de una amenaza.
      </p>

      <button className="fab" onClick={() => setDraftPosition(position)} aria-label="Reportar amenaza">
        <Plus size={26} />
      </button>

      {draftPosition && (
        <NewThreatModal
          position={draftPosition}
          onClose={() => setDraftPosition(null)}
          onSubmit={handleCreateThreat}
          submitting={submitting}
          error={formError}
        />
      )}
    </>
  )
}
