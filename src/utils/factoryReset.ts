import { getDb } from '../data/db'

export async function factoryResetThisDevice() {
  // 1) localStorage (scan history, deviceId, etc.)
  try {
    localStorage.clear()
  } catch {
    // ignore
  }

  // 2) IndexedDB: supprimer la base utilisée par getDb()
  // IDBFactory.deleteDatabase() demande la suppression de la DB, asynchrone. [web:1127]
  try {
    const db = await getDb()
    const name = db.name
    db.close()

    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.deleteDatabase(name)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error || new Error('deleteDatabase error'))
      req.onblocked = () => resolve() // si bloqué, on ignore
    })
  } catch {
    // ignore
  }

  // 3) CacheStorage: supprimer tous les caches (SW). [web:1121][web:1120]
  try {
    const keys = await caches.keys()
    await Promise.all(keys.map((k) => caches.delete(k)))
  } catch {
    // ignore
  }

  // 4) Service workers: unregister tous les enregistrements. [web:1131][web:571]
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map((r) => r.unregister()))
    }
  } catch {
    // ignore
  }
}
