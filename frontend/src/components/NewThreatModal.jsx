import { useState } from 'react'
import { X } from 'lucide-react'
import { CATEGORY_LABELS } from './ThreatCard'

export default function NewThreatModal({ position, onClose, onSubmit, submitting, error }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('deforestacion')

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ title, description, category, lat: position.lat, lng: position.lng })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>Reportar amenaza</h2>
            <p className="hint">
              Se registrará en tu ubicación actual ({position.lat.toFixed(4)}, {position.lng.toFixed(4)}).
            </p>
          </div>
          <button className="btn-ghost" style={{ padding: 8 }} onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="title">¿Qué está pasando?</label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Tala de árboles en la ribera"
              required
              maxLength={80}
            />
          </div>

          <div className="field">
            <label htmlFor="category">Categoría</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="description">Detalles (opcional)</label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe lo que observas: tamaño, hace cuánto ocurre, si hay personas involucradas..."
              maxLength={500}
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Enviando...' : 'Publicar reporte'}
          </button>
        </form>
      </div>
    </div>
  )
}
