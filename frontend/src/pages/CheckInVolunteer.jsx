import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, Keyboard, CheckCircle, Loader } from 'lucide-react'
import jsQR from 'jsqr'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import HuellaIcon from '../components/HuellaIcon'

export default function CheckInVolunteer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()

  const [mode, setMode] = useState('qr')   // 'qr' | 'manual'
  const [manualCode, setManualCode] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)  // { ok, huellas_earned, event_title, error }
  const [verifying, setVerifying] = useState(false)
  const [cameraError, setCameraError] = useState(null)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setScanning(false)
  }, [])

  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  const startCamera = async () => {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setScanning(true)
      scanFrame()
    } catch (err) {
      setCameraError('No se pudo acceder a la cámara: ' + err.message)
    }
  }

  const scanFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanFrame)
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)

    if (code?.data) {
      // Formato esperado: hv://checkin/{event_id}/{code}
      const match = code.data.match(/^hv:\/\/checkin\/([^/]+)\/([A-Z0-9]+)$/)
      if (match) {
        stopCamera()
        const [, scannedEventId, scannedCode] = match
        verify(scannedEventId, scannedCode)
        return
      }
    }

    rafRef.current = requestAnimationFrame(scanFrame)
  }

  const verify = async (eventId, code) => {
    setVerifying(true)
    setResult(null)
    try {
      const { data, error } = await supabase.rpc('verify_volunteer_checkin', {
        p_event_id: eventId,
        p_code: code.toUpperCase(),
      })
      if (error) throw error
      setResult(data)
      if (data.ok) refreshProfile()
    } catch (err) {
      setResult({ ok: false, error: err.message })
    } finally {
      setVerifying(false)
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (!manualCode.trim()) return
    verify(id, manualCode.trim())
  }

  return (
    <div className="section-screen" style={{ paddingBottom: 90 }}>
      {/* Header */}
      <header
        className="topbar"
        style={{ display: 'flex', alignItems: 'center', gap: 10 }}
      >
        <button
          onClick={() => { stopCamera(); navigate(`/voluntariados/${id}`) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#1a3d2b' }}
        >
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ margin: 0, fontSize: 17 }}>Registrar asistencia</h1>
      </header>

      <div style={{ padding: '0 16px' }}>
        {/* Resultado */}
        {result && (
          <div
            style={{
              borderRadius: 16,
              padding: '20px',
              marginBottom: 20,
              textAlign: 'center',
              background: result.ok ? '#e8f5e9' : '#ffebee',
              border: `1.5px solid ${result.ok ? '#a5d6a7' : '#ef9a9a'}`,
            }}
          >
            {result.ok ? (
              <>
                <CheckCircle size={40} color="#2e7d32" style={{ marginBottom: 8 }} />
                <h3 style={{ margin: '0 0 6px', color: '#1a3d2b', fontSize: 18 }}>
                  ¡Asistencia confirmada!
                </h3>
                <p style={{ margin: '0 0 12px', color: '#444', fontSize: 14 }}>
                  {result.event_title}
                </p>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#fff',
                    borderRadius: 12,
                    padding: '10px 20px',
                    fontWeight: 800,
                    fontSize: 20,
                    color: '#2e7d32',
                  }}
                >
                  <HuellaIcon size={22} variant="gradient" />
                  +{result.huellas_earned?.toLocaleString('es-CO')} huellas
                </div>
              </>
            ) : (
              <>
                <span style={{ fontSize: 36 }}>❌</span>
                <h3 style={{ margin: '8px 0 4px', color: '#c62828', fontSize: 16 }}>
                  No se pudo registrar
                </h3>
                <p style={{ color: '#555', fontSize: 13 }}>{result.error}</p>
                <button
                  onClick={() => { setResult(null); setManualCode('') }}
                  style={{
                    marginTop: 10,
                    padding: '9px 20px',
                    background: '#c62828',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Intentar de nuevo
                </button>
              </>
            )}
          </div>
        )}

        {!result && (
          <>
            {/* Tabs: QR vs Manual */}
            <div
              style={{
                display: 'flex',
                background: '#f1f8e9',
                borderRadius: 12,
                padding: 4,
                marginBottom: 20,
              }}
            >
              {[
                { key: 'qr', icon: <Camera size={15} />, label: 'Escanear QR' },
                { key: 'manual', icon: <Keyboard size={15} />, label: 'Código manual' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { stopCamera(); setMode(tab.key) }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px',
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 13,
                    background: mode === tab.key ? '#fff' : 'transparent',
                    color: mode === tab.key ? '#2e7d32' : '#888',
                    boxShadow: mode === tab.key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {verifying && (
              <div style={{ textAlign: 'center', padding: 30 }}>
                <Loader size={30} className="spin" color="#2e7d32" />
                <p style={{ color: '#2e7d32', fontWeight: 600, marginTop: 10 }}>
                  Verificando...
                </p>
              </div>
            )}

            {!verifying && mode === 'qr' && (
              <div style={{ textAlign: 'center' }}>
                {/* Video viewfinder */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 320,
                    margin: '0 auto 16px',
                    borderRadius: 18,
                    overflow: 'hidden',
                    background: '#000',
                    aspectRatio: '1 / 1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: scanning ? 'block' : 'none',
                    }}
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  {!scanning && (
                    <div style={{ color: '#fff', opacity: 0.5, fontSize: 13, textAlign: 'center', padding: 20 }}>
                      Toca el botón para activar la cámara
                    </div>
                  )}
                  {/* Visor overlay */}
                  {scanning && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        border: '3px solid rgba(255,255,255,0.4)',
                        borderRadius: 18,
                        pointerEvents: 'none',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: '25%',
                          left: '25%',
                          right: '25%',
                          bottom: '25%',
                          border: '2.5px solid #69f0ae',
                          borderRadius: 10,
                        }}
                      />
                    </div>
                  )}
                </div>

                {cameraError && (
                  <p style={{ color: '#c62828', fontSize: 13, marginBottom: 10 }}>
                    {cameraError}
                  </p>
                )}

                {!scanning ? (
                  <button
                    onClick={startCamera}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      margin: '0 auto',
                      padding: '13px 28px',
                      background: 'linear-gradient(135deg, #2e7d32, #43a047)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 14,
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Camera size={18} />
                    Activar cámara
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    style={{
                      padding: '10px 22px',
                      background: 'none',
                      border: '1.5px solid #bbb',
                      borderRadius: 12,
                      fontSize: 13,
                      color: '#555',
                      cursor: 'pointer',
                    }}
                  >
                    Cancelar
                  </button>
                )}

                <p style={{ fontSize: 12, color: '#888', marginTop: 14 }}>
                  Apunta la cámara al QR que muestra el organizador del evento.
                </p>
              </div>
            )}

            {!verifying && mode === 'manual' && (
              <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Código del evento (6 caracteres)</label>
                  <input
                    className="form-input"
                    type="text"
                    maxLength={6}
                    placeholder="Ej: AB3X7K"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    style={{
                      textAlign: 'center',
                      fontSize: 24,
                      fontWeight: 900,
                      letterSpacing: 8,
                      fontFamily: 'monospace',
                    }}
                    autoFocus
                    autoComplete="off"
                    autoCapitalize="characters"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={manualCode.length !== 6}
                >
                  Confirmar asistencia
                </button>
                <p style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>
                  Pide el código de 6 letras al organizador del evento.
                </p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
