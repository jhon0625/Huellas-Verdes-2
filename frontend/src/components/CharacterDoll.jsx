import React from 'react'
import { CLOTHING_CATALOG } from '../constants/avatars'

export default function CharacterDoll({ equipped = {}, size = 200 }) {
  // Función auxiliar para obtener el objeto completo de la prenda equipada
  const getItemLayer = (categoryId) => {
    const itemId = equipped?.[categoryId]
    if (!itemId) return null
    return CLOTHING_CATALOG.find(item => item.id === itemId)
  }

  const gorra = getItemLayer('gorras')
  const gafas = getItemLayer('gafas')
  const ropa = getItemLayer('ropa')
  const accesorio = getItemLayer('accesorios')

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ userSelect: 'none', display: 'block', margin: '0 auto' }}
    >
      {/* ==================== CAPA 1: MUÑECO BASE ==================== */}
      <rect x="78" y="160" width="18" height="50" rx="9" fill="#D7CCC8" />
      <rect x="104" y="160" width="18" height="50" rx="9" fill="#D7CCC8" />
      <ellipse cx="87" cy="210" rx="13" ry="7" fill="#4E342E" />
      <ellipse cx="113" cy="210" rx="13" ry="7" fill="#4E342E" />
      <rect x="42" y="105" width="16" height="52" rx="8" fill="#F5CBA7" transform="rotate(10 42 105)" />
      <rect x="142" y="105" width="16" height="52" rx="8" fill="#F5CBA7" transform="rotate(-10 158 105)" />
      <rect x="62" y="100" width="76" height="65" rx="16" fill="#E0E0E0" />
      <circle cx="64" cy="65" r="8" fill="#F5CBA7" />
      <circle cx="136" cy="65" r="8" fill="#F5CBA7" />
      <rect x="65" y="30" width="70" height="70" rx="30" fill="#F5CBA7" />
      <path d="M 65 50 C 65 30, 135 30, 135 50 C 135 38, 120 25, 100 25 C 80 25, 65 38, 65 50 Z" fill="#4A2E2B" />
      <circle cx="85" cy="62" r="4.5" fill="#2C3E50" />
      <circle cx="115" cy="62" r="4.5" fill="#2C3E50" />
      <circle cx="83.5" cy="60.5" r="1.5" fill="#FFFFFF" />
      <circle cx="113.5" cy="60.5" r="1.5" fill="#FFFFFF" />
      <ellipse cx="77" cy="69" rx="5" ry="3" fill="#FF8A80" opacity="0.6" />
      <ellipse cx="123" cy="69" rx="5" ry="3" fill="#FF8A80" opacity="0.6" />
      <path d="M 92 72 Q 100 80 108 72" stroke="#2C3E50" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* ==================== CAPA 2: ROPA / TORSO ==================== */}
      {ropa?.svgContent}

      {/* ==================== CAPA 3: GAFAS ==================== */}
      {gafas?.svgContent}

      {/* ==================== CAPA 4: GORRAS Y SOMBREROS ==================== */}
      {gorra?.svgContent}

      {/* ==================== CAPA 5: ACCESORIOS ==================== */}
      {accesorio?.svgContent}
    </svg>
  )
}