import { NavLink } from 'react-router-dom'
import { MapPin, ListTree, UserRound, HandHeart } from 'lucide-react'

const items = [
  { to: '/mapa', label: 'Mapa', icon: MapPin },
  { to: '/feed', label: 'Reportes', icon: ListTree },
  { to: '/voluntariados', label: 'Voluntariados', icon: HandHeart },
  { to: '/perfil', label: 'Perfil', icon: UserRound },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <Icon size={20} strokeWidth={2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
