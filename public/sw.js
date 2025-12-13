self.addEventListener('install', () => {
  // IMPORTANT: ne pas skipWaiting automatiquement
  // -> permet d'avoir un worker "waiting" et d'afficher "Update disponible"
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
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
