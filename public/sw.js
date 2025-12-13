const CACHE_NAME = 'frigo-cache-v1'
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (event) => {
  // Ne pas skipWaiting automatiquement (Jour 17: update waiting)
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL]))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => (k === CACHE_NAME ? Promise.resolve() : caches.delete(k))))
      await self.clients.claim()
    })()
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  const res = await fetch(request)
  // Cache.put: stocke une paire requête/réponse (réponse clonée). [web:1080]
  const cache = await caches.open(CACHE_NAME)
  cache.put(request, res.clone())
  return res
}

async function networkFirstNavigation(request) {
  try {
    const res = await fetch(request)
    const cache = await caches.open(CACHE_NAME)
    cache.put(request, res.clone())
    return res
  } catch {
    // si offline: tente page demandée en cache, sinon offline.html
    return (await caches.match(request)) || (await caches.match(OFFLINE_URL))
  }
}

// Intercepter les requêtes de la page via "fetch" event. [web:1079]
self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)

  // Ne cache que le même origin
  if (url.origin !== self.location.origin) return

  // Navigations (pages)
  if (req.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(req))
    return
  }

  // Assets (scripts/styles/images/fonts) en cache-first
  if (req.method === 'GET') {
    const dest = req.destination
    if (dest === 'script' || dest === 'style' || dest === 'image' || dest === 'font') {
      event.respondWith(cacheFirst(req))
    }
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification && event.notification.data && event.notification.data.url) || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      for (const c of clientsArr) {
        if ('focus' in c) {
          c.focus()
          c.navigate(url)
          return
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    })
  )
})
