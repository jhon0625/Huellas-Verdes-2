// =========================================================
// syncEngine.js — Motor de sincronización offline → Supabase
// =========================================================
// Intenta subir los reportes pendientes cuando hay conexión.
// Se registra en el evento 'online' para re-intentar automáticamente.
// =========================================================

import {
  getPendingReports,
  markReportSynced,
  cleanExpiredReports,
} from './offlineDb'

const PHOTO_BUCKET = 'threat-photos'

/**
 * Genera un ID único para el nombre del archivo de la foto.
 */
function createPhotoId() {
  const cryptoApi = globalThis.crypto
  if (typeof cryptoApi?.randomUUID === 'function') return cryptoApi.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Sube un reporte pendiente individual a Supabase.
 * 1. Si tiene foto → la sube a Storage primero
 * 2. Inserta el registro en la tabla threats
 * 3. Marca el reporte local como sincronizado
 *
 * @returns {boolean} true si se sincronizó exitosamente
 */
async function syncOneReport(supabase, report) {
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const activeUserId = sessionData?.session?.user?.id || report.reporter_id

    if (!activeUserId) {
      console.error('[Sync] Error: no se encontró ID de usuario para sincronizar')
      return false
    }

    let photoUrl = null

    // 1. Subir foto si existe
    if (report.photo_blob) {
      try {
        const photoPath = `${activeUserId}/${createPhotoId()}`
        const { error: uploadError } = await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(photoPath, report.photo_blob, {
            cacheControl: '3600',
            contentType: report.photo_type || 'image/jpeg',
            upsert: false,
          })

        if (uploadError) {
          console.warn('[Sync] Advertencia subiendo foto a Supabase Storage:', uploadError.message)
        } else {
          photoUrl = supabase.storage
            .from(PHOTO_BUCKET)
            .getPublicUrl(photoPath).data?.publicUrl || null
        }
      } catch (photoErr) {
        console.warn('[Sync] Error inesperado subiendo foto:', photoErr)
      }
    }

    // 2. Insertar el reporte en Supabase
    const { data, error: insertError } = await supabase
      .from('threats')
      .insert({
        reporter_id: activeUserId,
        title: report.title,
        description: report.description,
        category: report.category,
        lat: report.lat,
        lng: report.lng,
        photo_url: photoUrl,
        created_at: report.created_at || new Date().toISOString(),
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('[Sync] Error insertando reporte en Supabase:', insertError.message, insertError)
      return false
    }

    // 3. Marcar como sincronizado en IndexedDB
    await markReportSynced(report.localId, data?.id || null)
    console.log('[Sync] ✅ Reporte sincronizado con éxito:', report.title, '(ID:', data?.id, ')')
    return true
  } catch (err) {
    console.error('[Sync] Error inesperado sincronizando:', err)
    return false
  }
}

/**
 * Sincroniza TODOS los reportes pendientes con Supabase.
 *
 * @returns {{ synced: number, failed: number }}
 */
export async function syncAllPending(supabase) {
  if (!supabase) return { synced: 0, failed: 0 }
  if (!navigator.onLine) return { synced: 0, failed: 0 }

  // Limpiar expirados primero
  await cleanExpiredReports()

  const pending = await getPendingReports()

  if (pending.length === 0) return { synced: 0, failed: 0 }

  console.log(`[Sync] Sincronizando ${pending.length} reporte(s) pendiente(s)...`)

  let synced = 0
  let failed = 0

  for (const report of pending) {
    const ok = await syncOneReport(supabase, report)
    if (ok) synced++
    else failed++
  }

  console.log(`[Sync] Resultado: ${synced} sincronizados, ${failed} fallidos`)
  return { synced, failed }
}

/**
 * Registra listeners de red para sincronizar automáticamente
 * cuando el usuario recupera conexión.
 *
 * @returns {Function} cleanup — función para remover los listeners
 */
export function startAutoSync(supabase) {
  const handleOnline = () => {
    console.log('[Sync] 🌐 Conexión recuperada. Sincronizando...')
    syncAllPending(supabase)
  }

  window.addEventListener('online', handleOnline)

  // Intentar sincronizar al iniciar (por si quedaron pendientes de una sesión anterior)
  if (navigator.onLine) {
    // Pequeño delay para no competir con la carga inicial
    setTimeout(() => syncAllPending(supabase), 2000)
  }

  // Retornar función de limpieza
  return () => {
    window.removeEventListener('online', handleOnline)
  }
}
