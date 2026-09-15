import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, UploadCloud, Camera } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { CATEGORY_LABELS } from '../components/ThreatCard'

// Campos adicionales por categoría para hacer el formulario dinámico
const CATEGORY_FIELDS = {
  deforestacion: [
    { id: 'area', label: 'Área estimada afectada (m² o hectáreas)', type: 'text', placeholder: 'Ej: 500 m²' },
  ],
  contaminacion_agua: [
    { id: 'water_color', label: 'Color / Aspecto del agua', type: 'text', placeholder: 'Ej: Verde oscuro, aceitoso' },
  ],
  incendio: [
    { id: 'fire_status', label: 'Estado del incendio', type: 'select', options: ['Activo', 'Controlado', 'Extinguido'] },
  ],
  caza_ilegal: [
    { id: 'animal_type', label: 'Especie(s) afectada(s)', type: 'text', placeholder: 'Ej: Aves exóticas, felinos' },
  ]
}

export default function NewReport() {
  const [searchParams] = useSearchParams()
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const navigate = useNavigate()
  const { user } = useAuth()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('deforestacion')
  
  // Campos dinámicos
  const [dynamicData, setDynamicData] = useState({})
  
  // Imagen
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Actualiza los campos dinámicos al cambiar de categoría
  useEffect(() => {
    setDynamicData({})
  }, [category])

  const handleDynamicChange = (id, value) => {
    setDynamicData(prev => ({ ...prev, [id]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!lat || !lng) {
      setError('No se pudo obtener la ubicación. Vuelve al mapa e intenta de nuevo.')
      return
    }

    setSubmitting(true)
    setError(null)

    // Aquí construiríamos la lógica para subir a Storage si se requiere
    // let imageUrl = null
    // if (imageFile) {
    //   const { data, error: uploadError } = await supabase.storage
    //     .from('report-images')
    //     .upload(`reportes/${Date.now()}_${imageFile.name}`, imageFile)
    //   if (uploadError) ...
    // }

    // Almacenamos el reporte base y concatenamos la data dinámica a la descripción por ahora
    let fullDescription = description;
    if (Object.keys(dynamicData).length > 0) {
      fullDescription += '\n\nDetalles adicionales:\n' + Object.entries(dynamicData).map(([k, v]) => `${k}: ${v}`).join('\n')
    }

    const { error: insertError } = await supabase.from('threats').insert({
      reporter_id: user.id,
      title: title,
      description: fullDescription || null,
      category: category,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      // image_url: imageUrl
    })

    setSubmitting(false)

    if (insertError) {
      setError('No se pudo publicar el reporte. Intenta de nuevo. Detalles: ' + insertError.message)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      navigate('/mapa')
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
            Gracias por ayudar a proteger nuestro entorno. Redirigiendo al mapa...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="login-screen" style={{ padding: '20px', alignItems: 'flex-start', overflowY: 'auto' }}>
      <button 
        onClick={() => navigate('/mapa')} 
        style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, background: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}
      >
        <ArrowLeft size={20} color="#1a3d2b" />
      </button>

      <div className="login-card" style={{ marginTop: '50px', width: '100%', padding: '30px 20px' }}>
        <div className="login-logo" style={{ width: 60, height: 60, marginBottom: 15 }}>
          <img src="/logo.png" alt="Huellas Verdes Logo" />
        </div>
        
        <h1 className="login-title" style={{ fontSize: '22px' }}>Crear Reporte</h1>
        <p className="login-subtitle" style={{ marginBottom: '20px' }}>
          Ubicación: {parseFloat(lat).toFixed(4)}, {parseFloat(lng).toFixed(4)}
        </p>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          
          <div className="field" style={{ marginBottom: 12 }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#1a3d2b', marginBottom: '6px', display: 'block' }}>Categoría de amenaza</label>
            <div className="login-field">
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%', padding: '14px 16px', fontSize: '14px', fontFamily: "'Inter', sans-serif",
                  color: '#1a3d2b', background: 'rgba(255, 255, 255, 0.45)', border: '1.5px solid rgba(100, 180, 130, 0.25)',
                  borderRadius: '16px', outline: 'none', appearance: 'none'
                }}
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field" style={{ marginBottom: 12 }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#1a3d2b', marginBottom: '6px', display: 'block' }}>Título descriptivo</label>
            <div className="login-field">
              <input
                required
                maxLength={80}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Tala de árboles en el bosque"
                style={{
                  width: '100%', padding: '14px 16px', fontSize: '14px', fontFamily: "'Inter', sans-serif",
                  color: '#1a3d2b', background: 'rgba(255, 255, 255, 0.45)', border: '1.5px solid rgba(100, 180, 130, 0.25)',
                  borderRadius: '16px', outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Renderizado de campos dinámicos */}
          {CATEGORY_FIELDS[category] && CATEGORY_FIELDS[category].map((field) => (
            <div className="field" style={{ marginBottom: 12 }} key={field.id}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#1a3d2b', marginBottom: '6px', display: 'block' }}>{field.label}</label>
              <div className="login-field">
                {field.type === 'select' ? (
                  <select 
                    value={dynamicData[field.id] || ''} 
                    onChange={(e) => handleDynamicChange(field.id, e.target.value)}
                    style={{
                      width: '100%', padding: '14px 16px', fontSize: '14px', fontFamily: "'Inter', sans-serif",
                      color: '#1a3d2b', background: 'rgba(255, 255, 255, 0.45)', border: '1.5px solid rgba(100, 180, 130, 0.25)',
                      borderRadius: '16px', outline: 'none', appearance: 'none'
                    }}
                  >
                    <option value="">Seleccione una opción</option>
                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={dynamicData[field.id] || ''}
                    onChange={(e) => handleDynamicChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%', padding: '14px 16px', fontSize: '14px', fontFamily: "'Inter', sans-serif",
                      color: '#1a3d2b', background: 'rgba(255, 255, 255, 0.45)', border: '1.5px solid rgba(100, 180, 130, 0.25)',
                      borderRadius: '16px', outline: 'none'
                    }}
                  />
                )}
              </div>
            </div>
          ))}

          <div className="field" style={{ marginBottom: 12 }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#1a3d2b', marginBottom: '6px', display: 'block' }}>Evidencia fotográfica</label>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              width: '100%', padding: '24px', background: 'rgba(255, 255, 255, 0.3)', border: '2px dashed rgba(100, 180, 130, 0.4)',
              borderRadius: '16px', cursor: 'pointer', position: 'relative', overflow: 'hidden'
            }}>
              {imagePreview ? (
                <img src={imagePreview} alt="Evidencia" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
              ) : (
                <>
                  <Camera size={32} color="#4a9e6a" style={{ marginBottom: 8 }} />
                  <span style={{ fontSize: '14px', color: '#3d6b4e', fontWeight: 500 }}>Toma una foto del caso</span>
                </>
              )}
              {/* input con capture="environment" abre la cámara trasera en móviles */}
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                onChange={handleImageChange}
                style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer' }}
              />
            </label>
          </div>

          <div className="field" style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#1a3d2b', marginBottom: '6px', display: 'block' }}>Detalles (opcional)</label>
            <div className="login-field">
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Información adicional útil..."
                maxLength={500}
                style={{
                  width: '100%', padding: '14px 16px', fontSize: '14px', fontFamily: "'Inter', sans-serif",
                  color: '#1a3d2b', background: 'rgba(255, 255, 255, 0.45)', border: '1.5px solid rgba(100, 180, 130, 0.25)',
                  borderRadius: '16px', outline: 'none', resize: 'vertical'
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
