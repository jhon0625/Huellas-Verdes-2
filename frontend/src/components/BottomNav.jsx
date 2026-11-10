import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { MapPin, ListTree, UserRound, HandHeart, Menu, X, BookOpen } from 'lucide-react'
import { ShoppingBag } from 'lucide-react'

const items = [
  { to: '/mapa', label: 'Mapa', icon: MapPin },
  { to: '/feed', label: 'Reportes', icon: ListTree },
  { to: '/voluntariados', label: 'Voluntariados', icon: HandHeart },
  { to: '/educacion', label: 'Educación', icon: BookOpen },
  { to: '/tienda', label: 'Tienda', icon: ShoppingBag },
  { to: '/perfil', label: 'Perfil', icon: UserRound },
]

export default function BottomNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Botón flotante para abrir el menú cuando está colapsado */}
      <button 
        className={`bottom-nav-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir menú"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Menú inferior colapsable tipo píldora / glassmorphism */}
      <nav className={`bottom-nav-glass ${isOpen ? 'expanded' : 'collapsed'}`}>
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item-glass${isActive ? ' active' : ''}`}
            onClick={() => setIsOpen(false)} // Cierra el menú al navegar
          >
            <div className="icon-wrapper">
              <Icon size={22} strokeWidth={2.5} />
            </div>
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}