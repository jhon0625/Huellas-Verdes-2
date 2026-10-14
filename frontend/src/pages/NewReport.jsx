import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Camera, Video, X } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { CATEGORY_LABELS } from '../components/ThreatCard'

const PHOTO_BUCKET = 'threat-photos'
const MAX_PHOTO_SIZE = 5 * 1024 * 1024

function createPhotoId() {
  const cryptoApi = globalThis.crypto
  if (typeof cryptoApi?.randomUUID === 'function') return cryptoApi.randomUUID()

  if (typeof cryptoApi?.getRandomValues === 'function') {
    const bytes = cryptoApi.getRandomValues(new Uint8Array(16))
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// Campos adicionales por categoría para hacer el formulario dinámico
const CATEGORY_FIELDS = {
  incendios_forestales: [
    {
      id: 'magnitud',
      label: 'Magnitud del incendio',
      type: 'select',
      options: [
        'Foco pequeño (humo visible, área reducida)',
        'Incendio moderado (varias hectáreas)',
        'Incendio descontrolado (gran extensión, fuera de control)',
      ],
    },
  ],
  animales_en_peligro: [
    {
      id: 'estado_animal',
      label: 'Estado del animal',
      type: 'select',
      options: ['Herido', 'Atropellado', 'Atrapado', 'Libre y en zona urbana'],
    },
    {
      id: 'tipo_animal',
      label: 'Tipo de animal',
      type: 'select',
      options: ['Ave', 'Mamífero', 'Reptil', 'Anfibio'],
    },
  ],
  deforestacion: [
    {
      id: 'metodo',
      label: 'Método de deforestación',
      type: 'select',
      options: [
        'Uso de maquinaria pesada',
        'Quema',
        'Tala manual (árboles talados)',
      ],
    },
  ],
  dano_ecosistemas: [
    {
      id: 'clasificacion',
      label: 'Clasificación del daño',
      type: 'select',
      options: [
        'Vertimiento de residuos',
        'Contaminación del embalse',
        'Desplazamiento de fauna',
        'Minería ilegal',
      ],
    },
    {
      id: 'descripcion_breve',
      label: 'Descripción breve del daño',
      type: 'text',
      placeholder: 'Ej: Tubería vertiendo líquidos oscuros al río',
    },
  ],
  reforestacion: [
    {
      id: 'tipo_actividad',
      label: 'Tipo de actividad',
      type: 'select',
      options: ['Jornada de siembra', 'Mantenimiento'],
    },
  ],
}

// Estilos reutilizables
const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  fontSize: '14px',
  fontFamily: "'Inter', sans-serif",
  color: '#1a3d2b',
  background: 'rgba(255, 255, 255, 0.45)',
  border: '1.5px solid rgba(100, 180, 130, 0.25)',
  borderRadius: '16px',
  outline: 'none',
}

const selectStyle = { ...inputStyle, appearance: 'none' }

const labelStyle = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#1a3d2b',
  marginBottom: '6px',
  display: 'block',
}

const mediaBtnStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  padding: '20px 10px',
  background: 'rgba(255, 255, 255, 0.3)',
  border: '2px dashed rgba(100, 180, 130, 0.4)',
  borderRadius: '16px',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  minHeight: '120px',
}

export default function NewReport() {
  const [searchParams] = useSearchParams()
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const navigate = useNavigate()
  const { user } = useAuth()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('incendios_forestales')

  // Campos dinámicos
  const [dynamicData, setDynamicData] = useState({})

  // Imagen
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // Video
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const [videoError, setVideoError] = useState(null)
  const videoRef = useRef(null)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Reset campos dinámicos al cambiar de categoría
  useEffect(() => {
    setDynamicData({})
  }, [category])

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const handleDynamicChange = (id, value) => {
    setDynamicData((prev) => ({ ...prev, [id]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Selecciona un archivo de imagen válido.')
      e.target.value = ''
      return
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setError('La foto no puede superar los 5 MB.')
      e.target.value = ''
      return
    }

    setError(null)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleVideoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setVideoError(null)

    // Validar duración del video (máximo 30 segundos)
    const url = URL.createObjectURL(file)
    const tempVideo = document.createElement('video')
    tempVideo.preload = 'metadata'
    tempVideo.onloadedmetadata = () => {
      URL.revokeObjectURL(tempVideo.src)
      if (tempVideo.duration > 30) {
        setVideoError('El video no puede durar más de 30 segundos. Graba uno más corto.')
        setVideoFile(null)
        setVideoPreview(null)
      } else {
        setVideoFile(file)
        setVideoPreview(URL.createObjectURL(file))
      }
    }
    tempVideo.onerror = () => {
      setVideoError('No se pudo leer el video. Intenta de nuevo.')
    }
    tempVideo.src = url
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const removeVideo = () => {
    setVideoFile(null)
    setVideoPreview(null)
    setVideoError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!lat || !lng) {
      setError('No se pudo obtener la ubicación. Vuelve al mapa e intenta de nuevo.')
      return
    }

    // Validar que los campos dinámicos requeridos estén llenos
    const fields = CATEGORY_FIELDS[category] || []
    for (const field of fields) {
      if (!dynamicData[field.id]) {
        setError(`Por favor completa el campo: ${field.label}`)
        return
      }
    }

    setSubmitting(true)
    setError(null)

    // Construir descripción completa con datos dinámicos
    let fullDescription = description
    if (Object.keys(dynamicData).length > 0) {
      const fieldLabels = {}
      fields.forEach((f) => {
        fieldLabels[f.id] = f.label
      })
      const details = Object.entries(dynamicData)
        .map(([k, v]) => `${fieldLabels[k] || k}: ${v}`)
        .join('\n')
      fullDescription += '\n\nDetalles adicionales:\n' + details
    }

    let uploadedPhotoPath = null

    try {
      let photoUrl = null

      if (imageFile) {
        const photoPath = `${user.id}/${createPhotoId()}`
        const { error: uploadError } = await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(photoPath, imageFile, {
            cacheControl: '3600',
            contentType: imageFile.type,
            upsert: false,
          })

        if (uploadError) {
          throw new Error('No se pudo subir la foto. Detalles: ' + uploadError.message)
        }

        uploadedPhotoPath = photoPath
        photoUrl = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(photoPath).data.publicUrl
      }

      const { error: insertError } = await supabase.from('threats').insert({
        reporter_id: user.id,
        title: title,
        description: fullDescription || null,
        category: category,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        photo_url: photoUrl,
      })

      if (insertError) {
        throw new Error(
          'No se pudo publicar el reporte. Intenta de nuevo. Detalles: ' +
            insertError.message
        )
      }
    } catch (submitError) {
      if (uploadedPhotoPath) {
        const { error: cleanupError } = await supabase.storage
          .from(PHOTO_BUCKET)
          .remove([uploadedPhotoPath])
        if (cleanupError) console.error('No se pudo limpiar la foto subida:', cleanupError)
      }

      setError(submitError.message || 'No se pudo publicar el reporte. Intenta de nuevo.')
      setSubmitting(false)
      return
    }

    setSubmitting(false)

    setSuccess(true)
    setTimeout(() => {
      navigate(`/mapa?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`)
    }, 2500)
  }

  if (success) {
    return (
      <div className="login-screen">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <div className="login-logo">
            <CheckCircle size={30} color="#3a9d5e" />
          </div>
          <h1 className="login-title">¡Reporte publicado!</h1>
          <p className="login-subtitle">
            Gracias por ayudar a proteger nuestro entorno. Redirigiendo al
            mapa...
          </p>
        </div>
      </div>
    )
  }

  const currentFields = CATEGORY_FIELDS[category] || []

  return (
    <div
      className="login-screen"
      style={{ padding: '20px', alignItems: 'flex-start', overflowY: 'auto' }}
    >
      <button
        onClick={() => navigate('/mapa')}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 10,
          background: 'rgba(255,255,255,0.5)',
          border: 'none',
          borderRadius: '50%',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
        }}
      >
        <ArrowLeft size={20} color="#1a3d2b" />
      </button>

      <div
        className="login-card"
        style={{ marginTop: '50px', width: '100%', padding: '30px 20px' }}
      >
        <div
          className="login-logo"
          style={{ width: 60, height: 60, marginBottom: 15 }}
        >
          <img src="/logo.png" alt="Huellas Verdes Logo" />
        </div>

        <h1 className="login-title" style={{ fontSize: '22px' }}>
          Crear Reporte
        </h1>
        <p
          className="login-subtitle"
          style={{ marginBottom: '20px' }}
        >
          Ubicación: {parseFloat(lat).toFixed(4)},{' '}
          {parseFloat(lng).toFixed(4)}
        </p>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          {/* Categoría */}
          <div className="field" style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Categoría de amenaza</label>
            <div className="login-field">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={selectStyle}
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Título */}
          <div className="field" style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Título descriptivo</label>
            <div className="login-field">
              <input
                required
                maxLength={80}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Incendio en la ladera norte"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Campos dinámicos según categoría */}
          {currentFields.map((field) => (
            <div className="field" style={{ marginBottom: 12 }} key={field.id}>
              <label style={labelStyle}>{field.label}</label>
              <div className="login-field">
                {field.type === 'select' ? (
                  <select
                    value={dynamicData[field.id] || ''}
                    onChange={(e) =>
                      handleDynamicChange(field.id, e.target.value)
                    }
                    style={selectStyle}
                  >
                    <option value="">Seleccione una opción</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={dynamicData[field.id] || ''}
                    onChange={(e) =>
                      handleDynamicChange(field.id, e.target.value)
                    }
                    placeholder={field.placeholder}
                    style={inputStyle}
                  />
                )}
              </div>
            </div>
          ))}

          {/* Evidencia: Foto y Video */}
          <div className="field" style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Evidencia (foto y/o video)</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {/* Botón foto */}
              <label style={mediaBtnStyle}>
                {imagePreview ? (
                  <div style={{ position: 'relative', width: '100%' }}>
                    <img
                      src={imagePreview}
                      alt="Evidencia fotográfica"
                      style={{
                        width: '100%',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeImage()
                      }}
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        background: '#e74c3c',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Camera
                      size={28}
                      color="#4a9e6a"
                      style={{ marginBottom: 6 }}
                    />
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#3d6b4e',
                        fontWeight: 500,
                        textAlign: 'center',
                      }}
                    >
                      Tomar foto
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  disabled={submitting}
                  onChange={handleImageChange}
                  style={{
                    opacity: 0,
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                  }}
                />
              </label>

              {/* Botón video */}
              <label style={mediaBtnStyle}>
                {videoPreview ? (
                  <div style={{ position: 'relative', width: '100%' }}>
                    <video
                      ref={videoRef}
                      src={videoPreview}
                      style={{
                        width: '100%',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
                      muted
                      playsInline
                      controls
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeVideo()
                      }}
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        background: '#e74c3c',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Video
                      size={28}
                      color="#4a9e6a"
                      style={{ marginBottom: 6 }}
                    />
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#3d6b4e',
                        fontWeight: 500,
                        textAlign: 'center',
                      }}
                    >
                      Grabar video
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#7a9e8a',
                        marginTop: 2,
                      }}
                    >
                      Máx. 30 seg
                    </span>
                  </>
                )}
                {/* capture="environment" abre la cámara nativa para grabar video */}
                <input
                  type="file"
                  accept="video/*"
                  capture="environment"
                  onChange={handleVideoChange}
                  style={{
                    opacity: 0,
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                  }}
                />
              </label>
            </div>
            {videoError && (
              <p
                style={{
                  color: '#e74c3c',
                  fontSize: '12px',
                  marginTop: '6px',
                  fontWeight: 500,
                }}
              >
                {videoError}
              </p>
            )}
          </div>

          {/* Detalles opcionales */}
          <div className="field" style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Detalles (opcional)</label>
            <div className="login-field">
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Información adicional útil..."
                maxLength={500}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          <button className="login-btn" type="submit" disabled={submitting}>
            {submitting ? 'Enviando...' : 'Publicar reporte'}
          </button>
        </form>
      </div>
    </div>
  )
}
