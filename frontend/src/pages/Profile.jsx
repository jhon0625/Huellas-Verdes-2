import { useEffect, useState } from 'react'
import { Leaf, LogOut, Award, AlertCircle, ShoppingBag } from 'lucide-react'
import TopBar from '../components/TopBar'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import HuellaIcon from '../components/HuellaIcon'

export default function Profile() {
  const { profile, user, signOut, refreshProfile } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.statsSummary().then(setStats).catch(() => setStats(null))
    refreshProfile?.()
  }, [refreshProfile])

  const huellas = profile?.huellas ?? 0

  return (
    <div className="section-screen section-screen-profile">
      <TopBar title="Tu perfil" />

      {/* Tarjeta de usuario */}
      <div className="profile-card">
        <div className="profile-avatar">{profile?.avatar_emoji || '🌱'}</div>
        <h3 className="profile-name">
          {profile?.full_name || user?.email}
        </h3>
        <p className="profile-role">
          {profile?.role === 'ong' ? 'ONG / colectivo ecologista' : 'Ciudadano del territorio'}
        </p>
        <div className="profile-badge">
          <Leaf size={13} /> Miembro activo de la comunidad
        </div>
      </div>

      {/* Tarjeta destacada de HUELLAS */}
      <div
        className="huellas-wallet-card"
        style={{
          margin: '16px 16px 20px',
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(240, 249, 244, 0.9))',
          borderRadius: '20px',
          border: '1.5px solid rgba(58, 157, 94, 0.3)',
          boxShadow: '0 8px 24px rgba(30, 80, 50, 0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -20,
            right: -20,
            opacity: 0.1,
            transform: 'rotate(20deg)',
            pointerEvents: 'none',
          }}
        >
          <HuellaIcon size={160} variant="gradient" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <HuellaIcon size={34} variant="badge" />
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: '#2e7d32',
            }}
          >
            Tus Huellas Acumuladas
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', margin: '10px 0 14px' }}>
          <span
            style={{
              fontSize: '38px',
              fontWeight: 800,
              fontFamily: "'Inter', sans-serif",
              color: '#1a3d2b',
              lineHeight: 1,
            }}
          >
            {huellas.toLocaleString('es-CO')}
          </span>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#3d6b4e' }}>
            huellas
          </span>
        </div>

        {/* Reglas de incentivo */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '12px',
            color: '#2d4f3b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={15} color="#2e7d32" style={{ flexShrink: 0 }} />
            <span>
              <strong>+1.000 huellas</strong> cuando tu reporte llega a <strong>3 o más</strong> confirmaciones de la comunidad.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={15} color="#e67e22" style={{ flexShrink: 0 }} />
            <span>
              <strong>-1.000 huellas</strong> si <strong>3 o más</strong> personas reportan no verlo (mínimo 0 huellas).
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '6px', marginTop: '2px' }}>
            <ShoppingBag size={15} color="#689f38" style={{ flexShrink: 0 }} />
            <span style={{ color: '#4b6b55', fontStyle: 'italic' }}>
              Próximamente: canjea tus huellas en la tienda comunitaria.
            </span>
          </div>
        </div>
      </div>

      <p className="section-title">Impacto de la comunidad</p>
      <div className="stat-grid">
        <div className="stat-tile">
          <div className="num">{stats?.total_threats ?? '—'}</div>
          <div className="label">Reportes totales</div>
        </div>
        <div className="stat-tile">
          <div className="num">{stats?.confirmed_threats ?? '—'}</div>
          <div className="label">Confirmados</div>
        </div>
        <div className="stat-tile">
          <div className="num">{stats?.resolved_threats ?? '—'}</div>
          <div className="label">Resueltos</div>
        </div>
      </div>

      <div className="profile-actions">
        <button className="btn btn-ghost" onClick={signOut}>
          <LogOut size={16} style={{ marginRight: 6 }} />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
