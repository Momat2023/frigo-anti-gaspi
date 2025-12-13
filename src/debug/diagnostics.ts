export type Diagnostics = {
  collectedAt: number
  location: string
  userAgent: string

  localStorageKeys: string[]
  localStorageCount: number

  cacheKeys: string[]
  serviceWorkers: Array<{
    scope: string
    active: boolean
    waiting: boolean
    installing: boolean
    updateViaCache?: string
  }>

  indexedDbDatabases: Array<{ name?: string; version?: number }>
}

function safeLocalStorageKeys(): string[] {
  try {
    return Object.keys(localStorage).sort()
  } catch {
    return []
  }
}

async function safeCacheKeys(): Promise<string[]> {
  try {
    if (!('caches' in window)) return []
    // CacheStorage.keys(): liste tous les caches nommés de l'origine
    return await caches.keys()
  } catch {
    return []
  }
}

async function safeServiceWorkerRegistrations(): Promise<Diagnostics['serviceWorkers']> {
  try {
    if (!('serviceWorker' in navigator)) return []
    // getRegistrations() -> array de ServiceWorkerRegistration
    const regs = await navigator.serviceWorker.getRegistrations()
    return regs.map((r) => ({
      scope: r.scope,
      active: Boolean(r.active),
      waiting: Boolean(r.waiting),
      installing: Boolean(r.installing),
      updateViaCache: (r as any).updateViaCache,
    }))
  } catch {
    return []
  }
}

async function safeIndexedDbDatabases(): Promise<Diagnostics['indexedDbDatabases']> {
  try {
    // indexedDB.databases() n'est pas dispo partout
    const anyIdb: any = indexedDB as any
    if (!anyIdb.databases) return []
    const list = await anyIdb.databases()
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export async function collectDiagnostics(): Promise<Diagnostics> {
  const lsKeys = safeLocalStorageKeys()

  return {
    collectedAt: Date.now(),
    location: typeof location !== 'undefined' ? location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',

    localStorageKeys: lsKeys,
    localStorageCount: lsKeys.length,

    cacheKeys: await safeCacheKeys(),
    serviceWorkers: await safeServiceWorkerRegistrations(),
    indexedDbDatabases: await safeIndexedDbDatabases(),
  }
}
