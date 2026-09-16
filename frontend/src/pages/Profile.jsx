import { useEffect, useState } from 'react'
import { Leaf, LogOut } from 'lucide-react'
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
    <div className="section-screen section-screen-profile">
      <TopBar title="Tu perfil" />

      <div className="profile-card">
        <div className="profile-avatar">{profile?.avatar_emoji || '🌱'}</div>
        <h3 className="profile-name">
          {profile?.full_name || user?.email}
        </h3>
        <p className="profile-role">
          {profile?.role === 'ong' ? 'ONG / colectivo ecologista' : 'Ciudadano del territorio'}
        </p>
        <div className="profile-badge"><Leaf size={13} /> Miembro activo de la comunidad</div>
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
