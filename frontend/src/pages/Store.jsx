import React, { useState, useEffect } from 'react'
import { ShoppingBag, Check, Lock, Sparkles, RefreshCw, Shirt } from 'lucide-react'
import { supabase } from '../supabaseClient'
import CharacterDoll from '../components/CharacterDoll'
import { CLOTHING_CATEGORIES, CLOTHING_CATALOG, DEFAULT_EQUIPPED } from '../constants/avatars'

export default function Store() {
  const [profile, setProfile] = useState({
    huellas: 0,
    inventory: [],
    equipped: DEFAULT_EQUIPPED
  })
  const [activeCategory, setActiveCategory] = useState('todos')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('huellas, inventory, equipped')
          .eq('id', user.id)
          .single()

        if (!error && data) {
          setProfile({
            huellas: data.huellas ?? 5000,
            inventory: Array.isArray(data.inventory) ? data.inventory : [],
            equipped: data.equipped || DEFAULT_EQUIPPED
          })
        }
      }
    } catch (err) {
      console.log('Cargando perfil localmente:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleEquip = async (item) => {
    setActionLoading(true)
    const isCurrentlyEquipped = profile.equipped[item.category] === item.id
    const newEquipped = {
      ...profile.equipped,
      [item.category]: isCurrentlyEquipped ? null : item.id
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ equipped: newEquipped })
          .eq('id', user.id)

        if (error) throw error
      }

      setProfile(prev => ({ ...prev, equipped: newEquipped }))
      showToast(isCurrentlyEquipped ? `Desequipaste ${item.name}` : `¡${item.name} equipada! ✨`, 'success')
    } catch (err) {
      console.error('Error al equipar:', err)
      setProfile(prev => ({ ...prev, equipped: newEquipped }))
      showToast('Cambio guardado localmente', 'success')
    } finally {
      setActionLoading(false)
    }
  }

  const handleBuyItem = async (item) => {
    if (profile.huellas < item.price) {
      showToast('No tienes suficientes Huellas acumuladas', 'error')
      return
    }

    setActionLoading(true)
    const newHuellas = profile.huellas - item.price
    const newInventory = [...new Set([...profile.inventory, item.id])]
    const newEquipped = {
      ...profile.equipped,
      [item.category]: item.id
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            huellas: newHuellas,
            inventory: newInventory,
            equipped: newEquipped
          })
          .eq('id', user.id)

        if (error) throw error
      }

      setProfile({
        huellas: newHuellas,
        inventory: newInventory,
        equipped: newEquipped
      })
      showToast(`¡Compraste y equipaste ${item.name}! 🎉`, 'success')
    } catch (err) {
      console.error('Error al comprar prenda:', err)
      setProfile({
        huellas: newHuellas,
        inventory: newInventory,
        equipped: newEquipped
      })
      showToast('Prenda desbloqueada localmente', 'success')
    } finally {
      setActionLoading(false)
    }
  }

  const showToast = (text, type = 'info') => {
    setToast({ text, type })
    setTimeout(() => setToast(null), 3000)
  }

  const filteredItems = CLOTHING_CATALOG.filter(item => {
    if (activeCategory === 'todos') return true
    return item.category === activeCategory
  })

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: '#f3efe6',
      paddingBottom: '90px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        backgroundColor: '#c8e6c9',
        minHeight: '100vh',
        padding: '20px 16px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>

        {/* Encabezado */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2e7d32',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
            }}>
              <ShoppingBag size={24} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1b4332' }}>
                Tienda de Ropa
              </h1>
              <p style={{ margin: 0, fontSize: '12px', color: '#2d6a4f', fontWeight: '500' }}>
                Viste a tu personaje con Huellas
              </p>
            </div>
          </div>

          <button
            onClick={fetchProfile}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#1b4332',
              padding: '6px'
            }}
            title="Recargar saldo"
          >
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
        </div>

        {/* Probador Virtual (Live Character Preview) */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '2px solid #a7f3d0'
        }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#40916c', textTransform: 'uppercase', marginBottom: '8px' }}>
            Probador en Vivo
          </span>
          <CharacterDoll equipped={profile.equipped} size={160} />
        </div>

        {/* Banner de Saldo */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#40916c', textTransform: 'uppercase' }}>
              Tus Huellas Ecológicas
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '24px' }}>🐾</span>
              <span style={{ fontSize: '26px', fontWeight: '900', color: '#1b4332' }}>
                {profile.huellas}
              </span>
            </div>
          </div>
          <div style={{
            backgroundColor: '#e8f5e9',
            borderRadius: '12px',
            padding: '8px 12px',
            textAlign: 'right'
          }}>
            <span style={{ display: 'block', fontSize: '11px', color: '#2d6a4f', fontWeight: '600' }}>
              Armario
            </span>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1b4332' }}>
              {profile.inventory.length} / {CLOTHING_CATALOG.length} prendas
            </span>
          </div>
        </div>

        {/* Notificación Toast */}
        {toast && (
          <div style={{
            backgroundColor: toast.type === 'error' ? '#ffebee' : '#e8f5e9',
            color: toast.type === 'error' ? '#c62828' : '#2e7d32',
            padding: '10px 14px',
            borderRadius: '14px',
            fontSize: '13px',
            fontWeight: 'bold',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            {toast.text}
          </div>
        )}

        {/* Categorías */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            onClick={() => setActiveCategory('todos')}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: activeCategory === 'todos' ? '#2d6a4f' : 'rgba(255,255,255,0.85)',
              color: activeCategory === 'todos' ? '#ffffff' : '#1b4332',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Todos
          </button>
          {CLOTHING_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '8px 14px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: activeCategory === cat.id ? '#2d6a4f' : 'rgba(255,255,255,0.85)',
                color: activeCategory === cat.id ? '#ffffff' : '#1b4332',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Título de Sección */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
          <Sparkles size={18} color="#1b4332" />
          <h2 style={{ margin: 0, fontSize: '16px', color: '#1b4332', fontWeight: 'bold' }}>
            Catálogo de Ropa
          </h2>
        </div>

        {/* Grilla de Prendas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '14px'
        }}>
          {filteredItems.map((item) => {
            const isOwned = profile.inventory.includes(item.id)
            const isEquipped = profile.equipped[item.category] === item.id
            const canAfford = profile.huellas >= item.price

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  border: `2px solid ${isEquipped ? '#2d6a4f' : '#e0e0e0'}`,
                  padding: '14px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  boxShadow: isEquipped ? '0 0 14px rgba(45, 106, 79, 0.35)' : '0 4px 10px rgba(0,0,0,0.04)',
                  position: 'relative'
                }}
              >
                {/* Icono Prenda */}
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '16px',
                  backgroundColor: '#f4f9f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  marginTop: '6px',
                  marginBottom: '10px'
                }}>
                  {item.icon || '👕'}
                </div>

                {/* Nombre */}
                <h3 style={{ margin: '2px 0', fontSize: '13px', color: '#1b4332', fontWeight: 'bold' }}>
                  {item.name}
                </h3>
                <span style={{ fontSize: '11px', color: '#40916c', marginBottom: '10px' }}>
                  {item.price} Huellas
                </span>

                {/* Botón según estado */}
                {isEquipped ? (
                  <button
                    onClick={() => handleToggleEquip(item)}
                    disabled={actionLoading}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: '#2d6a4f',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Check size={14} /> Equipado
                  </button>
                ) : isOwned ? (
                  <button
                    onClick={() => handleToggleEquip(item)}
                    disabled={actionLoading}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '12px',
                      border: '1.5px solid #2d6a4f',
                      backgroundColor: '#ffffff',
                      color: '#2d6a4f',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Shirt size={14} /> Equipar
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuyItem(item)}
                    disabled={!canAfford || actionLoading}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: canAfford ? '#e65100' : '#b0bec5',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      cursor: canAfford ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    {!canAfford && <Lock size={12} />}
                    <span>🐾 {item.price}</span>
                  </button>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}