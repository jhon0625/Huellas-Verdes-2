import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useNavigate } from 'react-router-dom'
import { MapPin, AlertTriangle, Leaf, ChevronRight } from 'lucide-react'
import { useGeolocation } from '../lib/useGeolocation'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

// Custom dog-paw icon (pre-built SVG as data URI)
const PAW_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="%231F3D2B" d="M226.5 92.9c14.3 42.9-.3 86.2-32.6 96.8s-70.1-15.6-84.4-58.5 .3-86.2 32.6-96.8 70.1 15.6 84.4 58.5zM100.4 198.6c18.9 32.4 14.3 70.1-10.2 84.1s-59.7-.9-78.5-33.3S-2.7 179.3 21.8 165.3s59.7 .9 78.5 33.3zm327.2 0c18.9-32.4 53.9-45.2 78.5-33.3s29.1 51.7 10.2 84.1-53.9 45.2-78.5 33.3-29.1-51.7-10.2-84.1zM285.5 92.9c14.3-42.9 51.7-70.7 84.4-58.5s46.9 53.9 32.6 96.8-51.7 70.7-84.4 58.5-46.9-53.9-32.6-96.8zM405.7 310.5c-2.6-33.3-27.8-55-65.4-83.2-5.6-4.2-11.5-8.6-17.7-13.3-10.1-7.7-37.5-27.3-61.5-27.3h-8.8c-41.4 0-79 27.3-79.3 27.5-6.2 4.7-12.1 9.1-17.7 13.3-37.6 28.2-62.8 49.9-65.4 83.2-1.5 19.3 6.3 39.6 21.7 56.9 15.5 17.4 36.5 29.2 59.1 33.1 9.7 1.7 20.2 2.5 31.4 2.5 26.2 0 49.5-5.8 59.5-8.4 3.5-.9 5.8-1.5 7.5-1.5s4 .6 7.5 1.5c10 2.6 33.3 8.4 59.5 8.4 11.2 0 21.7-.9 31.4-2.5 22.6-3.9 43.6-15.7 59.1-33.1 15.4-17.3 23.2-37.6 21.7-56.9z"/></svg>'
const pawIconUrl = 'data:image/svg+xml;base64,' + btoa(PAW_SVG)

const pawIcon = new L.Icon({
  iconUrl: pawIconUrl,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
})

// Blue dot icon for user location
const USER_DOT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="%233a9d5e" stroke="white" stroke-width="3"/></svg>'
const userDotUrl = 'data:image/svg+xml;base64,' + btoa(USER_DOT_SVG)
const userIcon = new L.Icon({
  iconUrl: userDotUrl,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

export default function MapView() {
  const navigate = useNavigate()
  const { position, status } = useGeolocation()
  const { user } = useAuth()
  const [threats, setThreats] = useState([])

  const loadThreats = useCallback(async () => {
    try {
      const data = await api.threatsNearby(position.lat, position.lng, 25)
      setThreats(data)
    } catch (e) {
      console.error('Error loading threats', e)
    }
  }, [position.lat, position.lng])

  useEffect(() => {
    loadThreats()
  }, [loadThreats])

  // Click on the map opens the report page with lat/lng params
  function ClickHandler() {
    useMapEvents({
      click(e) {
        const lat = e.latlng.lat
        const lng = e.latlng.lng
        navigate('/reportar?lat=' + lat + '&lng=' + lng)
      },
    })
    return null
  }

  return (
    <div className="dashboard-screen">
      {/* Header with logo */}
      <header className="dashboard-header">
        <div className="dashboard-logo-wrap">
          <img src="/logo.png" alt="Huellas Verdes" className="dashboard-logo-img" />
        </div>
        <div className="dashboard-header-text">
          <span className="dashboard-kicker">Panel ciudadano</span>
          <h1 className="dashboard-title">Huellas Verdes</h1>
          <div className="dashboard-status">
            <span className={`dashboard-status-dot ${status === 'locating' ? 'is-loading' : ''}`} />
            {status === 'locating' ? 'Ubicando tu posición…' : 'Tu zona está activa'}
          </div>
        </div>
      </header>

      {/* Stats row */}
      <div className="dashboard-stats">
        <div className="dashboard-stat-card">
          <AlertTriangle size={18} color="#B98A1D" />
          <span className="dashboard-stat-num">{threats.length}</span>
          <span className="dashboard-stat-label">Reportes cercanos</span>
        </div>
        <div className="dashboard-stat-card">
          <MapPin size={18} color="#3a9d5e" />
          <span className="dashboard-stat-num">
            {status === 'locating' ? '...' : 'Activa'}
          </span>
          <span className="dashboard-stat-label">Ubicación</span>
        </div>
        <div className="dashboard-stat-card">
          <Leaf size={18} color="#2E5A3D" />
          <span className="dashboard-stat-num">5km</span>
          <span className="dashboard-stat-label">Radio</span>
        </div>
      </div>

      <section className="dashboard-mission-card" aria-label="Misión ambiental">
        <div className="dashboard-mission-icon">
          <Leaf size={21} />
        </div>
        <div className="dashboard-mission-copy">
          <span className="dashboard-mission-eyebrow">Cuidar empieza cerca</span>
          <h2>Haz visible lo que necesita protección</h2>
          <p>Cada observación ayuda a que la comunidad reaccione a tiempo.</p>
          <div className="dashboard-eco-tags">
            <span>Bosques Talados</span>
            <span>Agua Contaminada</span>
            <span>Fauna Animal</span>
            <span>Incendios Forestales</span>
          </div>
        </div>
      </section>


    {/* Instructions card */}
      <div className="dashboard-instructions-card">
        <h3 className="dashboard-instructions-title">
          <Leaf size={16} />
          ¿Cómo reportar una amenaza?
        </h3>
        <div className="dashboard-steps">
          <div className="dashboard-step">
            <div className="dashboard-step-num">1</div>
            <p>Toca cualquier punto en el mapa donde veas la amenaza ambiental.</p>
          </div>
          <div className="dashboard-step">
            <div className="dashboard-step-num">2</div>
            <p>Completa el formulario con la categoría, descripción y una foto.</p>
          </div>
          <div className="dashboard-step">
            <div className="dashboard-step-num">3</div>
            <p>¡Listo! Tu reporte será visible para toda la comunidad.</p>
          </div>
        </div>
      </div>


      {/* Map card */}
      <div className="dashboard-map-card">
        <div className="dashboard-map-label">
          <MapPin size={14} />
          <span>Mapa interactivo</span>
          <span className="dashboard-map-label-hint">Toca para reportar</span>
        </div>
        <div className="dashboard-map-container">
          <MapContainer
            center={position}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Circle
              center={[position.lat, position.lng]}
              radius={5000}
              pathOptions={{
                color: '#2a5e9b',
                fillColor: '#2a5e9b',
                fillOpacity: 0.15,
                weight: 2,
                dashArray: '6, 6',
              }}
            />
            <Marker position={position} icon={userIcon} />
            {threats.map(function (t) {
              return (
                <Marker
                  key={t.id}
                  position={{ lat: t.lat, lng: t.lng }}
                  icon={pawIcon}
                />
              )
            })}
            <ClickHandler />
          </MapContainer>
        </div>
        <div className="dashboard-map-meta">
          <span><i className="map-key map-key-user" />Tu ubicación</span>
          <span><i className="map-key map-key-threat" />Amenaza reportada</span>
        </div>
      </div>

      

      {/* Quick action button */}
      <button
        className="dashboard-action-btn"
        onClick={function () {
          navigate('/reportar?lat=' + position.lat + '&lng=' + position.lng)
        }}
      >
        <span>Crear reporte en mi ubicación</span>
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
