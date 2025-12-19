import { useState, useEffect } from 'react'
import { requestNotificationPermission, areNotificationsEnabled } from '../services/notifications'

export default function NotificationPrompt() {
  const [show, setShow] = useState(false)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const isEnabled = areNotificationsEnabled()
    setEnabled(isEnabled)
    
    // Afficher le prompt seulement si :
    // 1. Pas encore activé
    // 2. Pas refusé
    // 3. Pas déjà demandé aujourd'hui
    const lastAsked = localStorage.getItem('last-notification-prompt')
    const today = new Date().toDateString()
    
    if (!isEnabled && Notification.permission !== 'denied' && lastAsked !== today) {
      setTimeout(() => setShow(true), 5000) // Après 5 secondes
    }
  }, [])

  async function handleEnable() {
    const success = await requestNotificationPermission()
    if (success) {
      setEnabled(true)
      setShow(false)
    }
    localStorage.setItem('last-notification-prompt', new Date().toDateString())
  }

  function handleDismiss() {
    setShow(false)
    localStorage.setItem('last-notification-prompt', new Date().toDateString())
  }

  if (!show || enabled) return null

  return (
    <div style={{
      padding: 16,
      marginBottom: 24,
      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      borderRadius: 12,
      border: '2px solid #93c5fd',
      position: 'relative'
    }}>
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'none',
          border: 'none',
          fontSize: 20,
          cursor: 'pointer',
          color: '#6b7280'
        }}
      >
        ×
      </button>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ fontSize: 40 }}>🔔</div>
        
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#1e40af',
            marginBottom: 4
          }}>
            Active les notifications !
          </div>
          <div style={{
            fontSize: 14,
            color: '#6b7280',
            marginBottom: 12
          }}>
            Reçois des rappels pour ne plus gaspiller 🎯
          </div>
          
          <button
            onClick={handleEnable}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Activer 🚀
          </button>
        </div>
      </div>
    </div>
  )
}
