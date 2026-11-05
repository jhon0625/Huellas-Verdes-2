import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, QrCode, Users, ToggleLeft, ToggleRight, Copy, Check } from 'lucide-react'
import QRCode from 'qrcode'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function ManageVolunteer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [event, setEvent] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [copied, setCopied] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // Evento
      const { data: ev, error } = await supabase
        .from('volunteer_events')
        .select('*')
        .eq('id', id)
        .eq('ong_id', user.id)   // solo el dueño
        .single()

      if (error) {
        navigate('/voluntariados')
        return
      }
      setEvent(ev)

      // Generar QR
      const qrContent = `hv://checkin/${ev.id}/${ev.checkin_code}`
      const dataUrl = await QRCode.toDataURL(qrContent, {
        width: 260,
        margin: 2,
        color: { dark: '#1a3d2b', light: '#f9fbe7' },
      })
      setQrDataUrl(dataUrl)

      // Prelista (inscritos)
      const { data: regs } = await supabase
        .from('volunteer_registrations')
        .select('id, registered_at, attended, attended_at, user_id, profiles(full_name)')
        .eq('event_id', id)
        .order('registered_at', { ascending: true })

      setRegistrations(regs ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [id, user?.id, navigate])

  useEffect(() => {
    if (user?.id) load()
  }, [load, user?.id])

  const toggleCode = async () => {
    if (!event) return
    setToggling(true)
    try {
      const { data, error } = await supabase.rpc('toggle_checkin_code', {
        p_event_id: id,
        p_active: !event.code_active,
      })
      if (error) throw error
      setEvent((prev) => ({ ...prev, code_active: !prev.code_active }))
    } catch (err) {
      alert('Error al cambiar el estado del código: ' + err.message)
    } finally {
      setToggling(false)
    }
  }

  const copyCode = () => {
    if (!event) return
    navigator.clipboard.writeText(event.checkin_code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (loading) return <div className="loading-row">Cargando panel de gestión...</div>
  if (!event) return <div className="loading-row">Evento no encontrado.</div>

  const attended = registrations.filter((r) => r.attended)
  const pending = registrations.filter((r) => !r.attended)

  return (
    <div className="section-screen" style={{ paddingBottom: 90 }}>
      {/* Header */}
      <header
        className="topbar"
        style={{ display: 'flex', alignItems: 'center', gap: 10 }}
      >
        <button
          onClick={() => navigate(`/voluntariados/${id}`)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#1a3d2b' }}
        >
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ margin: 0, fontSize: 17 }}>Gestionar evento</h1>
      </header>

      <div style={{ padding: '0 16px' }}>
        <h2 style={{ marginTop: 0, marginBottom: 4, fontSize: 18, color: '#1a3d2b' }}>
          {event.title}
        </h2>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 20 }}>
          {registrations.length} inscritos · {attended.length} confirmados
        </p>

        {/* ── QR Panel ── */}
        <section
          style={{
            background: '#f9fbe7',
            border: '1.5px solid #c8e6c9',
            borderRadius: 18,
            padding: 20,
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            <QrCode size={18} color="#2e7d32" />
            <span style={{ fontWeight: 700, fontSize: 15, color: '#1a3d2b' }}>
              Código de asistencia
            </span>
          </div>

          {/* QR Image */}
          {qrDataUrl && (
            <img
              src={qrDataUrl}
              alt="QR de asistencia"
              style={{
                width: 200,
                height: 200,
                borderRadius: 12,
                margin: '0 auto 14px',
                display: 'block',
                opacity: event.code_active ? 1 : 0.4,
                filter: event.code_active ? 'none' : 'grayscale(1)',
              }}
            />
          )}

          {/* Código manual */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: '#fff',
              border: '2px solid',
              borderColor: event.code_active ? '#43a047' : '#ccc',
              borderRadius: 12,
              padding: '10px 18px',
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontSize: 26,
                fontWeight: 900,
                letterSpacing: 6,
                color: event.code_active ? '#1a3d2b' : '#aaa',
                fontFamily: 'monospace',
              }}
            >
              {event.checkin_code}
            </span>
            <button
              onClick={copyCode}
              title="Copiar código"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#2e7d32',
                display: 'flex',
              }}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>

          <p style={{ fontSize: 12, color: '#666', marginBottom: 14 }}>
            {event.code_active
              ? '✅ Código activo — los voluntarios pueden usarlo para registrar asistencia.'
              : '🔒 Código desactivado — actívalo cuando empiece el evento.'}
          </p>

          {/* Toggle */}
          <button
            onClick={toggleCode}
            disabled={toggling}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              margin: '0 auto',
              padding: '11px 22px',
              background: event.code_active
                ? 'linear-gradient(135deg, #c62828, #e53935)'
                : 'linear-gradient(135deg, #2e7d32, #43a047)',
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {event.code_active ? (
              <>
                <ToggleRight size={18} /> Desactivar código
              </>
            ) : (
              <>
                <ToggleLeft size={18} /> Activar código
              </>
            )}
          </button>
        </section>

        {/* ── Prelista ── */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Users size={16} color="#2e7d32" />
            <span style={{ fontWeight: 700, fontSize: 15, color: '#1a3d2b' }}>
              Prelista ({registrations.length} {registrations.length === 1 ? 'inscrito' : 'inscritos'})
            </span>
          </div>

          {registrations.length === 0 && (
            <p style={{ color: '#888', fontSize: 13 }}>
              Nadie se ha inscrito todavía.
            </p>
          )}

          {registrations.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr style={{ background: '#e8f5e9' }}>
                    <th style={thStyle}>Nombre</th>
                    <th style={thStyle}>Inscripción</th>
                    <th style={thStyle}>Asistencia</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={tdStyle}>
                        {r.profiles?.full_name ?? r.profiles?.email ?? '(sin nombre)'}
                      </td>
                      <td style={tdStyle}>
                        {new Date(r.registered_at).toLocaleDateString('es-CO')}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        {r.attended ? (
                          <span style={{ color: '#2e7d32', fontWeight: 700 }}>✅</span>
                        ) : (
                          <span style={{ color: '#aaa' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

const thStyle = {
  padding: '8px 10px',
  textAlign: 'left',
  fontWeight: 700,
  color: '#2e7d32',
  fontSize: 12,
}
const tdStyle = {
  padding: '8px 10px',
  color: '#333',
}
