import React, { useState, useRef, useEffect } from 'react'
import {
  Camera,
  Upload,
  Leaf,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  MapPin,
  ShieldCheck,
  Info,
  Trash2,
  Award,
  Clock,
  RefreshCw
} from 'lucide-react'
import { supabase } from '../supabaseClient'

const STORAGE_KEY = 'huellas_education_chat_history'
const ONE_HOUR_MS = 60 * 60 * 1000 // 1 hora en milisegundos

// Reduce el peso de la foto antes de enviarla al backend para acelerar el análisis
const compressImageToBlob = (file, maxWidth = 800) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (blob) => resolve(blob || file),
          'image/jpeg',
          0.8
        )
      }
      img.onerror = () => resolve(file)
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  })
}

// Comprime la imagen para guardarla de forma ligera en el historial local
const compressImageToDataUrl = (file, maxWidth = 420) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.75))
      }
      img.onerror = () => resolve(event.target.result)
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  })
}

// Lee el historial y descarta automáticamente los mensajes con más de 1 hora
const getValidHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    const now = Date.now()
    const valid = parsed.filter((item) => now - item.timestamp < ONE_HOUR_MS)

    if (valid.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(valid))
    }
    return valid
  } catch {
    return []
  }
}

export default function Education() {
  const [history, setHistory] = useState(() => getValidHistory())
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [rewardMessage, setRewardMessage] = useState(null)

  const fileInputRef = useRef(null)

  // Revisa cada minuto si algún mensaje cumplió la hora para limpiarlo
  useEffect(() => {
    const interval = setInterval(() => {
      setHistory(getValidHistory())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const saveHistory = (newHistory) => {
    setHistory(newHistory)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
    } catch {
      const trimmed = newHistory.slice(0, 5)
      setHistory(trimmed)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setErrorMsg(null)
    setRewardMessage(null)
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setErrorMsg(null)
    setRewardMessage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const rewardUserHuellas = async (amount = 200) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('huellas')
        .eq('id', user.id)
        .single()

      const currentHuellas = data?.huellas ?? 0
      const { error } = await supabase
        .from('profiles')
        .update({ huellas: currentHuellas + amount })
        .eq('id', user.id)

      if (!error) {
        setRewardMessage(`¡Ganaste +${amount} Huellas por explorar la biodiversidad! 🐾`)
      }
    } catch (err) {
      console.log('No se pudieron sumar huellas:', err)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return

    setLoading(true)
    setErrorMsg(null)
    setRewardMessage(null)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)

    try {
      const compressedBlob = await compressImageToBlob(selectedFile)
      const formData = new FormData()
      formData.append('file', compressedBlob, 'species.jpg')

      const response = await fetch('/api/identify-species', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'No se pudo conectar con el servidor de análisis.')
      }

      if (!data.es_ser_vivo) {
        setErrorMsg(data.mensaje_error || 'No se detectó una planta o animal claro en la foto.')
      } else {
        const compressedImg = await compressImageToDataUrl(selectedFile)
        const newEntry = {
          id: Date.now(),
          timestamp: Date.now(),
          image: compressedImg,
          species: data
        }

        const currentValid = getValidHistory()
        saveHistory([newEntry, ...currentValid])

        handleReset()
        await rewardUserHuellas(200)
      }
    } catch (err) {
      clearTimeout(timeoutId)
      if (err.name === 'AbortError') {
        setErrorMsg('La IA tardó más de un minuto en responder. Intenta de nuevo en unos segundos.')
      } else {
        setErrorMsg(err.message || 'Ocurrió un error al analizar la imagen.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClearHistory = () => {
    localStorage.removeItem(STORAGE_KEY)
    setHistory([])
    setRewardMessage(null)
    setErrorMsg(null)
  }

  const getRemainingMinutes = (timestamp) => {
    const elapsed = Date.now() - timestamp
    const remaining = Math.max(1, Math.ceil((ONE_HOUR_MS - elapsed) / 60000))
    return remaining
  }

  const getAlertConfig = (nivel) => {
    if (nivel === 'peligro') {
      return {
        bg: '#ffebee',
        border: '#ef5350',
        titleColor: '#b71c1c',
        textColor: '#7f0000',
        title: '¡Precaución! Especie venenosa o de riesgo',
        Icon: AlertTriangle
      }
    }
    if (nivel === 'precaucion') {
      return {
        bg: '#fff8e1',
        border: '#ffb300',
        titleColor: '#e65100',
        textColor: '#5d4037',
        title: 'Recomendación de seguridad',
        Icon: ShieldAlert
      }
    }
    return {
      bg: '#e3f2fd',
      border: '#64b5f6',
      titleColor: '#0d47a1',
      textColor: '#1a237e',
      title: 'Seguridad y convivencia',
      Icon: Info
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: '#f3efe6',
      paddingBottom: '90px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        backgroundColor: '#c8e6c9',
        minHeight: '100vh',
        padding: '20px 16px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>

        {/* Encabezado */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2e7d32',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
            }}>
              <Leaf size={24} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1b4332' }}>
                Explorador Natural IA
              </h1>
              <p style={{ margin: 0, fontSize: '12px', color: '#2d6a4f', fontWeight: '500' }}>
                Tus descubrimientos se guardan por 1 hora
              </p>
            </div>
          </div>

          {/* Botones laterales derechos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {previewUrl && (
              <button
                onClick={handleReset}
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px',
                  cursor: 'pointer',
                  color: '#1b4332',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}
                title="Quitar foto / Nueva foto"
              >
                <RefreshCw size={18} />
              </button>
            )}

            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 10px',
                  cursor: 'pointer',
                  color: '#c62828',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}
                title="Vaciar chat"
              >
                <Trash2 size={15} /> Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Zona de Captura / Carga de Foto */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%',
                padding: '24px 16px',
                borderRadius: '16px',
                border: '2px dashed #74c69d',
                backgroundColor: '#f4f9f5',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#d8f3dc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2d6a4f',
                marginBottom: '8px'
              }}>
                <Camera size={24} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1b4332' }}>
                Enviar nueva foto al chat
              </span>
              <span style={{ fontSize: '12px', color: '#52796f', marginTop: '3px' }}>
                Sube una planta, flor, ave o insecto para identificarlo
              </span>
            </div>
          ) : (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <img
                src={previewUrl}
                alt="Vista previa de especie"
                style={{
                  width: '100%',
                  maxHeight: '220px',
                  objectFit: 'cover',
                  borderRadius: '14px',
                  border: '2px solid #d8f3dc'
                }}
              />

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '12px',
                    border: '1.5px solid #2d6a4f',
                    backgroundColor: '#ffffff',
                    color: '#2d6a4f',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Upload size={16} /> Cambiar
                </button>

                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: loading ? '#74c69d' : '#2d6a4f',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: loading ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={16} />
                  {loading ? 'Analizando especie...' : 'Identificar con IA'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Banner de Recompensa */}
        {rewardMessage && (
          <div style={{
            backgroundColor: '#e8f5e9',
            border: '1.5px solid #4caf50',
            color: '#1b5e20',
            padding: '12px 14px',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Award size={18} />
            <span>{rewardMessage}</span>
          </div>
        )}

        {/* Mensaje de Error */}
        {errorMsg && (
          <div style={{
            backgroundColor: '#ffebee',
            border: '1.5px solid #ef9a9a',
            color: '#c62828',
            padding: '14px',
            borderRadius: '16px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '2px' }}>No pudimos identificar una especie</strong>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Historial estilo Chat (vigencia 1 hora) */}
        {history.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '4px' }}>
            {history.map((entry) => {
              const item = entry.species
              const minsLeft = getRemainingMinutes(entry.timestamp)
              const alertStyle = getAlertConfig(item.nivel_alerta)
              const AlertIcon = alertStyle.Icon

              return (
                <div key={entry.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  {/* Burbuja del Usuario (Foto enviada) */}
                  <div style={{
                    alignSelf: 'flex-end',
                    maxWidth: '80%',
                    backgroundColor: '#2d6a4f',
                    color: '#ffffff',
                    padding: '10px',
                    borderRadius: '18px 18px 4px 18px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    <img
                      src={entry.image}
                      alt={item.nombre_comun}
                      style={{
                        width: '100%',
                        maxHeight: '160px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        marginBottom: '6px'
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', opacity: 0.9 }}>
                      <span>¿Qué especie es esta?</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '8px' }}>
                        <Clock size={11} /> {minsLeft}m
                      </span>
                    </div>
                  </div>

                  {/* Burbuja de Respuesta de la IA */}
                  <div style={{
                    alignSelf: 'flex-start',
                    width: '100%',
                    backgroundColor: '#ffffff',
                    borderRadius: '4px 20px 20px 20px',
                    padding: '16px',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    border: '2px solid #95d5b2',
                    boxSizing: 'border-box'
                  }}>
                    {/* Cabecera */}
                    <div style={{ borderBottom: '1px solid #e8f5e9', paddingBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{
                          backgroundColor: '#d8f3dc',
                          color: '#1b4332',
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          textTransform: 'uppercase'
                        }}>
                          {item.categoria}
                        </span>
                        <span style={{
                          backgroundColor: '#fff3e0',
                          color: '#e65100',
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '4px 10px',
                          borderRadius: '20px'
                        }}>
                          {item.estado_conservacion}
                        </span>
                      </div>

                      <h2 style={{ margin: '4px 0 2px 0', fontSize: '19px', color: '#1b4332', fontWeight: '900' }}>
                        {item.nombre_comun}
                      </h2>
                      <p style={{ margin: 0, fontSize: '13px', color: '#52796f', fontStyle: 'italic' }}>
                        {item.nombre_cientifico}
                      </p>
                    </div>

                    {/* 1. PRIMERO: Advertencia / Recomendación de Seguridad */}
                    {item.advertencia_seguridad && (
                      <div style={{
                        backgroundColor: alertStyle.bg,
                        border: `1.5px solid ${alertStyle.border}`,
                        padding: '12px',
                        borderRadius: '14px',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'flex-start'
                      }}>
                        <AlertIcon size={19} color={alertStyle.titleColor} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong style={{ fontSize: '12px', color: alertStyle.titleColor, display: 'block' }}>
                            {alertStyle.title}
                          </strong>
                          <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: alertStyle.textColor, lineHeight: '1.4', fontWeight: '500' }}>
                            {item.advertencia_seguridad}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 2. Hábitat */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <MapPin size={17} color="#2d6a4f" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong style={{ fontSize: '12px', color: '#1b4332', display: 'block' }}>Hábitat Natural</strong>
                        <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#333', lineHeight: '1.4' }}>
                          {item.habitat}
                        </p>
                      </div>
                    </div>

                    {/* 3. Rol Ecológico */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <Leaf size={17} color="#2d6a4f" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong style={{ fontSize: '12px', color: '#1b4332', display: 'block' }}>Importancia en el Ecosistema</strong>
                        <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#333', lineHeight: '1.4' }}>
                          {item.rol_ecologico}
                        </p>
                      </div>
                    </div>

                    {/* 4. Dato Curioso */}
                    <div style={{
                      backgroundColor: '#f4f9f5',
                      padding: '10px 12px',
                      borderRadius: '14px',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start'
                    }}>
                      <Info size={17} color="#40916c" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong style={{ fontSize: '12px', color: '#1b4332', display: 'block' }}>¿Sabías qué?</strong>
                        <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#2d6a4f', lineHeight: '1.4' }}>
                          {item.dato_curioso}
                        </p>
                      </div>
                    </div>

                    {/* 5. Consejo de Protección */}
                    <div style={{
                      backgroundColor: '#e8f5e9',
                      padding: '10px 12px',
                      borderRadius: '14px',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start'
                    }}>
                      <ShieldCheck size={17} color="#1b4332" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong style={{ fontSize: '12px', color: '#1b4332', display: 'block' }}>¿Cómo protegerla?</strong>
                        <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#1b4332', lineHeight: '1.4' }}>
                          {item.consejo_proteccion}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}