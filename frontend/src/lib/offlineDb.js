// =========================================================
// offlineDb.js — Wrapper sobre IndexedDB para Huellas Verdes
// =========================================================
// Base de datos local que almacena reportes creados offline
// y los sincroniza con Supabase cuando hay conexión.
// =========================================================

const DB_NAME = 'huellas-verdes-offline'
const DB_VERSION = 1
const STORE_NAME = 'pending_reports'

// Tiempo de vida de un reporte (2 horas en milisegundos)
export const REPORT_TTL_MS = 2 * 60 * 60 * 1000

/**
 * Abre (o crea) la base de datos IndexedDB.
 * Solo crea el esquema la primera vez o al subir de versión.
 */
export function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'localId' })
        // Índice para buscar los reportes que aún no se suben a Supabase
        store.createIndex('synced', 'synced', { unique: false })
        // Índice para limpiar reportes expirados (> 2 horas)
        store.createIndex('created_at', 'created_at', { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Genera un ID local único para cada reporte offline.
 */
function generateLocalId() {
  const crypto = globalThis.crypto
  if (typeof crypto?.randomUUID === 'function') return crypto.randomUUID()

  if (typeof crypto?.getRandomValues === 'function') {
    const bytes = crypto.getRandomValues(new Uint8Array(16))
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
    return [
      hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16),
      hex.slice(16, 20), hex.slice(20),
    ].join('-')
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Guarda un reporte en IndexedDB como "pendiente de sincronización".
 *
 * @param {Object} report - Datos del reporte (title, description, category, lat, lng, etc.)
 * @param {File|null} photoFile - Archivo de imagen capturado
 * @returns {Promise<Object>} El reporte guardado con su localId
 */
export async function savePendingReport(report, photoFile = null) {
  const db = await openDb()
  const localId = generateLocalId()

  const entry = {
    localId,
    reporter_id: report.reporter_id,
    title: report.title,
    description: report.description || null,
    category: report.category,
    lat: report.lat,
    lng: report.lng,
    // Guardamos el blob de la foto directamente en IndexedDB
    photo_blob: photoFile || null,
    photo_type: photoFile?.type || null,
    photo_name: photoFile?.name || null,
    created_at: new Date().toISOString(),
    synced: false,
    remote_id: null,
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.put(entry)

    request.onsuccess = () => resolve(entry)
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
  })
}

/**
 * Obtiene todos los reportes que aún no se han sincronizado con Supabase.
 * Usa store.getAll() para máxima compatibilidad (los booleanos no son claves válidas de índice en IndexedDB).
 */
export async function getPendingReports() {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => {
      const all = request.result || []
      const pending = all.filter((r) => r.synced === false || !r.synced)
      resolve(pending)
    }
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
  })
}

/**
 * Obtiene TODOS los reportes locales (sincronizados o no) que no hayan expirado.
 */
export async function getAllLocalReports() {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => {
      const cutoff = new Date(Date.now() - REPORT_TTL_MS).toISOString()
      const valid = (request.result || []).filter((r) => r.created_at > cutoff)
      resolve(valid)
    }
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
  })
}

/**
 * Marca un reporte local como sincronizado exitosamente.
 */
export async function markReportSynced(localId, remoteId) {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const getReq = store.get(localId)

    getReq.onsuccess = () => {
      const entry = getReq.result
      if (!entry) {
        resolve()
        return
      }
      entry.synced = true
      entry.remote_id = remoteId
      // Liberamos el blob de la foto de memoria local tras subir a Supabase
      entry.photo_blob = null
      const putReq = store.put(entry)
      putReq.onsuccess = () => resolve()
      putReq.onerror = () => reject(putReq.error)
    }

    getReq.onerror = () => reject(getReq.error)
    tx.oncomplete = () => db.close()
  })
}

/**
 * Elimina un reporte local por su localId.
 */
export async function deletePendingReport(localId) {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.delete(localId)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
  })
}

/**
 * Elimina todos los reportes locales más viejos de 2 horas.
 * Se llama al iniciar la app y periódicamente.
 */
export async function cleanExpiredReports() {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => {
      const cutoff = new Date(Date.now() - REPORT_TTL_MS).toISOString()
      const expired = (request.result || []).filter((r) => r.created_at <= cutoff)

      for (const report of expired) {
        store.delete(report.localId)
      }

      resolve(expired.length)
    }

    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
  })
}
