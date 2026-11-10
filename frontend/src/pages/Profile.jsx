import React, { useEffect, useState } from 'react'
import { Leaf, LogOut, Award, AlertCircle, ShoppingBag, Shirt, X, Check, Sparkles } from 'lucide-react'
import TopBar from '../components/TopBar'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import HuellaIcon from '../components/HuellaIcon'
import CharacterDoll from '../components/CharacterDoll'
import { CLOTHING_CATALOG, CLOTHING_CATEGORIES, DEFAULT_EQUIPPED } from '../constants/avatars'
import { supabase } from '../supabaseClient'

export default function Profile() {
  const { profile, user, signOut, refreshProfile } = useAuth()
  const [stats, setStats] = useState(null)
  const [showWardrobe, setShowWardrobe] = useState(false)
  const [equippedState, setEquippedState] = useState(DEFAULT_EQUIPPED)
  const [inventoryState, setInventoryState] = useState([])
  const [activeCategory, setActiveCategory] = useState('todos')

  useEffect(() => {
    api.statsSummary().then(setStats).catch(() => setStats(null))
    refreshProfile?.()
  }, [refreshProfile])

  useEffect(() => {
    if (profile) {
      setEquippedState(profile.equipped || DEFAULT_EQUIPPED)
      setInventoryState(Array.isArray(profile.inventory) ? profile.inventory : [])
    }
  }, [profile])

  const huellas = profile?.huellas ?? 0

  const handleToggleEquip = async (item) => {
    const isCurrentlyEquipped = equippedState[item.category] === item.id
    const newEquipped = {
      ...equippedState,
      [item.category]: isCurrentlyEquipped ? null : item.id
    }

    setEquippedState(newEquipped)

    try {
      if (user) {
        await supabase
          .from('profiles')
          .update({ equipped: newEquipped })
          .eq('id', user.id)
        
        refreshProfile?.()
      }
    } catch (err) {
      console.error('Error al guardar el vestuario:', err)
    }
  }

  // Filtrar prendas compradas por el usuario
  const ownedItems = CLOTHING_CATALOG.filter(item => inventoryState.includes(item.id))
  const filteredOwnedItems = ownedItems.filter(item => {
    if (activeCategory === 'todos') return true
    return item.category === activeCategory
  })

  return (
    <div className="section-screen section-screen-profile">
      <TopBar title="Tu perfil" />

      {/* Tarjeta de usuario con Muñeco Personalizado */}
      <div className="profile-card" style={{ textCenter: 'center' }}>
        
        {/* Muñeco de Capas */}
        <div
          style={{
            width: '140px',
            height: '140px',
            backgroundColor: '#ffffff',
            border: '3px solid #74c69d',
            borderRadius: '24px',
            margin: '0 auto 12px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <CharacterDoll equipped={equippedState} size={130} />
        </div>

        <h3 className="profile-name">
          {profile?.full_name || user?.email}
        </h3>
        <p className="profile-role">
          {profile?.role === 'ong' ? 'ONG / colectivo ecologista' : 'Ciudadano del territorio'}
        </p>
        <div className="profile-badge">
          <Leaf size={13} /> Miembro activo de la comunidad
        </div>

        {/* Botón para abrir el Armario / Ropero */}
        <div style={{ marginTop: '12px' }}>
          <button
            onClick={() => setShowWardrobe(true)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1.5px solid #2d6a4f',
              backgroundColor: '#e8f5e9',
              color: '#2d6a4f',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Shirt size={15} /> Abrir Armario ({ownedItems.length} prendas)
          </button>
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
              Canjea tus huellas por ropa y prendas en la tienda virtual.
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

      {/* Modal de Armario / Ropero Personal */}
      {showWardrobe && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '440px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '20px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            {/* Cerrar modal */}
            <button
              onClick={() => setShowWardrobe(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#f1f1f1',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <X size={18} color="#333" />
            </button>

            <h2 style={{ color: '#1b4332', marginTop: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shirt size={20} color="#2d6a4f" /> Tu Armario Personal
            </h2>
            <p style={{ fontSize: '12px', color: '#40916c', marginTop: '-4px' }}>
              Pruébate y cambia la ropa que has comprado
            </p>

            {/* Vista previa en vivo dentro del modal */}
            <div style={{
              backgroundColor: '#f4f9f5',
              borderRadius: '20px',
              padding: '12px',
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <CharacterDoll equipped={equippedState} size={140} />
            </div>

            {/* Filtros por Categoría */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
              <button
                onClick={() => setActiveCategory('todos')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  border: 'none',
                  backgroundColor: activeCategory === 'todos' ? '#2d6a4f' : '#f0f0f0',
                  color: activeCategory === 'todos' ? '#ffffff' : '#333',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Todos
              </button>
              {CLOTHING_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '16px',
                    border: 'none',
                    backgroundColor: activeCategory === cat.id ? '#2d6a4f' : '#f0f0f0',
                    color: activeCategory === cat.id ? '#ffffff' : '#333',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Lista de prendas compradas */}
            {filteredOwnedItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#666', fontSize: '13px' }}>
                <p>No tienes prendas en esta categoría.</p>
                <span style={{ fontSize: '11px', color: '#2d6a4f' }}>¡Visita la Tienda para comprar ropa con tus Huellas!</span>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {filteredOwnedItems.map(item => {
                  const isEquipped = equippedState[item.category] === item.id
                  return (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: '#ffffff',
                        border: `2px solid ${isEquipped ? '#2d6a4f' : '#e0e0e0'}`,
                        borderRadius: '16px',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center'
                      }}
                    >
                      <span style={{ fontSize: '28px', marginBottom: '4px' }}>{item.icon || '👕'}</span>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1b4332', marginBottom: '8px' }}>
                        {item.name}
                      </span>
                      <button
                        onClick={() => handleToggleEquip(item)}
                        style={{
                          width: '100%',
                          padding: '6px',
                          borderRadius: '10px',
                          border: 'none',
                          backgroundColor: isEquipped ? '#2d6a4f' : '#e8f5e9',
                          color: isEquipped ? '#ffffff' : '#2e7d32',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        {isEquipped ? <><Check size={12} /> Equipada</> : 'Equipar'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            <button
              onClick={() => setShowWardrobe(false)}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '12px',
                backgroundColor: '#2d6a4f',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                fontWeight: 'bold',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}