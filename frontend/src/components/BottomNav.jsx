import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { MapPin, ListTree, UserRound, HandHeart, Menu, X, BookOpen, ShoppingBag } from 'lucide-react'
import { useLongPressHelp } from '../context/HelpContext'

const items = [
  { to: '/mapa', label: 'Mapa', icon: MapPin, helpKey: 'nav_mapa' },
  { to: '/feed', label: 'Reportes', icon: ListTree, helpKey: 'nav_reportes' },
  { to: '/voluntariados', label: 'Voluntariados', icon: HandHeart, helpKey: 'nav_voluntariados' },
  { to: '/educacion', label: 'Educación', icon: BookOpen, helpKey: 'nav_educacion' },
  { to: '/tienda', label: 'Tienda', icon: ShoppingBag, helpKey: 'nav_tienda' },
  { to: '/perfil', label: 'Perfil', icon: UserRound, helpKey: 'nav_perfil' },
]

function NavItem({ item, onClose }) {
  const { to, label, icon: Icon, helpKey } = item
  const longPressProps = useLongPressHelp(helpKey, {
    onClick: onClose, // Cierra el menú al navegar normalmente
  })

  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-item-glass${isActive ? ' active' : ''}`}
      {...longPressProps}
      title={`${label} (Mantén presionado para ver ayuda)`}
    >
      <div className="icon-wrapper">
        <Icon size={22} strokeWidth={2.5} />
      </div>
      <span className="nav-label">{label}</span>
    </NavLink>
  )
}

export default function BottomNav() {
  const [isOpen, setIsOpen] = useState(false)
  const toggleHelpProps = useLongPressHelp('nav_toggle', {
    onClick: () => setIsOpen(prev => !prev),
  })

  return (
    <>
      {/* Botón flotante para abrir el menú cuando está colapsado */}
      <button 
        className={`bottom-nav-toggle ${isOpen ? 'open' : ''}`}
        {...toggleHelpProps}
        aria-label="Abrir menú"
        title="Menú (Mantén presionado para ver ayuda)"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Menú inferior colapsable tipo píldora / glassmorphism */}
      <nav className={`bottom-nav-glass ${isOpen ? 'expanded' : 'collapsed'}`}>
        {items.map((item) => (
          <NavItem key={item.to} item={item} onClose={() => setIsOpen(false)} />
        ))}
      </nav>
    </>
  )
}
