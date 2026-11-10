import React from 'react'

export const BASE_DOLL = '/avatars/base_character.png'

export const CLOTHING_CATEGORIES = [
  { id: 'gorras', label: '🧢 Gorras y Sombreros' },
  { id: 'gafas', label: '🕶️ Gafas' },
  { id: 'ropa', label: '👕 Ropa / Torso' },
  { id: 'accesorios', label: '🎒 Accesorios' }
]

export const CLOTHING_CATALOG = [
  // ==================== GORRAS Y SOMBREROS ====================
  {
    id: 'cap_eco_green',
    name: 'Gorra Verde Eco',
    category: 'gorras',
    price: 500,
    icon: '🧢',
    svgContent: (
      <g>
        <path d="M 64 45 C 64 20, 136 20, 136 45 Z" fill="#40916C" />
        <path d="M 60 45 Q 100 52 145 42" stroke="#1B4332" strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle cx="100" cy="22" r="4" fill="#1B4332" />
      </g>
    )
  },
  {
    id: 'cap_urban_red',
    name: 'Gorra Urbana Roja',
    category: 'gorras',
    price: 800,
    icon: '🧢',
    svgContent: (
      <g>
        <path d="M 64 45 C 64 22, 136 22, 136 45 Z" fill="#D62828" />
        <path d="M 134 45 Q 150 48 162 42" stroke="#003049" strokeWidth="6" strokeLinecap="round" fill="none" />
        <circle cx="100" cy="22" r="4" fill="#003049" />
      </g>
    )
  },
  {
    id: 'beanie_forest',
    name: 'Gorro de Lana Forestal',
    category: 'gorras',
    price: 1200,
    icon: '🧶',
    svgContent: (
      <g>
        <path d="M 65 48 C 65 18, 135 18, 135 48 Z" fill="#2A9D8F" />
        <rect x="63" y="40" width="74" height="12" rx="4" fill="#264653" />
        <circle cx="100" cy="14" r="9" fill="#E9C46A" />
      </g>
    )
  },
  {
    id: 'hat_gardener',
    name: 'Sombrero Jardinero',
    category: 'gorras',
    price: 2000,
    icon: '🤠',
    svgContent: (
      <g>
        <path d="M 72 38 C 72 18, 128 18, 128 38 Z" fill="#E9C46A" />
        <rect x="72" y="32" width="56" height="6" fill="#E76F51" />
        <ellipse cx="100" cy="40" rx="48" ry="10" fill="#E9C46A" />
      </g>
    )
  },
  {
    id: 'hat_explorer',
    name: 'Sombrero Guardabosques',
    category: 'gorras',
    price: 3500,
    icon: '🪖',
    svgContent: (
      <g>
        <path d="M 70 40 C 70 20, 130 20, 130 40 Z" fill="#A3B18A" />
        <rect x="70" y="34" width="60" height="6" fill="#3A5A40" />
        <ellipse cx="100" cy="40" rx="44" ry="8" fill="#588157" />
        <circle cx="100" cy="24" r="4" fill="#3A5A40" />
      </g>
    )
  },
  {
    id: 'crown_nature',
    name: 'Corona de Flores Silvestres',
    category: 'gorras',
    price: 5000,
    icon: '👑',
    svgContent: (
      <g>
        <path d="M 65 38 Q 100 46 135 38" stroke="#52B788" strokeWidth="5" strokeLinecap="round" fill="none" />
        <circle cx="72" cy="33" r="6" fill="#FFB703" />
        <circle cx="88" cy="28" r="7" fill="#E76F51" />
        <circle cx="100" cy="25" r="8" fill="#F4A261" />
        <circle cx="112" cy="28" r="7" fill="#E76F51" />
        <circle cx="128" cy="33" r="6" fill="#FFB703" />
      </g>
    )
  },
  {
    id: 'helm_eco_warrior',
    name: 'Casco Reciclado Épico',
    category: 'gorras',
    price: 10000,
    icon: '🥷',
    svgContent: (
      <g>
        <path d="M 62 48 C 62 14, 138 14, 138 48 Z" fill="#2B2D42" />
        <path d="M 100 10 L 108 30 L 92 30 Z" fill="#D62828" />
        <rect x="60" y="42" width="80" height="8" rx="3" fill="#8D99AE" />
        <circle cx="100" cy="28" r="5" fill="#EF233C" />
      </g>
    )
  },

  // ==================== GAFAS ====================
  {
    id: 'glasses_nerd',
    name: 'Gafas de Lectura',
    category: 'gafas',
    price: 500,
    icon: '👓',
    svgContent: (
      <g>
        <circle cx="84" cy="62" r="11" stroke="#2B2D42" strokeWidth="3" fill="none" />
        <circle cx="116" cy="62" r="11" stroke="#2B2D42" strokeWidth="3" fill="none" />
        <line x1="95" y1="62" x2="105" y2="62" stroke="#2B2D42" strokeWidth="3" />
        <line x1="68" y1="62" x2="73" y2="62" stroke="#2B2D42" strokeWidth="2" />
        <line x1="127" y1="62" x2="132" y2="62" stroke="#2B2D42" strokeWidth="2" />
      </g>
    )
  },
  {
    id: 'glasses_sun',
    name: 'Gafas de Sol Negras',
    category: 'gafas',
    price: 1000,
    icon: '🕶️',
    svgContent: (
      <g>
        <rect x="73" y="54" width="23" height="16" rx="4" fill="#1A1A1A" />
        <rect x="104" y="54" width="23" height="16" rx="4" fill="#1A1A1A" />
        <line x1="96" y1="60" x2="104" y2="60" stroke="#1A1A1A" strokeWidth="3" />
        <line x1="66" y1="60" x2="73" y2="60" stroke="#1A1A1A" strokeWidth="2.5" />
        <line x1="127" y1="60" x2="134" y2="60" stroke="#1A1A1A" strokeWidth="2.5" />
        <line x1="76" y1="56" x2="84" y2="66" stroke="#FFFFFF" strokeWidth="2" opacity="0.3" />
        <line x1="107" y1="56" x2="115" y2="66" stroke="#FFFFFF" strokeWidth="2" opacity="0.3" />
      </g>
    )
  },
  {
    id: 'glasses_retro_round',
    name: 'Gafas Hippie Sol',
    category: 'gafas',
    price: 1800,
    icon: '🟡',
    svgContent: (
      <g>
        <circle cx="84" cy="62" r="12" fill="#E9C46A" opacity="0.8" stroke="#E76F51" strokeWidth="2" />
        <circle cx="116" cy="62" r="12" fill="#E9C46A" opacity="0.8" stroke="#E76F51" strokeWidth="2" />
        <line x1="96" y1="62" x2="104" y2="62" stroke="#E76F51" strokeWidth="3" />
      </g>
    )
  },
  {
    id: 'goggles_swim',
    name: 'Gafas de Buceo Eco',
    category: 'gafas',
    price: 2500,
    icon: '🤿',
    svgContent: (
      <g>
        <rect x="72" y="54" width="24" height="16" rx="8" fill="#90E0EF" stroke="#0077B6" strokeWidth="3" />
        <rect x="104" y="54" width="24" height="16" rx="8" fill="#90E0EF" stroke="#0077B6" strokeWidth="3" />
        <path d="M 64 62 L 72 62 M 128 62 L 136 62 M 96 62 L 104 62" stroke="#0077B6" strokeWidth="4" />
      </g>
    )
  },
  {
    id: 'glasses_vr_eco',
    name: 'Visor Futurista Eco',
    category: 'gafas',
    price: 5000,
    icon: '🥽',
    svgContent: (
      <g>
        <rect x="70" y="52" width="60" height="20" rx="8" fill="#48CAE4" stroke="#0077B6" strokeWidth="3" />
        <line x1="75" y1="62" x2="125" y2="62" stroke="#FFFFFF" strokeWidth="2" opacity="0.7" />
        <circle cx="100" cy="62" r="3" fill="#70E000" />
      </g>
    )
  },
  {
    id: 'monocle_botanist',
    name: 'Monóculo de Botánico Épico',
    category: 'gafas',
    price: 7500,
    icon: '🧐',
    svgContent: (
      <g>
        <circle cx="116" cy="62" r="13" fill="#E9C46A" opacity="0.3" stroke="#D4AF37" strokeWidth="3" />
        <path d="M 125 73 Q 128 95 120 110" stroke="#D4AF37" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
      </g>
    )
  },

  // ==================== ROPA / TORSO ====================
  {
    id: 'shirt_green_leaf',
    name: 'Camiseta Huellas Verdes',
    category: 'ropa',
    price: 800,
    icon: '👕',
    svgContent: (
      <g>
        <rect x="60" y="98" width="80" height="67" rx="14" fill="#2D6A4F" />
        <rect x="42" y="100" width="22" height="30" rx="8" fill="#2D6A4F" transform="rotate(10 42 100)" />
        <rect x="136" y="100" width="22" height="30" rx="8" fill="#2D6A4F" transform="rotate(-10 158 100)" />
        <path d="M 100 118 Q 110 120 108 132 Q 96 130 100 118 Z" fill="#74C69D" />
      </g>
    )
  },
  {
    id: 'shirt_floral',
    name: 'Camisa Flora Botánica',
    category: 'ropa',
    price: 1500,
    icon: '🌺',
    svgContent: (
      <g>
        <rect x="60" y="98" width="80" height="67" rx="14" fill="#F4A261" />
        <rect x="42" y="100" width="22" height="30" rx="8" fill="#F4A261" transform="rotate(10 42 100)" />
        <rect x="136" y="100" width="22" height="30" rx="8" fill="#F4A261" transform="rotate(-10 158 100)" />
        <circle cx="75" cy="115" r="5" fill="#E76F51" />
        <circle cx="125" cy="130" r="6" fill="#2A9D8F" />
        <circle cx="85" cy="148" r="5" fill="#E9C46A" />
      </g>
    )
  },
  {
    id: 'hoodie_recycle',
    name: 'Buzo Reciclado Urbano',
    category: 'ropa',
    price: 2500,
    icon: '🥼',
    svgContent: (
      <g>
        <rect x="58" y="98" width="84" height="68" rx="16" fill="#1D3557" />
        <rect x="40" y="100" width="24" height="40" rx="10" fill="#1D3557" transform="rotate(10 40 100)" />
        <rect x="136" y="100" width="24" height="40" rx="10" fill="#1D3557" transform="rotate(-10 160 100)" />
        <rect x="76" y="135" width="48" height="24" rx="8" fill="#457B9D" />
        <path d="M 100 112 Q 106 120 94 124 Q 104 126 100 112 Z" fill="#A8DADC" />
      </g>
    )
  },
  {
    id: 'vest_ranger',
    name: 'Chaleco Forestal',
    category: 'ropa',
    price: 3500,
    icon: '🦺',
    svgContent: (
      <g>
        <rect x="60" y="98" width="80" height="67" rx="14" fill="#386641" />
        <rect x="64" y="98" width="26" height="67" fill="#6A994E" />
        <rect x="110" y="98" width="26" height="67" fill="#6A994E" />
        <rect x="68" y="125" width="18" height="16" rx="3" fill="#A7C957" />
        <rect x="114" y="125" width="18" height="16" rx="3" fill="#A7C957" />
      </g>
    )
  },
  {
    id: 'jacket_explorer',
    name: 'Chaqueta de Explorador',
    category: 'ropa',
    price: 5000,
    icon: '🧥',
    svgContent: (
      <g>
        <rect x="58" y="98" width="84" height="68" rx="14" fill="#D4A373" />
        <rect x="40" y="100" width="24" height="42" rx="10" fill="#D4A373" transform="rotate(10 40 100)" />
        <rect x="136" y="100" width="24" height="42" rx="10" fill="#D4A373" transform="rotate(-10 160 100)" />
        <line x1="100" y1="98" x2="100" y2="166" stroke="#A3B18A" strokeWidth="3" />
        <rect x="68" y="130" width="20" height="18" rx="4" fill="#CCD5AE" />
        <rect x="112" y="130" width="20" height="18" rx="4" fill="#CCD5AE" />
      </g>
    )
  },
  {
    id: 'overalls_gardener',
    name: 'Overol de Botánico',
    category: 'ropa',
    price: 6000,
    icon: '👖',
    svgContent: (
      <g>
        <rect x="64" y="110" width="72" height="55" rx="8" fill="#457B9D" />
        <rect x="74" y="98" width="10" height="20" fill="#1D3557" />
        <rect x="116" y="98" width="10" height="20" fill="#1D3557" />
        <rect x="85" y="122" width="30" height="25" rx="4" fill="#1D3557" />
      </g>
    )
  },
  {
    id: 'suit_legendary_guardian',
    name: 'Armadura Guardián de la Naturaleza',
    category: 'ropa',
    price: 12000,
    icon: '🛡️',
    svgContent: (
      <g>
        <rect x="58" y="96" width="84" height="70" rx="16" fill="#1A4314" stroke="#52B788" strokeWidth="3" />
        <path d="M 100 105 L 120 125 L 100 155 L 80 125 Z" fill="#74C69D" />
        <circle cx="100" cy="130" r="8" fill="#B7E4C7" stroke="#1B4332" strokeWidth="2" />
      </g>
    )
  },

  // ==================== ACCESORIOS ====================
  {
    id: 'scarf_red',
    name: 'Bufanda Ecológica',
    category: 'accesorios',
    price: 600,
    icon: '🧣',
    svgContent: (
      <g>
        <path d="M 64 92 Q 100 106 136 92" stroke="#D62828" strokeWidth="12" strokeLinecap="round" fill="none" />
        <rect x="114" y="94" width="14" height="35" rx="4" fill="#D62828" />
      </g>
    )
  },
  {
    id: 'badge_ranger',
    name: 'Insignia Guardián del Peñol',
    category: 'accesorios',
    price: 1000,
    icon: '⭐',
    svgContent: (
      <g>
        <polygon points="120,110 123,117 130,117 124,121 127,128 120,123 113,128 116,121 110,117 117,117" fill="#FFB703" stroke="#FB8500" strokeWidth="1" />
      </g>
    )
  },
  {
    id: 'backpack_explorer',
    name: 'Mochila de Expedición',
    category: 'accesorios',
    price: 2000,
    icon: '🎒',
    svgContent: (
      <g>
        <path d="M 65 105 L 56 160" stroke="#E76F51" strokeWidth="6" strokeLinecap="round" />
        <path d="M 135 105 L 144 160" stroke="#E76F51" strokeWidth="6" strokeLinecap="round" />
      </g>
    )
  },
  {
    id: 'binoculars_wild',
    name: 'Binoculares de Aves',
    category: 'accesorios',
    price: 3000,
    icon: '🔭',
    svgContent: (
      <g>
        <path d="M 75 82 Q 100 115 125 82" stroke="#343A40" strokeWidth="3" fill="none" />
        <rect x="86" y="122" width="11" height="18" rx="3" fill="#6C757D" />
        <rect x="103" y="122" width="11" height="18" rx="3" fill="#6C757D" />
        <line x1="97" y1="128" x2="103" y2="128" stroke="#343A40" strokeWidth="3" />
      </g>
    )
  },
  {
    id: 'camera_vintage',
    name: 'Cámara Fotógrafo de Fauna',
    category: 'accesorios',
    price: 4500,
    icon: '📷',
    svgContent: (
      <g>
        <path d="M 70 85 Q 100 120 130 85" stroke="#495057" strokeWidth="3" fill="none" />
        <rect x="88" y="125" width="24" height="18" rx="4" fill="#212529" />
        <circle cx="100" cy="134" r="5" fill="#CED4DA" />
      </g>
    )
  },
  {
    id: 'pet_parrot_shoulder',
    name: 'Guacamayo Compañero',
    category: 'accesorios',
    price: 8000,
    icon: '🦜',
    svgContent: (
      <g>
        <ellipse cx="44" cy="95" rx="8" ry="12" fill="#52B788" />
        <circle cx="44" cy="80" r="6" fill="#D62828" />
        <path d="M 38 80 L 32 82 L 38 84 Z" fill="#FFB703" />
        <circle cx="42" cy="79" r="1.5" fill="#FFFFFF" />
        <path d="M 44 107 L 42 120 L 47 118 Z" fill="#2A9D8F" />
      </g>
    )
  }
]

export const DEFAULT_EQUIPPED = {
  gorras: null,
  gafas: null,
  ropa: null,
  accesorios: null
}