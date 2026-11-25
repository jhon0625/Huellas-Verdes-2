import React, { createContext, useContext, useState, useRef, useCallback } from 'react'
import { X, Info, Sparkles } from 'lucide-react'
import { HELP_CONTENT } from '../constants/helpContent'

const HelpContext = createContext(null)

export function HelpProvider({ children }) {
  const [activeHelp, setActiveHelp] = useState(null)

  const openHelp = useCallback((helpKeyOrData) => {
    if (typeof helpKeyOrData === 'string') {
      const data = HELP_CONTENT[helpKeyOrData] || {
        title: 'Información',
        description: 'No hay descripción disponible para este botón.',
      }
      setActiveHelp(data)
    } else if (helpKeyOrData && typeof helpKeyOrData === 'object') {
      setActiveHelp(helpKeyOrData)
    }
  }, [])

  const closeHelp = useCallback(() => {
    setActiveHelp(null)
  }, [])

  return (
    <HelpContext.Provider value={{ openHelp, closeHelp, activeHelp }}>
      {children}
      {activeHelp && (
        <HelpModal help={activeHelp} onClose={closeHelp} />
      )}
    </HelpContext.Provider>
  )
}

export function useHelp() {
  const context = useContext(HelpContext)
  if (!context) {
    throw new Error('useHelp debe usarse dentro de un HelpProvider')
  }
  return context
}

/**
 * Hook para detectar pulsación prolongada (Long Press).
 * Funciona tanto en dispositivos táctiles (celulares) como con mouse (computador).
 *
 * @param {string|object} helpKey Clave en HELP_CONTENT o un objeto con { title, description }
 * @param {object} options Opciones como delay (ms) y onClick para no anular clics normales
 */
export function useLongPressHelp(helpKey, options = {}) {
  const { onClick: userOnClick, delay = 500 } = options
  const { openHelp } = useHelp()
  const timerRef = useRef(null)
  const isLongPressRef = useRef(false)

  const start = useCallback((e) => {
    isLongPressRef.current = false
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true
      // Si el dispositivo soporta vibración háptica, genera una pequeña pulsación
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(45)
        } catch {
          // Ignorar si no está permitido
        }
      }
      openHelp(helpKey)
    }, delay)
  }, [openHelp, helpKey, delay])

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const handleClick = useCallback((e) => {
    // Si fue un toque largo, cancelamos la acción normal (como navegar)
    if (isLongPressRef.current) {
      e.preventDefault()
      e.stopPropagation()
      isLongPressRef.current = false
      return
    }

    // Si fue un toque rápido normal, ejecutamos el onClick original
    if (userOnClick) {
      userOnClick(e)
    }
  }, [userOnClick])

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: cancel,
    onClick: handleClick,
  }
}

/**
 * Ventana emergente (Modal de Ayuda).
 */
function HelpModal({ help, onClose }) {
  return (
    <div 
      className="help-modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="help-modal-card" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar X */}
        <button 
          className="help-modal-close" 
          onClick={onClose} 
          aria-label="Cerrar ayuda"
          type="button"
        >
          <X size={18} />
        </button>

        {/* Encabezado con ícono */}
        <div className="help-modal-header">
          <div className="help-modal-icon-badge">
            <Info size={24} />
          </div>
          <div className="help-modal-titles">
            <span className="help-modal-tag">
              <Sparkles size={12} /> Ayuda de la App
            </span>
            <h3 className="help-modal-title">{help.title}</h3>
          </div>
        </div>

        {/* Cuerpo de la descripción */}
        <div className="help-modal-body">
          <p>{help.description}</p>
        </div>

        {/* Pie con botón de confirmación */}
        <div className="help-modal-footer">
          <button 
            type="button" 
            className="help-modal-ok-btn" 
            onClick={onClose}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
