import { Sprout } from 'lucide-react'

export default function TopBar({ title, subtitle }) {
  return (
    <header className="topbar">
      <div className="mark">
        <Sprout size={18} />
      </div>
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </header>
  )
}
