import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import TopBar from '../components/TopBar'
import ThreatCard from '../components/ThreatCard'
import { useGeolocation } from '../lib/useGeolocation'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { api } from '../lib/api'

export default function Feed() {
  const { position } = useGeolocation()
  const { user } = useAuth()
  const [threats, setThreats] = useState([])
  const [myVotes, setMyVotes] = useState({})
  const [loading, setLoading] = useState(true)
  const [votingId, setVotingId] = useState(null)
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [data, votesRes] = await Promise.all([
        api.threatsNearby(position.lat, position.lng, 50),
        supabase.from('threat_validations').select('threat_id, confirms').eq('user_id', user.id),
      ])
      setThreats(data)
      const votesMap = {}
      for (const v of votesRes.data || []) votesMap[v.threat_id] = v.confirms
      setMyVotes(votesMap)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [position.lat, position.lng, user.id])

  useEffect(() => {
    load()
  }, [load])

  async function handleVote(threatId, confirms) {
    setVotingId(threatId)
    const { error } = await supabase
      .from('threat_validations')
      .insert({ threat_id: threatId, user_id: user.id, confirms })
    setVotingId(null)
    if (!error) {
      setMyVotes((prev) => ({ ...prev, [threatId]: confirms }))
      load()
    }
  }

  return (
    <>
      <TopBar title="Reportes cercanos" subtitle="Valida lo que otros vecinos han visto" />

      <button
        className="btn btn-primary"
        type="button"
        onClick={() => {
          navigate(`/reportar?lat=${position.lat}&lng=${position.lng}`)
        }}
        style={{ margin: '14px 20px 0', width: 'calc(100% - 40px)' }}
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
    </>
  )
}
