import { useState, useEffect } from 'react'
import Header from '../ui/Header'
import { trackEvent } from '../services/analytics'
import {
  requestNotificationPermission,
  areNotificationsEnabled
} from '../services/notifications'

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    trackEvent('page_view', { page: 'settings' })
    setNotificationsEnabled(areNotificationsEnabled())
    
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    if (savedTheme) {
      setTheme(savedTheme)
      document.body.className = savedTheme
    }
  }, [])

  async function handleToggleNotifications() {
    if (!notificationsEnabled) {
      const success = await requestNotificationPermission()
      setNotificationsEnabled(success)
      trackEvent('notifications_enabled', { source: 'settings' })
    } else {
      alert('Pour désactiver les notifications, va dans les paramètres de ton navigateur.')
    }
  }

  function handleThemeChange(newTheme: 'light' | 'dark') {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.body.className = newTheme
    trackEvent('theme_changed', { theme: newTheme })
  }

  function handleClearData() {
    if (confirm('⚠️ Supprimer toutes les données ? Cette action est irréversible.')) {
      // Sauvegarder l'onboarding
      const onboarding = localStorage.getItem('onboarding-done')
      
      // Tout effacer
      localStorage.clear()
      
      // Restaurer l'onboarding
      if (onboarding) {
        localStorage.setItem('onboarding-done', onboarding)
      }
      
      // Effacer IndexedDB
      indexedDB.deleteDatabase('frigo-anti-gaspi')
      
      trackEvent('data_cleared')
      alert('✅ Données effacées ! Recharge la page.')
      window.location.reload()
    }
  }

  function handleExportData() {
    const data = {
      items: [],
      stats: localStorage.getItem('stats'),
      streak: localStorage.getItem('current-streak'),
      xp: localStorage.getItem('total-xp'),
      badges: localStorage.getItem('unlocked-badges'),
      chests: localStorage.getItem('chest-history'),
      notifications: localStorage.getItem('notification-history'),
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `frigo-backup-${Date.now()}.json`
    a.click()
    
    trackEvent('data_exported')
  }

  return (
    <>
      <Header />
      <main style={{ padding: 16 }}>
        <h1 style={{ marginBottom: 24 }}>⚙️ Paramètres</h1>

        {/* NOTIFICATIONS */}
        <section style={{ 
          marginBottom: 32,
          padding: 20,
          backgroundColor: '#f9fafb',
          borderRadius: 12,
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>🔔 Notifications</h2>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12
          }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                Rappels intelligents
              </div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>
                Reçois des notifications pour tes aliments
              </div>
            </div>
            
            <button
              onClick={handleToggleNotifications}
              style={{
                padding: '8px 16px',
                backgroundColor: notificationsEnabled ? '#16a34a' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {notificationsEnabled ? '✅ Activées' : 'Activer'}
            </button>
          </div>

          {notificationsEnabled && (
            <div style={{
              padding: 12,
              backgroundColor: '#dbeafe',
              borderRadius: 8,
              fontSize: 13,
              color: '#1e40af'
            }}>
              ✨ Tu recevras des rappels chaque jour à 8h + alertes pour aliments urgents
            </div>
          )}
        </section>

        {/* THÈME */}
        <section style={{ 
          marginBottom: 32,
          padding: 20,
          backgroundColor: '#f9fafb',
          borderRadius: 12,
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>🎨 Apparence</h2>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => handleThemeChange('light')}
              style={{
                flex: 1,
                padding: 16,
                backgroundColor: theme === 'light' ? '#3b82f6' : 'white',
                color: theme === 'light' ? 'white' : '#111',
                border: '2px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ☀️ Clair
            </button>
            
            <button
              onClick={() => handleThemeChange('dark')}
              style={{
                flex: 1,
                padding: 16,
                backgroundColor: theme === 'dark' ? '#3b82f6' : 'white',
                color: theme === 'dark' ? 'white' : '#111',
                border: '2px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🌙 Sombre
            </button>
          </div>
        </section>

        {/* DONNÉES */}
        <section style={{ 
          marginBottom: 32,
          padding: 20,
          backgroundColor: '#f9fafb',
          borderRadius: 12,
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>💾 Mes données</h2>
          
          <button
            onClick={handleExportData}
            style={{
              width: '100%',
              padding: 14,
              marginBottom: 12,
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            📥 Exporter mes données
          </button>
          
          <button
            onClick={handleClearData}
            style={{
              width: '100%',
              padding: 14,
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            🗑️ Tout effacer
          </button>
        </section>

        {/* INFOS */}
        <section style={{
          padding: 20,
          backgroundColor: '#f9fafb',
          borderRadius: 12,
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>ℹ️ Informations</h2>
          
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
            <strong>Version :</strong> 1.0.0
          </div>
          
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
            <strong>Développé par :</strong> Frigo Anti-Gaspi Team
          </div>
          
          <div style={{ fontSize: 14, color: '#6b7280' }}>
            <strong>Contact :</strong> support@frigo-antigaspi.fr
          </div>
        </section>
      </main>
    </>
  )
}
