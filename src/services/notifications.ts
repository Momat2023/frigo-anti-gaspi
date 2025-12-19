import { checkAndScheduleNotifications, scheduleMorningMotivation } from './smartNotifications'

const NOTIFICATION_CHECK_INTERVAL = 60 * 60 * 1000 // 1 heure

export function initNotifications() {
  if ('Notification' in window && Notification.permission === 'default') {
    console.log('Notifications disponibles mais permission non demandée')
  }
  
  // Vérifications automatiques toutes les heures
  setInterval(() => {
    checkAndScheduleNotifications()
  }, NOTIFICATION_CHECK_INTERVAL)
  
  // Vérification immédiate au chargement
  checkAndScheduleNotifications()
  
  // Programmer le message matinal
  scheduleMorningMotivation()
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('Notifications non supportées')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      // Envoyer une notification de bienvenue
      new Notification('🎉 Notifications activées !', {
        body: 'Tu recevras maintenant des rappels pour ne plus gaspiller',
        icon: '/pwa-192x192.png'
      })
      
      // Démarrer les vérifications
      checkAndScheduleNotifications()
      scheduleMorningMotivation()
      
      return true
    }
  }

  return false
}

export function areNotificationsEnabled(): boolean {
  return 'Notification' in window && Notification.permission === 'granted'
}

export function scheduleNotification(
  itemId: number,
  itemName: string,
  expiresAt: number,
  daysBefore: number = 1
) {
  if (!areNotificationsEnabled()) return

  const notifyAt = expiresAt - daysBefore * 24 * 60 * 60 * 1000
  const delay = notifyAt - Date.now()

  if (delay > 0) {
    setTimeout(() => {
      new Notification('⏰ Aliment à consommer !', {
        body: `${itemName} expire ${daysBefore === 0 ? 'aujourd\'hui' : `dans ${daysBefore} jour(s)`}`,
        icon: '/pwa-192x192.png',
        tag: `item-${itemId}`,
        requireInteraction: true
      })
    }, delay)
  }
}
