import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import TopBar from '../components/TopBar'
import ThreatCard from '../components/ThreatCard'
import { useGeolocation } from '../lib/useGeolocation'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { getAllLocalReports, REPORT_TTL_MS } from '../lib/offlineDb'
import { useNetwork } from '../context/NetworkContext'

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
  const { user, refreshProfile } = useAuth()
  const { syncVersion, isSyncing, isOnline, pendingCount, triggerSync } = useNetwork()
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
      const TWO_HOURS_MS = REPORT_TTL_MS || 2 * 60 * 60 * 1000
      const cutoff = new Date(Date.now() - TWO_HOURS_MS).toISOString()

      const latitudeDelta = REPORT_RADIUS_KM / 110.574
      const longitudeDelta = Math.min(
        180,
        REPORT_RADIUS_KM /
          (111.32 * Math.max(Math.cos((position.lat * Math.PI) / 180), 0.01))
      )

      let rows = []
      if (supabase && navigator.onLine) {
        try {
          const { data, error: threatsError } = await supabase
            .from('threats')
            .select('id, title, description, category, lat, lng, status, photo_url, created_at')
            .gte('created_at', cutoff)
            .gte('lat', position.lat - latitudeDelta)
            .lte('lat', position.lat + latitudeDelta)
            .gte('lng', position.lng - longitudeDelta)
            .lte('lng', position.lng + longitudeDelta)

          if (!threatsError && data) {
            rows = data
          }
        } catch (fetchErr) {
          console.warn('No se pudo consultar Supabase para el feed:', fetchErr)
        }
      }

      const nearby = rows.filter(
        (threat) => distanceKm(position, { lat: threat.lat, lng: threat.lng }) <= REPORT_RADIUS_KM
      )
      let validations = []

      if (nearby.length > 0 && supabase && navigator.onLine) {
        try {
          const { data, error: validationsError } = await supabase
            .from('threat_validations')
            .select('threat_id, user_id, confirms')
            .in('threat_id', nearby.map((threat) => threat.id))

          if (!validationsError && data) {
            validations = data
          }
        } catch (vErr) {
          console.warn('No se pudieron consultar validaciones:', vErr)
        }
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

      const remoteFormatted = nearby.map((threat) => ({
        ...threat,
        ...voteCounts[threat.id],
        distance_km: distanceKm(position, { lat: threat.lat, lng: threat.lng }),
        synced: true,
      }))

      // Cargar reportes locales de IndexedDB (< 2 horas)
      let localFormatted = []
      try {
        const locals = await getAllLocalReports()
        const now = Date.now()
        localFormatted = locals
          .filter((item) => now - new Date(item.created_at).getTime() <= TWO_HOURS_MS)
          .filter((item) => !item.synced || !remoteFormatted.some((rt) => rt.id === item.remote_id))
          .map((item) => ({
            id: item.localId,
            localId: item.localId,
            title: item.title,
            description: item.description,
            category: item.category,
            lat: item.lat,
            lng: item.lng,
            status: 'sin_validar',
            photo_url: null,
            local_photo_url: item.photo_blob ? URL.createObjectURL(item.photo_blob) : null,
            created_at: item.created_at,
            confirmations: 0,
            dismissals: 0,
            distance_km: distanceKm(position, { lat: item.lat, lng: item.lng }),
            synced: item.synced,
          }))
          .filter((item) => item.distance_km <= REPORT_RADIUS_KM)
      } catch (idbErr) {
        console.warn('Error leyendo reportes locales para el feed:', idbErr)
      }

      // Combinar y ordenar del más reciente al más antiguo
      const combined = [...localFormatted, ...remoteFormatted].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      setThreats(combined)
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
  }, [load, syncVersion])

  async function handleVote(threatId, confirms) {
    const target = threats.find((t) => t.id === threatId)
    if (target?.synced === false) {
      setLoadError('Este reporte aún está pendiente de sincronización en la nube.')
      return
    }
    setVotingId(threatId)
    setLoadError(null)
    try {
      const { error } = await supabase
        .from('threat_validations')
        .insert({ threat_id: threatId, user_id: user.id, confirms })
      if (error) throw error

      // Procesar recompensas de huellas (vía RPC de respaldo si el trigger no ha corrido)
      try {
        await supabase.rpc('process_threat_validation_rewards', { target_threat_id: threatId })
      } catch {
        // El trigger SQL en Supabase lo ejecuta automáticamente
      }

      await refreshProfile?.()
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

      {pendingCount > 0 && (
        <div
          style={{
            fontfamily: 'Inter, sans-serif',
            background: 'rgba(230, 126, 34, 0.12)',
            border: '1px solid rgba(230, 126, 34, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '13px', color: '#b35400', fontWeight: 500 }}>
            <strong>{pendingCount} reporte(s) guardado(s)</strong> en este teléfono.
          </div>
          <button
            type="button"
            className="btn"
            disabled={isSyncing || !isOnline}
            onClick={() => triggerSync()}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              background: '#e67e22',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: isSyncing || !isOnline ? 'not-allowed' : 'pointer',
              opacity: isSyncing || !isOnline ? 0.6 : 1,
            }}
          >
            {isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}
          </button>
        </div>
      )}

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
