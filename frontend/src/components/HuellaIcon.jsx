// =========================================================
// HuellaIcon.jsx — Logo amigable y sofisticado de Huellas
// =========================================================
// Representa la huella de animal / insignia ecológica de la app.
// Admite variantes: 'gradient' (por defecto), 'badge' (emblema tipo moneda) y 'solid'.
// =========================================================

export default function HuellaIcon({
  size = 20,
  variant = 'gradient',
  color = '#2e7d32',
  style = {},
  className = '',
}) {
  const gradientId = `huella-grad-${Math.random().toString(36).slice(2, 8)}`
  const badgeGradId = `huella-badge-${Math.random().toString(36).slice(2, 8)}`

  // Variante emblema circular / moneda ecológica
  if (variant === 'badge') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ verticalAlign: 'middle', flexShrink: 0, ...style }}
      >
        <defs>
          {/* Degradado de fondo de la medalla */}
          <linearGradient id={badgeGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#48bb78" />
            <stop offset="60%" stopColor="#2f855a" />
            <stop offset="100%" stopColor="#1c4532" />
          </linearGradient>

          {/* Sombra suave */}
          <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#1a3d2b" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Círculo exterior (aro de moneda) */}
        <circle cx="50" cy="50" r="46" fill={`url(#${badgeGradId})`} filter="url(#badgeShadow)" />
        <circle cx="50" cy="50" r="42" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2.5" fill="none" />

        {/* Huella amigable en el centro (blanco brillante con ligera transparencia) */}
        <g fill="#ffffff" transform="translate(25, 25) scale(0.1)">
          {/* Dedo 1 (izquierda) */}
          <ellipse cx="140" cy="180" rx="42" ry="60" transform="rotate(-25 140 180)" />
          {/* Dedo 2 (centro izq) */}
          <ellipse cx="215" cy="120" rx="46" ry="68" transform="rotate(-8 215 120)" />
          {/* Dedo 3 (centro der) */}
          <ellipse cx="295" cy="120" rx="46" ry="68" transform="rotate(8 295 120)" />
          {/* Dedo 4 (derecha) */}
          <ellipse cx="370" cy="180" rx="42" ry="60" transform="rotate(25 370 180)" />
          {/* Almohadilla principal (suave, acorazonada / orgánica) */}
          <path d="M 255 230 C 180 200 130 250 145 320 C 160 380 200 420 255 420 C 310 420 350 380 365 320 C 380 250 330 200 255 230 Z" />
        </g>

        {/* Pequeño destello de luz sofisticado */}
        <ellipse cx="35" cy="28" rx="14" ry="7" transform="rotate(-30 35 28)" fill="rgba(255,255,255,0.45)" />
      </svg>
    )
  }

  // Variante normal: silueta de huella animal con estilo orgánico y amigable
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#48bb78" />
          <stop offset="50%" stopColor="#2f855a" />
          <stop offset="100%" stopColor="#1e5638" />
        </linearGradient>
      </defs>

      <g fill={variant === 'solid' ? color : `url(#${gradientId})`}>
        {/* Dedo 1 (izquierdo) */}
        <ellipse cx="20" cy="42" rx="9" ry="13.5" transform="rotate(-26 20 42)" />
        {/* Dedo 2 (centro-izq) */}
        <ellipse cx="40" cy="24" rx="10" ry="15.5" transform="rotate(-9 40 24)" />
        {/* Dedo 3 (centro-der) */}
        <ellipse cx="60" cy="24" rx="10" ry="15.5" transform="rotate(9 60 24)" />
        {/* Dedo 4 (derecho) */}
        <ellipse cx="80" cy="42" rx="9" ry="13.5" transform="rotate(26 80 42)" />

        {/* Almohadilla central amigable y acolchada */}
        <path d="M 50 49 C 32 41 18 52 18 69 C 18 84 32 94 50 94 C 68 94 82 84 82 69 C 82 52 68 41 50 49 Z" />

        {/* Toque orgánico: pequeña curvatura interior que le da sofisticación */}
        <path
          d="M 50 54 C 40 48 30 54 28 66 C 26 77 35 88 50 88 C 65 88 74 77 72 66 C 70 54 60 48 50 54 Z"
          fill="rgba(255, 255, 255, 0.15)"
        />
      </g>
    </svg>
  )
}
