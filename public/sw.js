const CACHE_NAME = 'frigo-cache-v2'
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL])))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => (k === CACHE_NAME ? Promise.resolve() : caches.delete(k))))
      await self.clients.claim()
    })(),
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
    return (await caches.match(request)) || (await caches.match(OFFLINE_URL))
  }
}

// Intercepter les requêtes de la page via "fetch" event.
self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)

  if (url.origin !== self.location.origin) return

  // Navigations (pages)
  if (req.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(req))
    return
  }

  // API JSON: stratégie network-first avec fallback cache
  if (req.method === 'GET' && url.pathname.startsWith('/api/')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME)
        try {
          const res = await fetch(req)
          cache.put(req, res.clone())
          return res
        } catch {
          const cached = await cache.match(req)
          if (cached) return cached
          return (await caches.match(OFFLINE_URL)) || new Response('Offline', { status: 503 })
        }
      })(),
    )
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
  const url =
    (event.notification && event.notification.data && event.notification.data.url) || '/'
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
    }),
  )
})
EOF

