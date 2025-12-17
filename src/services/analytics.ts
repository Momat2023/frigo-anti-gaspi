import { openDB } from 'idb'
import type { DBSchema } from 'idb'

interface AnalyticsDB extends DBSchema {
  events: {
    key: number
    value: {
      id: number
      userId: string
      eventName: string
      properties: Record<string, any>
      timestamp: number
    }
  }
  user: {
    key: 'userId'
    value: {
      userId: string
      firstVisit: number
      lastVisit: number
      totalSessions: number
    }
  }
}

export async function getAnalyticsDB() {
  return openDB<AnalyticsDB>('analytics-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('events')) {
        db.createObjectStore('events', { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains('user')) {
        db.createObjectStore('user')
      }
    }
  })
}

// Générer un ID utilisateur unique
export async function getUserId(): Promise<string> {
  const db = await getAnalyticsDB()
  let user = await db.get('user', 'userId')
  
  if (!user) {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    user = {
      userId,
      firstVisit: Date.now(),
      lastVisit: Date.now(),
      totalSessions: 1
    }
    await db.put('user', user, 'userId')
  } else {
    user.lastVisit = Date.now()
    user.totalSessions++
    await db.put('user', user, 'userId')
  }
  
  return user.userId
}

// Tracker un événement (local + Vercel)
export async function trackEvent(eventName: string, properties?: Record<string, any>) {
  try {
    // 1. Tracker localement dans IndexedDB
    const db = await getAnalyticsDB()
    const userId = await getUserId()
    
    await db.add('events', {
      id: Date.now(),
      userId,
      eventName,
      properties: properties || {},
      timestamp: Date.now()
    })

    // 2. Tracker avec Vercel Analytics (si disponible)
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', eventName, properties)
    }

    // 3. Log en développement
    if (import.meta.env.DEV) {
      console.log('📊 Event:', eventName, properties)
    }
  } catch (error) {
    console.error('Error tracking event:', error)
  }
}

// Récupérer les stats locales
export async function getLocalStats() {
  const db = await getAnalyticsDB()
  const events = await db.getAll('events')
  const user = await db.get('user', 'userId')
  
  // Compter les événements par type
  const eventCounts: Record<string, number> = {}
  events.forEach(event => {
    eventCounts[event.eventName] = (eventCounts[event.eventName] || 0) + 1
  })
  
  const now = Date.now()
  const oneDayAgo = now - 24 * 60 * 60 * 1000
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
  
  return {
    totalEvents: events.length,
    eventCounts,
    user,
    last24Hours: events.filter(e => e.timestamp > oneDayAgo),
    last7Days: events.filter(e => e.timestamp > sevenDaysAgo),
    last30Days: events.filter(e => e.timestamp > thirtyDaysAgo)
  }
}

// Calculer le MAU (Monthly Active Users)
export async function getMAU(): Promise<number> {
  const db = await getAnalyticsDB()
  const events = await db.getAll('events')
  
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  const recentEvents = events.filter(e => e.timestamp > thirtyDaysAgo)
  
  const uniqueUsers = new Set(recentEvents.map(e => e.userId))
  return uniqueUsers.size
}

// Calculer le DAU (Daily Active Users)
export async function getDAU(): Promise<number> {
  const db = await getAnalyticsDB()
  const events = await db.getAll('events')
  
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
  const todayEvents = events.filter(e => e.timestamp > oneDayAgo)
  
  const uniqueUsers = new Set(todayEvents.map(e => e.userId))
  return uniqueUsers.size
}
