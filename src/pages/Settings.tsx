import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../ui/Header'
import { clearAllData } from '../data/export'
import { 
  requestNotificationPermission, 
  areNotificationsEnabled,
  sendNotification 
} from '../services/notifications'

export default function Settings() {
  const navigate = useNavigate()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationDays, setNotificationDays] = useState(1)

  useEffect(() => {
    setNotificationsEnabled(areNotificationsEnabled())
    
    const stored = localStorage.getItem('notification-days-before')
    if (stored) {
      setNotificationDays(parseInt(stored))
    }
  }, [])

  async function handleEnableNotifications() {
    const granted = await requestNotificationPermission()
    setNotificationsEnabled(granted)
    
    if (granted) {
      // Envoyer une notification de test
      sendNotification('🎉 Notifications activées !', {
        body: 'Vous recevrez des rappels pour vos aliments',
        tag: 'welcome'
      })
    }
  }

  function handleNotificationDaysChange(days: number) {
    setNotificationDays(days)
    localStorage.setItem('notification-days-before', days.toString())
  }

  async function handleTestNotification() {
    await sendNotification('🧪 Test de notification', {
      body: 'Votre système de notifications fonctionne !',
      tag: 'test',
      requireInteraction: false
    })
  }

  async function handleClearAll() {
    if (!confirm('Supprimer TOUTES les données ? Cette action est irréversible.')) {
      return
    }
    
    await clearAllData()
    alert('Toutes les données ont été supprimées')
    navigate('/onboarding')
  }

  return (
    <>
      <Header />
      <main style={{ padding: 12, maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 24 }}>⚙️ Réglages</h1>

        {/* Notifications */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>🔔 Notifications</h2>
          
          <div style={{
            padding: 16,
            backgroundColor: notificationsEnabled ? '#ecfdf5' : '#fef2f2',
            border: `2px solid ${notificationsEnabled ? '#6ee7b7' : '#fca5a5'}`,
            borderRadius: 12,
            marginBottom: 16
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  {notificationsEnabled ? '✅ Activées' : '❌ Désactivées'}
                </div>
                <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
                  Rappels pour les aliments qui périment
                </div>
              </div>
              
              {!notificationsEnabled && (
                <button
                  onClick={handleEnableNotifications}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Activer
                </button>
              )}
            </div>
          </div>

          {notificationsEnabled && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: 500 
                }}>
                  Rappel avant expiration
                </label>
                <select
                  value={notificationDays}
                  onChange={e => handleNotificationDaysChange(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: 16
                  }}
                >
                  <option value="0">Le jour même</option>
                  <option value="1">1 jour avant</option>
                  <option value="2">2 jours avant</option>
                  <option value="3">3 jours avant</option>
                </select>
              </div>

              <button
                onClick={handleTestNotification}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'white',
                  color: '#6366f1',
                  border: '2px solid #6366f1',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🧪 Tester une notification
              </button>
            </>
          )}
        </section>

        {/* Données */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>💾 Données</h2>
          
          <button
            onClick={handleClearAll}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            🗑️ Supprimer toutes les données
          </button>
        </section>

        {/* Infos */}
        <section style={{ 
          padding: 16,
          backgroundColor: '#f9fafb',
          borderRadius: 12,
          fontSize: 14,
          color: '#6b7280'
        }}>
          <div style={{ marginBottom: 8 }}>
            <strong>Version :</strong> 1.0.0
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>PWA :</strong> Installable
          </div>
          <div>
            <strong>Stockage :</strong> IndexedDB + LocalStorage
          </div>
        </section>
      </main>
    </>
  )
}
