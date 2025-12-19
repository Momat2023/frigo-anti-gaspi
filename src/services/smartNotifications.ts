import { getCurrentLevel } from '../data/xp'
import { getStats } from '../data/stats'
import { getAvailableChest } from '../data/chests'
import { getDb } from '../data/db'

export type NotificationTrigger = 
  | 'morning_motivation'
  | 'chest_available'
  | 'items_expiring'
  | 'streak_milestone'
  | 'level_up_close'
  | 'inactivity_reminder'
  | 'achievement_celebration'
  | 'perfect_day'
  | 'weekly_summary'

export type SmartNotification = {
  id: string
  trigger: NotificationTrigger
  title: string
  body: string
  emoji: string
  priority: 'high' | 'medium' | 'low'
  scheduledFor: number
}

// Messages par trigger
const NOTIFICATION_TEMPLATES = {
  morning_motivation: [
    { title: "🌅 Bonjour champion !", body: "Prêt à sauver des aliments aujourd'hui ?" },
    { title: "☀️ Nouveau jour, nouveau défi !", body: "Ton frigo compte sur toi !" },
    { title: "🎯 C'est parti !", body: "Objectif du jour : 0 gaspillage 💪" },
  ],
  
  chest_available: [
    { title: "🎁 Ton coffre t'attend !", body: "Ouvre-le avant qu'il ne disparaisse !" },
    { title: "💎 Cadeau quotidien !", body: "Clique pour découvrir ta récompense" },
    { title: "🎉 Coffre mystère !", body: "Qu'est-ce que tu vas gagner aujourd'hui ?" },
  ],
  
  items_expiring: [
    { title: "⏰ Attention !", body: "{count} aliment(s) expire(nt) bientôt" },
    { title: "🍽️ À cuisiner !", body: "{items} t'attend(ent) dans le frigo" },
    { title: "⚡ Urgent !", body: "Sauve {items} avant qu'il ne soit trop tard" },
  ],
  
  streak_milestone: [
    { title: "🔥 {days} jours de streak !", body: "Tu es en feu ! Continue comme ça ! 💪" },
    { title: "🏆 Incroyable !", body: "{days} jours sans gaspillage ! Tu assures !" },
    { title: "⭐ Streak de légende !", body: "{days} jours ! Tu es un pro de l'anti-gaspi !" },
  ],
  
  level_up_close: [
    { title: "🎮 Presque là !", body: "Plus que {xp} XP pour passer niveau {level} !" },
    { title: "⚡ Encore un effort !", body: "{xp} XP et tu débloques de nouvelles récompenses !" },
    { title: "🚀 Tu y es presque !", body: "Niveau {level} à portée de main !" },
  ],
  
  inactivity_reminder: [
    { title: "👋 Ça fait longtemps !", body: "Ton frigo a besoin de toi 🧊" },
    { title: "🤔 Tout va bien ?", body: "On s'inquiète pour tes aliments..." },
    { title: "💚 On t'a manqué ?", body: "Reviens vite, on a des surprises !" },
  ],
  
  achievement_celebration: [
    { title: "🎊 Félicitations !", body: "{achievement} débloqué ! Tu es au top !" },
    { title: "🌟 Incroyable !", body: "{achievement} ! Seulement {percent}% y arrivent !" },
    { title: "💎 Légendaire !", body: "{achievement} obtenu ! Tu es exceptionnel !" },
  ],
  
  perfect_day: [
    { title: "✨ Journée parfaite !", body: "0 gaspillage aujourd'hui ! Bravo ! 🎉" },
    { title: "🏆 Champion du jour !", body: "Tous tes aliments sauvés ! Incroyable !" },
    { title: "💯 Parfait !", body: "100% de réussite aujourd'hui ! Continue !" },
  ],
  
  weekly_summary: [
    { title: "📊 Bilan de la semaine", body: "{consumed} aliments sauvés ! Tu as économisé {money}€ 💰" },
    { title: "🎯 Résumé hebdo", body: "{rate}% de réussite ! {comparison} vs semaine dernière" },
    { title: "📈 Stats de la semaine", body: "Tu progresses ! +{progress}% cette semaine !" },
  ],
}

// Timing intelligent - Ne jamais notifier la nuit
function isGoodTime(): boolean {
  const hour = new Date().getHours()
  return hour >= 8 && hour <= 22 // Entre 8h et 22h
}

function getRandomTemplate(trigger: NotificationTrigger) {
  const templates = NOTIFICATION_TEMPLATES[trigger]
  return templates[Math.floor(Math.random() * templates.length)]
}

function formatMessage(template: { title: string, body: string }, vars: Record<string, any>) {
  let title = template.title
  let body = template.body
  
  for (const [key, value] of Object.entries(vars)) {
    title = title.replace(`{${key}}`, String(value))
    body = body.replace(`{${key}}`, String(value))
  }
  
  return { title, body }
}

export async function scheduleSmartNotification(
  trigger: NotificationTrigger, 
  vars: Record<string, any> = {},
  delayMinutes: number = 0
) {
  if (Notification.permission !== 'granted') return

  const template = getRandomTemplate(trigger)
  const { title, body } = formatMessage(template, vars)
  
  const scheduledFor = Date.now() + delayMinutes * 60 * 1000
  
  const notification: SmartNotification = {
    id: `notif_${Date.now()}_${Math.random()}`,
    trigger,
    title,
    body,
    emoji: template.title.match(/[\u{1F300}-\u{1F9FF}]/u)?.[0] || '📱',
    priority: getPriority(trigger),
    scheduledFor
  }
  
  // Enregistrer dans la queue
  const queue = getNotificationQueue()
  queue.push(notification)
  localStorage.setItem('notification-queue', JSON.stringify(queue))
  
  // Planifier l'envoi
  if (delayMinutes === 0) {
    sendNotification(notification)
  } else {
    setTimeout(() => sendNotification(notification), delayMinutes * 60 * 1000)
  }
}

function getPriority(trigger: NotificationTrigger): 'high' | 'medium' | 'low' {
  const high: NotificationTrigger[] = ['items_expiring', 'streak_milestone']
  const medium: NotificationTrigger[] = ['chest_available', 'level_up_close', 'perfect_day']
  
  if (high.includes(trigger)) return 'high'
  if (medium.includes(trigger)) return 'medium'
  return 'low'
}

function sendNotification(notification: SmartNotification) {
  if (!isGoodTime()) {
    // Reprogrammer pour le matin
    const tomorrow8am = new Date()
    tomorrow8am.setDate(tomorrow8am.getDate() + 1)
    tomorrow8am.setHours(8, 0, 0, 0)
    
    const delay = tomorrow8am.getTime() - Date.now()
    setTimeout(() => sendNotification(notification), delay)
    return
  }
  
  new Notification(notification.title, {
    body: notification.body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: notification.trigger,
    requireInteraction: notification.priority === 'high',
    data: { trigger: notification.trigger }
  })
  
  // Enregistrer dans l'historique
  const history = getNotificationHistory()
  history.push({
    ...notification,
    sentAt: Date.now()
  })
  localStorage.setItem('notification-history', JSON.stringify(history))
}

function getNotificationQueue(): SmartNotification[] {
  const queue = localStorage.getItem('notification-queue')
  return queue ? JSON.parse(queue) : []
}

function getNotificationHistory() {
  const history = localStorage.getItem('notification-history')
  return history ? JSON.parse(history) : []
}

// Vérifications automatiques
export async function checkAndScheduleNotifications() {
  // 1. Coffre disponible ?
  const chest = await getAvailableChest()
  if (chest?.canOpen) {
    const lastChestNotif = localStorage.getItem('last-chest-notification')
    const now = Date.now()
    
    if (!lastChestNotif || now - parseInt(lastChestNotif) > 6 * 60 * 60 * 1000) {
      await scheduleSmartNotification('chest_available')
      localStorage.setItem('last-chest-notification', now.toString())
    }
  }
  
  // 2. Aliments qui expirent ?
  const db = await getDb()
  const items = await db.getAll('items')
  const urgent = items.filter(item => {
    if (item.status !== 'active') return false
    const daysLeft = Math.ceil((item.expiresAt - Date.now()) / (24 * 60 * 60 * 1000))
    return daysLeft <= 1 && daysLeft >= 0
  })
  
  if (urgent.length > 0) {
    await scheduleSmartNotification('items_expiring', {
      count: urgent.length,
      items: urgent[0].name + (urgent.length > 1 ? ` et ${urgent.length - 1} autre(s)` : '')
    })
  }
  
  // 3. Proche du level up ?
  const level = await getCurrentLevel()
  if (level.xpToNext <= 50) {
    await scheduleSmartNotification('level_up_close', {
      xp: level.xpToNext,
      level: level.level + 1
    })
  }
  
  // 4. Journée parfaite ?
  const stats = await getStats()
  const todayThrown = await getTodayThrown()
  if (todayThrown === 0 && stats.consumed > 0) {
    const lastPerfectNotif = localStorage.getItem('last-perfect-day-notif')
    const today = new Date().toDateString()
    
    if (lastPerfectNotif !== today) {
      await scheduleSmartNotification('perfect_day', {}, 120) // Dans 2h
      localStorage.setItem('last-perfect-day-notif', today)
    }
  }
  
  // 5. Inactivité ?
  const lastActivity = localStorage.getItem('last-activity-date')
  if (lastActivity) {
    const daysSinceActivity = Math.floor((Date.now() - parseInt(lastActivity)) / (24 * 60 * 60 * 1000))
    
    if (daysSinceActivity >= 2) {
      await scheduleSmartNotification('inactivity_reminder')
    }
  }
}

async function getTodayThrown(): Promise<number> {
  const db = await getDb()
  const items = await db.getAll('items')
  
  const today = new Date().setHours(0, 0, 0, 0)
  return items.filter(item => 
    item.status === 'thrown' && 
    item.openedAt >= today
  ).length
}

// Message de motivation matinal
export async function scheduleMorningMotivation() {
  const now = new Date()
  let tomorrow8am = new Date()
  tomorrow8am.setDate(tomorrow8am.getDate() + 1)
  tomorrow8am.setHours(8, 0, 0, 0)
  
  // Si on est avant 8h, programmer pour aujourd'hui
  if (now.getHours() < 8) {
    tomorrow8am = new Date()
    tomorrow8am.setHours(8, 0, 0, 0)
  }
  
  const delay = Math.floor((tomorrow8am.getTime() - now.getTime()) / (60 * 1000))
  await scheduleSmartNotification('morning_motivation', {}, delay)
}

// Stats notifications
export function getNotificationStats() {
  const history = getNotificationHistory()
  
  const total = history.length
  const last7Days = history.filter((n: any) => 
    n.sentAt >= Date.now() - 7 * 24 * 60 * 60 * 1000
  ).length
  
  const byTrigger: Record<string, number> = {}
  history.forEach((n: any) => {
    byTrigger[n.trigger] = (byTrigger[n.trigger] || 0) + 1
  })
  
  return { total, last7Days, byTrigger }
}
