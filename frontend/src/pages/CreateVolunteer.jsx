import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  FileText,
  LocateFixed,
  Sparkles,
  HandHeart,
  Clock,
  Navigation,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useGeolocation } from '../lib/useGeolocation'
import HuellaIcon from '../components/HuellaIcon'

const PIN_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%232e7d32" stroke="%23ffffff" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'
const pinIconUrl = 'data:image/svg+xml;base64,' + btoa(PIN_SVG)
const locationPinIcon = new L.Icon({
  iconUrl: pinIconUrl,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
})

function MapPicker({ coords, onChange }) {
  const map = useMap()

  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })

  useEffect(() => {
    if (coords?.lat && coords?.lng) {
      map.setView([coords.lat, coords.lng], map.getZoom())
    }
  }, [coords?.lat, coords?.lng, map])

  return coords ? (
    <Marker
      position={[coords.lat, coords.lng]}
      icon={locationPinIcon}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target
          const latlng = marker.getLatLng()
          onChange({ lat: latlng.lat, lng: latlng.lng })
        },
      }}
    />
  ) : null
}

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// Estilos consistentes con la paleta de Huellas Verdes
const inputStyle = {
  width: '100%',
  padding: '13px 15px',
  fontSize: '14.5px',
  fontFamily: "'Inter', sans-serif",
  color: '#1a3d2b',
  background: 'rgba(255, 255, 255, 0.85)',
  border: '1.5px solid rgba(100, 180, 130, 0.35)',
  borderRadius: '14px',
  outline: 'none',
  boxShadow: '0 2px 6px rgba(30, 80, 50, 0.04)',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
}

const labelStyle = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#1a3d2b',
  marginBottom: '6px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
}

export default function CreateVolunteer() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { position: gpsPosition } = useGeolocation()

  const [form, setForm] = useState({
    title: '',
    description: '',
    location_name: '',
    event_date: '',
  })

  // Coordenadas exactas para el evento (inicialmente GPS o El Peñol)
  const [coords, setCoords] = useState({
    lat: gpsPosition.lat || 6.2179,
    lng: gpsPosition.lng || -75.2435,
  })
  const [gpsLocating, setGpsLocating] = useState(false)

  // Sincronizar coordenadas cuando useGeolocation obtenga la posición
  useEffect(() => {
    if (gpsPosition.lat && gpsPosition.lng) {
      setCoords({ lat: gpsPosition.lat, lng: gpsPosition.lng })
    }
  }, [gpsPosition.lat, gpsPosition.lng])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const setField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleGetCurrentGps = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.')
      return
    }
    setGpsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
        setGpsLocating(false)
      },
      (err) => {
        console.warn('Error obteniendo GPS:', err)
        setGpsLocating(false)
        alert('No se pudo obtener la ubicación GPS precisa. Puedes tocar el mapa para marcarla.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.event_date) {
      setError('Por favor completa el título y la fecha del evento.')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const payload = {
        ong_id: user.id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        location_name: form.location_name.trim() || null,
        lat: coords.lat,
        lng: coords.lng,
        event_date: new Date(form.event_date).toISOString(),
        max_volunteers: null, // Sin límite de participantes
        huellas_reward: 5000, // Recompensa fija de 5000 huellas
        checkin_code: randomCode(),
        code_active: false,
        status: 'open',
      }

      const { data, error: err } = await supabase
        .from('volunteer_events')
        .insert(payload)
        .select('id')
        .single()

      if (err) throw err
      navigate(`/voluntariados/${data.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="section-screen"
      style={{
        paddingBottom: 110,
        minHeight: '100vh',
        background: 'var(--bg)',
      }}
    >
      {/* Barra superior con navegación */}
      <header
        className="topbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 18px 12px',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/voluntariados')}
          aria-label="Volver a voluntariados"
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            border: '1px solid rgba(100, 180, 130, 0.3)',
            borderRadius: '50%',
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#1a3d2b',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, color: '#1a3d2b' }}>
            Nueva convocatoria
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: '#3d6b4e' }}>
            Organiza una acción colectiva
          </p>
        </div>
      </header>

      {/* Intro visual consistente con la app */}
      <div className="page-intro page-intro-volunteers">
        <div>
          <span className="page-intro-kicker">Acción comunitaria</span>
          <h2>Crea un voluntariado</h2>
          <p>
            Suma vecinos y voluntarios para cuidar las fuentes de agua, bosques y fauna.
          </p>
        </div>
        <HandHeart size={27} />
      </div>

      {/* Contenedor tipo tarjeta glassmórfica */}
      <div
        style={{
          margin: '0 16px 20px',
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(255, 255, 255, 0.75)',
          borderRadius: 22,
          boxShadow: '0 8px 24px rgba(30, 80, 50, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
          padding: '20px 18px',
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Título de la actividad */}
          <div>
            <label style={labelStyle}>
              <FileText size={15} color="#2e7d32" />
              Título de la actividad *
            </label>
            <input
              type="text"
              required
              maxLength={100}
              placeholder="Ej: Siembra de árboles en la vereda El Morro"
              value={form.title}
              onChange={setField('title')}
              style={inputStyle}
            />
          </div>

          {/* Descripción */}
          <div>
            <label style={labelStyle}>
              <FileText size={15} color="#2e7d32" />
              Descripción y recomendaciones
            </label>
            <textarea
              rows={3}
              placeholder="¿Qué haremos? ¿Qué deben llevar los voluntarios? (ej: guantes, botas pantaneras, termo de agua...)"
              value={form.description}
              onChange={setField('description')}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: '85px',
                lineHeight: 1.5,
              }}
            />
          </div>

          {/* Fecha y hora */}
          <div>
            <label style={labelStyle}>
              <Clock size={15} color="#2e7d32" />
              Fecha y hora de inicio *
            </label>
            <input
              type="datetime-local"
              required
              value={form.event_date}
              onChange={setField('event_date')}
              style={inputStyle}
            />
          </div>

          {/* Recompensa fija (no editable) */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(232, 245, 233, 0.95), rgba(243, 228, 190, 0.7))',
              border: '1.5px solid rgba(58, 157, 94, 0.4)',
              borderRadius: '16px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              boxShadow: '0 3px 10px rgba(46, 125, 50, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <HuellaIcon size={28} variant="badge" />
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: '#2e7d32',
                    letterSpacing: 0.5,
                  }}
                >
                  Recompensa por asistencia
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#1a3d2b' }}>
                  +5.000 Huellas
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: '11px',
                background: '#2e7d32',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '12px',
                fontWeight: 700,
                letterSpacing: 0.3,
                flexShrink: 0,
              }}
            >
              Fija
            </span>
          </div>

          {/* Sección de Ubicación Precisa */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 6,
              }}
            >
              <label style={{ ...labelStyle, margin: 0 }}>
                <MapPin size={15} color="#2e7d32" />
                Ubicación exacta del evento
              </label>

              <button
                type="button"
                onClick={handleGetCurrentGps}
                disabled={gpsLocating}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 10px',
                  background: 'rgba(58, 157, 94, 0.12)',
                  border: '1px solid rgba(58, 157, 94, 0.3)',
                  borderRadius: '10px',
                  color: '#2e7d32',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <LocateFixed size={13} />
                {gpsLocating ? 'Obteniendo GPS...' : 'Usar mi GPS exacto'}
              </button>
            </div>

            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#555' }}>
              Toca o arrastra el pin en el mapa para marcar el punto exacto de encuentro.
            </p>

            {/* Mini mapa interactivo para selección precisa */}
            <div
              style={{
                height: 190,
                width: '100%',
                borderRadius: 16,
                overflow: 'hidden',
                border: '1.5px solid rgba(100, 180, 130, 0.35)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                position: 'relative',
              }}
            >
              <MapContainer
                center={[coords.lat, coords.lng]}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapPicker coords={coords} onChange={setCoords} />
              </MapContainer>
            </div>

            {/* Coordenadas seleccionadas */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '11.5px',
                color: '#2e7d32',
                fontWeight: 600,
                background: 'rgba(232, 245, 233, 0.6)',
                padding: '5px 10px',
                borderRadius: 8,
              }}
            >
              <Navigation size={12} />
              <span>
                Coordenadas GPS: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </span>
            </div>

            {/* Referencia o nombre del lugar */}
            <div style={{ marginTop: 4 }}>
              <input
                type="text"
                placeholder="Nombre o referencia del lugar (ej: Entrada vereda El Marial)"
                value={form.location_name}
                onChange={setField('location_name')}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Error si ocurre */}
          {error && (
            <div
              style={{
                padding: '11px 14px',
                background: '#ffebee',
                border: '1px solid #ffcdd2',
                borderRadius: 12,
                color: '#c62828',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          {/* Botón de publicación */}
          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #2e7d32, #43a047)',
              color: '#fff',
              border: 'none',
              borderRadius: 16,
              fontSize: '15.5px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 18px rgba(46, 125, 50, 0.35)',
              opacity: loading ? 0.7 : 1,
              marginTop: 6,
            }}
          >
            <Sparkles size={18} />
            {loading ? 'Publicando convocatoria...' : 'Publicar convocatoria'}
          </button>
        </form>
      </div>
    </div>
  )
}
