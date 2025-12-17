export type NotificationSchedule = {
  itemId: number
  itemName: string
  scheduledFor: number
  notificationId: string
}

const STORAGE_KEY = 'scheduled-notifications'

/**
 * Demande la permission pour les notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('Les notifications ne sont pas supportées')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

/**
 * Vérifie si les notifications sont activées
 */
export function areNotificationsEnabled(): boolean {
  return 'Notification' in window && Notification.permission === 'granted'
}

/**
 * Envoie une notification immédiate
 */
export async function sendNotification(title: string, options?: NotificationOptions) {
  if (!areNotificationsEnabled()) {
    console.log('Notifications non activées')
    return
  }

  try {
    // Si on a un Service Worker, l'utiliser
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        ...options
      })
    } else {
      // Sinon, notification simple
      new Notification(title, {
        icon: '/pwa-192x192.png',
        ...options
      })
    }
  } catch (error) {
    console.error('Erreur notification:', error)
  }
}

/**
 * Programme une notification pour un aliment
 */
export function scheduleNotification(
  itemId: number,
  itemName: string,
  expiresAt: number,
  daysBeforeExpiry: number = 1
): string {
  const notificationTime = expiresAt - (daysBeforeExpiry * 24 * 60 * 60 * 1000)
  const now = Date.now()

  if (notificationTime <= now) {
    // Si déjà périmé ou expire très bientôt, notifier immédiatement
    sendNotification('⚠️ Aliment à consommer', {
      body: `${itemName} expire bientôt !`,
      tag: `item-${itemId}`,
      requireInteraction: true
    })
    return `item-${itemId}-${Date.now()}`
  }

  // Sauvegarder la programmation
  const notificationId = `item-${itemId}-${Date.now()}`
  const schedule: NotificationSchedule = {
    itemId,
    itemName,
    scheduledFor: notificationTime,
    notificationId
  }

  const schedules = getScheduledNotifications()
  schedules.push(schedule)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules))

  // Programmer un timeout (limité à 24h max)
  const delay = Math.min(notificationTime - now, 24 * 60 * 60 * 1000)
  
  setTimeout(() => {
    sendNotification('⚠️ Aliment à consommer', {
      body: `${itemName} expire dans ${daysBeforeExpiry} jour(s) !`,
      tag: `item-${itemId}`,
      requireInteraction: true
    })
  }, delay)

  return notificationId
}

/**
 * Récupère les notifications programmées
 */
export function getScheduledNotifications(): NotificationSchedule[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

/**
 * Annule une notification programmée
 */
export function cancelNotification(notificationId: string) {
  const schedules = getScheduledNotifications()
  const filtered = schedules.filter(s => s.notificationId !== notificationId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

/**
 * Annule toutes les notifications d'un aliment
 */
export function cancelItemNotifications(itemId: number) {
  const schedules = getScheduledNotifications()
  const filtered = schedules.filter(s => s.itemId !== itemId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

/**
 * Vérifie et envoie les notifications en attente
 */
export function checkPendingNotifications() {
  const schedules = getScheduledNotifications()
  const now = Date.now()
  const toNotify: NotificationSchedule[] = []
  const toKeep: NotificationSchedule[] = []

  schedules.forEach(schedule => {
    if (schedule.scheduledFor <= now) {
      toNotify.push(schedule)
    } else {
      toKeep.push(schedule)
    }
  })

  // Envoyer les notifications en attente
  toNotify.forEach(schedule => {
    sendNotification('⚠️ Aliment à consommer', {
      body: `${schedule.itemName} expire bientôt !`,
      tag: `item-${schedule.itemId}`,
      requireInteraction: true
    })
  })

  // Garder uniquement les futures notifications
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toKeep))
}

/**
 * Initialise le système de notifications
 */
export function initNotifications() {
  // Vérifier les notifications en attente au démarrage
  checkPendingNotifications()

  // Vérifier toutes les heures
  setInterval(checkPendingNotifications, 60 * 60 * 1000)
}
