import { Sprout } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import HuellaIcon from './HuellaIcon'

export default function TopBar({ title, subtitle }) {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const huellas = profile?.huellas ?? 0

  return (
    <header
      className="topbar"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="mark">
          <Sprout size={18} />
        </div>
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/perfil')}
        className="huellas-badge-pill"
        title="Tus Huellas acumuladas (toca para ver detalles)"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1.5px solid rgba(58, 157, 94, 0.35)',
          padding: '6px 13px',
          borderRadius: '20px',
          color: '#1a3d2b',
          fontSize: '13px',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 3px 10px rgba(30, 80, 50, 0.08)',
          flexShrink: 0,
        }}
      >
        <HuellaIcon size={17} variant="gradient" />
        <span>{huellas.toLocaleString('es-CO')}</span>
        <span style={{ fontSize: '11px', color: '#2e7d32', fontWeight: 600 }}>
          huellas
        </span>
      </button>
    </header>
  )
}
