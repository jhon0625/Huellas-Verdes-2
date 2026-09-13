import { useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import TopBar from '../components/TopBar'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

export default function Profile() {
  const { profile, user, signOut } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.statsSummary().then(setStats).catch(() => setStats(null))
  }, [])

  return (
    <>
      <TopBar title="Tu perfil" />

      <div className="profile-card">
        <div className="profile-avatar">{profile?.avatar_emoji || '🌱'}</div>
        <h3 style={{ fontFamily: 'var(--font-display)', margin: '0 0 4px' }}>
          {profile?.full_name || user?.email}
        </h3>
        <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, margin: 0 }}>
          {profile?.role === 'ong' ? 'ONG / colectivo ecologista' : 'Ciudadano del territorio'}
        </p>
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

      <div style={{ padding: '4px 20px' }}>
        <button className="btn btn-ghost" style={{ width: '100%' }} onClick={signOut}>
          <LogOut size={16} style={{ marginRight: 6 }} />
          Cerrar sesión
        </button>
      </div>
    </>
  )
}
