import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  CheckCircle,
  QrCode,
  Settings,
} from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import HuellaIcon from '../components/HuellaIcon'

const STATUS_LABEL = {
  open: 'Abierto',
  closed: 'Cerrado',
  done: 'Finalizado',
  draft: 'Borrador',
}

export default function VolunteerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [event, setEvent] = useState(null)
  const [regCount, setRegCount] = useState(0)
  const [myReg, setMyReg] = useState(null)  // mi inscripción
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [msg, setMsg] = useState(null) // { type: 'ok'|'err', text }

  const isMyEvent = event?.ong_id === user?.id

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // Evento
      const { data: ev, error } = await supabase
        .from('volunteer_events')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      setEvent(ev)

      // Conteo de inscritos
      const { count } = await supabase
        .from('volunteer_registrations')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', id)
      setRegCount(count ?? 0)

      // Mi inscripción
      if (user?.id) {
        const { data: reg } = await supabase
          .from('volunteer_registrations')
          .select('*')
          .eq('event_id', id)
          .eq('user_id', user.id)
          .maybeSingle()
        setMyReg(reg)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [id, user?.id])

  useEffect(() => {
    load()
  }, [load])

  const handleJoin = async () => {
    if (!user) return
    setJoining(true)
    setMsg(null)
    try {
      const { error } = await supabase.from('volunteer_registrations').insert({
        event_id: id,
        user_id: user.id,
      })
      if (error) throw error
      setMsg({ type: 'ok', text: '¡Te has inscrito exitosamente! 🎉' })
      load()
    } catch (err) {
      setMsg({ type: 'err', text: err.message })
    } finally {
      setJoining(false)
    }
  }

  const handleLeave = async () => {
    if (!myReg || myReg.attended) return
    setJoining(true)
    setMsg(null)
    try {
      const { error } = await supabase
        .from('volunteer_registrations')
        .delete()
        .eq('id', myReg.id)
      if (error) throw error
      setMsg({ type: 'ok', text: 'Inscripción cancelada.' })
      setMyReg(null)
      load()
    } catch (err) {
      setMsg({ type: 'err', text: err.message })
    } finally {
      setJoining(false)
    }
  }

  if (loading) return <div className="loading-row">Cargando evento...</div>
  if (!event) return <div className="loading-row">Evento no encontrado.</div>

  const dateStr = new Date(event.event_date).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const canJoin = event.status === 'open' && !myReg

  return (
    <div className="section-screen" style={{ paddingBottom: 90 }}>
      {/* Header */}
      <header
        className="topbar"
        style={{ display: 'flex', alignItems: 'center', gap: 10 }}
      >
        <button
          onClick={() => navigate('/voluntariados')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: '#1a3d2b',
          }}
        >
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ margin: 0, fontSize: 17 }}>Detalle del voluntariado</h1>
      </header>

      <div style={{ padding: '0 16px' }}>
        {/* Estado badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: event.status === 'open' ? '#2e7d32' : '#757575',
              background: event.status === 'open' ? '#e8f5e9' : '#f5f5f5',
              borderRadius: 8,
              padding: '3px 10px',
            }}
          >
            {STATUS_LABEL[event.status] ?? event.status}
          </span>
          <span
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700, color: '#2e7d32' }}
          >
            <HuellaIcon size={15} variant="gradient" />
            +{event.huellas_reward.toLocaleString('es-CO')} huellas al asistir
          </span>
        </div>

        {/* Título */}
        <h2 style={{ margin: '0 0 8px', fontSize: 20, color: '#1a3d2b' }}>{event.title}</h2>

        {event.description && (
          <p style={{ color: '#444', fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>
            {event.description}
          </p>
        )}

        {/* Info */}
        <div
          style={{
            background: '#f1f8e9',
            borderRadius: 14,
            padding: '14px 16px',
            marginBottom: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <InfoRow icon={<Calendar size={15} />} text={dateStr} />
          {event.location_name && (
            <InfoRow icon={<MapPin size={15} />} text={event.location_name} />
          )}
          {event.lat && event.lng && (
            <div style={{ marginTop: 2, paddingLeft: 23 }}>
              <a
                href={`https://www.google.com/maps?q=${event.lat},${event.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 12,
                  color: '#2e7d32',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                📍 Ver en Google Maps ({event.lat.toFixed(4)}, {event.lng.toFixed(4)})
              </a>
            </div>
          )}
          <InfoRow
            icon={<Users size={15} />}
            text={`${regCount} ${regCount === 1 ? 'persona inscrita' : 'personas inscritas'} en la prelista`}
          />
        </div>

        {/* Mensaje de feedback */}
        {msg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              marginBottom: 14,
              background: msg.type === 'ok' ? '#e8f5e9' : '#ffebee',
              color: msg.type === 'ok' ? '#2e7d32' : '#c62828',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {msg.text}
          </div>
        )}

        {/* Ya asistí */}
        {myReg?.attended && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#e8f5e9',
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 14,
              color: '#2e7d32',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            <CheckCircle size={18} />
            Asistencia confirmada — ¡ya ganaste tus huellas!
          </div>
        )}

        {/* Acciones del ciudadano */}
        {!isMyEvent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {canJoin && (
              <button className="btn-primary" onClick={handleJoin} disabled={joining}>
                {joining ? 'Inscribiendo...' : '✋ Inscribirme'}
              </button>
            )}

            {myReg && !myReg.attended && (
              <>
                <button
                  onClick={() => navigate(`/voluntariados/${id}/checkin`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '13px',
                    background: 'linear-gradient(135deg, #1565c0, #1976d2)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 14,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <QrCode size={18} />
                  Registrar asistencia (QR / código)
                </button>
                <button
                  onClick={handleLeave}
                  disabled={joining}
                  style={{
                    padding: '11px',
                    background: 'none',
                    border: '1.5px solid #bbb',
                    borderRadius: 14,
                    fontSize: 14,
                    color: '#555',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar inscripción
                </button>
              </>
            )}

          </div>
        )}

        {/* Acciones del organizador ONG */}
        {isMyEvent && (
          <button
            onClick={() => navigate(`/voluntariados/${id}/gestionar`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
              padding: '13px',
              background: 'linear-gradient(135deg, #2e7d32, #43a047)',
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Settings size={18} />
            Gestionar evento (QR, prelista, código)
          </button>
        )}
      </div>
    </div>
  )
}

function InfoRow({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#2e7d32', fontWeight: 600 }}>
      {icon}
      <span style={{ color: '#333', fontWeight: 400 }}>{text}</span>
    </div>
  )
}
