import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import { startExpiryAutoCheckLoop } from './notifications/autoCheck'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

startExpiryAutoCheckLoop()

if ('serviceWorker' in navigator) {
  let refreshing = false

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return
    refreshing = true
    window.location.reload()
  })

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // ignore
    })
  })
}
