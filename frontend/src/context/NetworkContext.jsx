// =========================================================
// NetworkContext.jsx — Estado de conectividad + auto-sync
// =========================================================
// Provee isOnline, pendingCount, syncVersion a toda la app,
// muestra banner cuando cambia la red y sincroniza automáticamente.
// =========================================================

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { syncAllPending } from '../lib/syncEngine'
import { cleanExpiredReports, getPendingReports } from '../lib/offlineDb'
import { WifiOff, Wifi, RefreshCw } from 'lucide-react'

const NetworkContext = createContext({
  isOnline: true,
  isSyncing: false,
  pendingCount: 0,
  syncVersion: 0,
  triggerSync: () => {},
  refreshPendingCount: () => {},
})

export function useNetwork() {
  return useContext(NetworkContext)
}

export function NetworkProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [syncVersion, setSyncVersion] = useState(0)
  const [showBanner, setShowBanner] = useState(false)
  const [bannerMessage, setBannerMessage] = useState('')
  const [bannerType, setBannerType] = useState('offline') // 'offline' | 'syncing' | 'synced' | 'error'

  const refreshPendingCount = useCallback(async () => {
    try {
      const pending = await getPendingReports()
      setPendingCount(pending.length)
      return pending.length
    } catch (err) {
      console.warn('Error leyendo pendientes de IndexedDB:', err)
      return 0
    }
  }, [])

  const triggerSync = useCallback(async () => {
    if (!supabase) return { synced: 0, failed: 0 }
    setIsSyncing(true)
    setBannerType('syncing')
    setBannerMessage('Sincronizando reportes pendientes...')
    setShowBanner(true)

    try {
      const result = await syncAllPending(supabase)
      await refreshPendingCount()
      // Notificar a todos los componentes suscritos (Feed, Mapa, etc.) que recarguen datos
      setSyncVersion((v) => v + 1)

      if (result.synced > 0) {
        setBannerType('synced')
        setBannerMessage(`✅ ${result.synced} reporte(s) sincronizado(s) con éxito`)
        setTimeout(() => setShowBanner(false), 3500)
      } else if (result.failed > 0) {
        setBannerType('error')
        setBannerMessage(`⚠️ No se pudieron sincronizar ${result.failed} reporte(s). Revisa tu conexión.`)
        setTimeout(() => setShowBanner(false), 4000)
      } else {
        setShowBanner(false)
      }
      return result
    } catch (err) {
      console.error('Error durante triggerSync:', err)
      setBannerType('error')
      setBannerMessage('Error al conectar con el servidor')
      setTimeout(() => setShowBanner(false), 3000)
      return { synced: 0, failed: 0 }
    } finally {
      setIsSyncing(false)
    }
  }, [refreshPendingCount])

  // Escuchar cambios de conectividad
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      console.log('[Network] 🌐 Evento online detectado. Iniciando sincronización...')
      // Breve pausa para que los sockets del navegador se estabilicen
      setTimeout(() => {
        triggerSync()
      }, 600)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setBannerType('offline')
      setBannerMessage('Sin conexión — los reportes se guardarán localmente en tu teléfono')
      setShowBanner(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [triggerSync])

  // Limpiar reportes expirados e intentar sync inicial al montar
  useEffect(() => {
    cleanExpiredReports().then(() => {
      refreshPendingCount().then((count) => {
        if (count > 0 && navigator.onLine) {
          triggerSync()
        }
      })
    })

    // Limpiar expirados cada 5 minutos
    const interval = setInterval(() => {
      cleanExpiredReports()
      refreshPendingCount()
    }, 5 * 60 * 1000)

    return () => {
      clearInterval(interval)
    }
  }, [refreshPendingCount, triggerSync])

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        isSyncing,
        pendingCount,
        syncVersion,
        triggerSync,
        refreshPendingCount,
      }}
    >
      {children}

      {/* Banner flotante de estado de red */}
      {showBanner && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            color: '#fff',
            background:
              bannerType === 'offline'
                ? 'linear-gradient(135deg, #e74c3c, #c0392b)'
                : bannerType === 'syncing'
                  ? 'linear-gradient(135deg, #f39c12, #e67e22)'
                  : bannerType === 'error'
                    ? 'linear-gradient(135deg, #d35400, #c0392b)'
                    : 'linear-gradient(135deg, #27ae60, #2ecc71)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          {bannerType === 'offline' ? (
            <WifiOff size={16} />
          ) : bannerType === 'syncing' ? (
            <RefreshCw size={16} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <Wifi size={16} />
          )}
          {bannerMessage}
        </div>
      )}

      {/* Animaciones CSS inline */}
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </NetworkContext.Provider>
  )
}
