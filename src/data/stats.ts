import { getDb } from './db'
import type { Item } from './types'

export type Stats = {
  consumed: number
  thrown: number
  totalSaved: number
  totalWasted: number
  successRate: number
  streak: number
  lastActivityDate: number
}

export type Badge = {
  id: string
  name: string
  description: string
  icon: string
  condition: (stats: Stats) => boolean
  unlocked?: boolean
}

export const ALL_BADGES: Badge[] = [
  {
    id: 'first-step',
    name: 'Premier pas',
    description: 'Consommer votre premier aliment',
    icon: '🌱',
    condition: (s) => s.consumed >= 1
  },
  {
    id: 'save-10',
    name: 'Économe',
    description: 'Sauver 10 aliments',
    icon: '💚',
    condition: (s) => s.consumed >= 10
  },
  {
    id: 'save-50',
    name: 'Héros anti-gaspi',
    description: 'Sauver 50 aliments',
    icon: '🏆',
    condition: (s) => s.consumed >= 50
  },
  {
    id: 'save-100',
    name: 'Légende',
    description: 'Sauver 100 aliments',
    icon: '💎',
    condition: (s) => s.consumed >= 100
  },
  {
    id: 'perfect-week',
    name: 'Semaine parfaite',
    description: '7 jours sans gaspillage',
    icon: '⭐',
    condition: (s) => s.streak >= 7
  },
  {
    id: 'streak-30',
    name: 'Maître du streak',
    description: '30 jours consécutifs sans gaspillage',
    icon: '🔥',
    condition: (s) => s.streak >= 30
  },
  {
    id: 'high-success',
    name: 'Perfectionniste',
    description: 'Taux de réussite supérieur à 90%',
    icon: '🎯',
    condition: (s) => s.successRate >= 90
  },
  {
    id: 'money-saver',
    name: 'Économiste',
    description: 'Économiser plus de 100€',
    icon: '💰',
    condition: (s) => s.totalSaved >= 100
  }
]

const AVG_PRICE = 3

function getStreak(items: Item[]): number {
  const consumed = items.filter(i => i.status === 'eaten').sort((a, b) => b.openedAt - a.openedAt)
  const thrown = items.filter(i => i.status === 'thrown').sort((a, b) => b.openedAt - a.openedAt)
  
  if (consumed.length === 0) return 0
  
  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < 365; i++) {
    const dayStart = currentDate.getTime()
    const dayEnd = dayStart + 24 * 60 * 60 * 1000
    
    const thrownToday = thrown.some(item => {
      const itemDate = item.openedAt
      return itemDate >= dayStart && itemDate < dayEnd
    })
    
    if (thrownToday) {
      break
    }
    
    const consumedToday = consumed.some(item => {
      const itemDate = item.openedAt
      return itemDate >= dayStart && itemDate < dayEnd
    })
    
    if (consumedToday || i === 0) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }
  
  return streak
}

export async function getStats(): Promise<Stats> {
  const db = await getDb()
  const items = await db.getAll('items')
  
  const consumed = items.filter(i => i.status === 'eaten')
  const thrown = items.filter(i => i.status === 'thrown')
  
  const totalSaved = consumed.length * AVG_PRICE
  const totalWasted = thrown.length * AVG_PRICE
  
  const total = consumed.length + thrown.length
  const successRate = total > 0 ? Math.round((consumed.length / total) * 100) : 0
  
  const streak = getStreak(items)
  
  const allActivity = [...consumed, ...thrown].sort((a, b) => b.openedAt - a.openedAt)
  const lastActivityDate = allActivity.length > 0 ? allActivity[0].openedAt : Date.now()
  
  return {
    consumed: consumed.length,
    thrown: thrown.length,
    totalSaved,
    totalWasted,
    successRate,
    streak,
    lastActivityDate
  }
}

export async function getUnlockedBadges(): Promise<Badge[]> {
  const stats = await getStats()
  return ALL_BADGES.filter(badge => badge.condition(stats))
}

export async function getWeeklyData(): Promise<{ date: string; consumed: number; thrown: number }[]> {
  const db = await getDb()
  const items = await db.getAll('items')
  
  const now = Date.now()
  const weekData: { date: string; consumed: number; thrown: number }[] = []
  
  for (let i = 6; i >= 0; i--) {
    const dayStart = now - i * 24 * 60 * 60 * 1000
    const dayEnd = dayStart + 24 * 60 * 60 * 1000
    
    const consumed = items.filter(
      item => item.status === 'eaten' && item.openedAt >= dayStart && item.openedAt < dayEnd
    ).length
    
    const thrown = items.filter(
      item => item.status === 'thrown' && item.openedAt >= dayStart && item.openedAt < dayEnd
    ).length
    
    const date = new Date(dayStart)
    const dayName = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][date.getDay()]
    
    weekData.push({
      date: dayName,
      consumed,
      thrown
    })
  }
  
  return weekData
}
