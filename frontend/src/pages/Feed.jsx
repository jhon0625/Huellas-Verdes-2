import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import TopBar from '../components/TopBar'
import ThreatCard from '../components/ThreatCard'
import { useGeolocation } from '../lib/useGeolocation'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'

const REPORT_RADIUS_KM = 50

function distanceKm(from, to) {
  const radians = (degrees) => (degrees * Math.PI) / 180
  const latitudeDelta = radians(to.lat - from.lat)
  const longitudeDelta = radians(to.lng - from.lng)
  const arc =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(from.lat)) *
      Math.cos(radians(to.lat)) *
      Math.sin(longitudeDelta / 2) ** 2

  return 6371 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc))
}

export default function Feed() {
  const { position } = useGeolocation()
  const { user } = useAuth()
  const [threats, setThreats] = useState([])
  const [myVotes, setMyVotes] = useState({})
  const [loading, setLoading] = useState(true)
  const [votingId, setVotingId] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const latitudeDelta = REPORT_RADIUS_KM / 110.574
      const longitudeDelta = Math.min(
        180,
        REPORT_RADIUS_KM /
          (111.32 * Math.max(Math.cos((position.lat * Math.PI) / 180), 0.01))
      )
      const { data: rows, error: threatsError } = await supabase
        .from('threats')
        .select('id, title, description, category, lat, lng, status, photo_url, created_at')
        .gte('lat', position.lat - latitudeDelta)
        .lte('lat', position.lat + latitudeDelta)
        .gte('lng', position.lng - longitudeDelta)
        .lte('lng', position.lng + longitudeDelta)

      if (threatsError) throw threatsError

      const nearby = (rows || []).filter(
        (threat) => distanceKm(position, { lat: threat.lat, lng: threat.lng }) <= REPORT_RADIUS_KM
      )
      let validations = []

      if (nearby.length > 0) {
        const { data, error: validationsError } = await supabase
          .from('threat_validations')
          .select('threat_id, user_id, confirms')
          .in('threat_id', nearby.map((threat) => threat.id))

        if (validationsError) throw validationsError
        validations = data || []
      }

      const voteCounts = {}
      const votesMap = {}
      for (const vote of validations) {
        if (!voteCounts[vote.threat_id]) {
          voteCounts[vote.threat_id] = { confirmations: 0, dismissals: 0 }
        }
        if (vote.confirms) voteCounts[vote.threat_id].confirmations += 1
        else voteCounts[vote.threat_id].dismissals += 1
        if (vote.user_id === user.id) votesMap[vote.threat_id] = vote.confirms
      }

      setThreats(
        nearby.map((threat) => ({
          ...threat,
          ...voteCounts[threat.id],
          distance_km: distanceKm(position, { lat: threat.lat, lng: threat.lng }),
        }))
      )
      setMyVotes(votesMap)
    } catch (err) {
      console.error(err)
      setLoadError('No se pudieron cargar los reportes. ' + (err.message || 'Intenta de nuevo.'))
    } finally {
      setLoading(false)
    }
  }, [position.lat, position.lng, user.id])

  useEffect(() => {
    load()
  }, [load])

  async function handleVote(threatId, confirms) {
    setVotingId(threatId)
    setLoadError(null)
    try {
      const { error } = await supabase
        .from('threat_validations')
        .insert({ threat_id: threatId, user_id: user.id, confirms })
      if (error) throw error
      await load()
    } catch (err) {
      setLoadError('No se pudo registrar tu respuesta. ' + (err.message || 'Intenta de nuevo.'))
    } finally {
      setVotingId(null)
    }
  }

  return (
    <div className="section-screen section-screen-reports">
      <TopBar title="Reportes cercanos" subtitle="Valida lo que otros vecinos han visto" />

      <div className="page-intro">
        <div>
          <span className="page-intro-kicker">Vigilancia comunitaria</span>
          <h2>Lo que pasa cerca importa</h2>
          <p>Ayuda a confirmar las señales que necesitan atención.</p>
        </div>
        <span className="page-intro-count">{threats.length}<small>cerca</small></span>
      </div>

      {loadError && <div className="login-error" role="alert">{loadError}</div>}

      <button
        className="btn btn-primary page-primary-action"
        type="button"
        onClick={() => {
          navigate(`/reportar?lat=${position.lat}&lng=${position.lng}`)
        }}
      >
        <Plus size={18} />
        Nuevo reporte
      </button>

      {loading && <div className="loading-row">Cargando reportes...</div>}

      {!loading && threats.length === 0 && (
        <div className="empty-state">
          <h3>Aún no hay reportes cerca</h3>
          <p>Sé la primera persona en marcar una amenaza ambiental desde el mapa.</p>
        </div>
      )}

      {!loading && threats.length > 0 && (
        <div className="threat-list">
          {threats.map((t) => (
            <ThreatCard
              key={t.id}
              threat={t}
              onVote={handleVote}
              voting={votingId === t.id}
              hasVoted={t.id in myVotes}
            />
          ))}
        </div>
      )}
    </div>
  )
}
