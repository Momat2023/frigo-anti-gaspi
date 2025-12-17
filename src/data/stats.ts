import { getDb } from './db'
import type { Item } from './types'

export type StatsSnapshot = {
  date: string // YYYY-MM-DD
  consumed: number
  thrown: number
  active: number
}

export type Badge = {
  id: string
  name: string
  description: string
  icon: string
  condition: (stats: Stats) => boolean
  unlockedAt?: number
}

export type Stats = {
  totalItems: number
  consumed: number
  thrown: number
  active: number
  wasteRate: number // pourcentage jeté
  savedRate: number // pourcentage consommé
  moneyWasted: number // estimation
  moneySaved: number // estimation
  currentStreak: number // jours consécutifs sans gaspillage
  longestStreak: number
  badges: Badge[]
}

const PRICE_PER_ITEM = 3.5 // prix moyen estimé par aliment en €

export async function getStats(): Promise<Stats> {
  const db = await getDb()
  const allItems = await db.getAll('items')

  const consumed = allItems.filter(x => x.status === 'eaten').length
  const thrown = allItems.filter(x => x.status === 'thrown').length
  const active = allItems.filter(x => x.status === 'active').length
  const total = consumed + thrown

  const wasteRate = total > 0 ? (thrown / total) * 100 : 0
  const savedRate = total > 0 ? (consumed / total) * 100 : 0

  const moneyWasted = thrown * PRICE_PER_ITEM
  const moneySaved = consumed * PRICE_PER_ITEM

  // Calcul du streak (simplifié pour l'instant)
  const currentStreak = await calculateCurrentStreak(allItems)
  const longestStreak = await calculateLongestStreak(allItems)

  const stats: Stats = {
    totalItems: total,
    consumed,
    thrown,
    active,
    wasteRate,
    savedRate,
    moneyWasted,
    moneySaved,
    currentStreak,
    longestStreak,
    badges: []
  }

  // Calculer les badges débloqués
  stats.badges = ALL_BADGES.filter(badge => badge.condition(stats))

  return stats
}

async function calculateCurrentStreak(items: Item[]): Promise<number> {
  // Trie les items jetés par date décroissante
  const thrownItems = items
    .filter(x => x.status === 'thrown' && x.createdAt)
    .sort((a, b) => b.createdAt - a.createdAt)

  if (thrownItems.length === 0) {
    // Aucun item jeté = streak infini, on calcule depuis le premier aliment consommé
    const consumedItems = items.filter(x => x.status === 'eaten' && x.createdAt)
    if (consumedItems.length === 0) return 0
    
    const oldestConsumed = Math.min(...consumedItems.map(x => x.createdAt))
    const daysSince = Math.floor((Date.now() - oldestConsumed) / (24 * 60 * 60 * 1000))
    return Math.max(0, daysSince)
  }

  // Dernier item jeté
  const lastThrown = thrownItems[0].createdAt
  const daysSinceLastWaste = Math.floor((Date.now() - lastThrown) / (24 * 60 * 60 * 1000))
  
  return Math.max(0, daysSinceLastWaste)
}

async function calculateLongestStreak(items: Item[]): Promise<number> {
  // Version simplifiée : pour l'instant on retourne le streak actuel
  // TODO: implémenter le calcul historique complet
  return calculateCurrentStreak(items)
}

export async function getWeeklyStats(): Promise<StatsSnapshot[]> {
  const db = await getDb()
  const allItems = await db.getAll('items')
  
  const snapshots: StatsSnapshot[] = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    const dayStart = date.getTime()
    const dayEnd = dayStart + 24 * 60 * 60 * 1000
    
    const dayItems = allItems.filter(x => 
      x.createdAt >= dayStart && x.createdAt < dayEnd
    )
    
    snapshots.push({
      date: date.toISOString().split('T')[0],
      consumed: dayItems.filter(x => x.status === 'eaten').length,
      thrown: dayItems.filter(x => x.status === 'thrown').length,
      active: dayItems.filter(x => x.status === 'active').length
    })
  }
  
  return snapshots
}

// Définition des badges
export const ALL_BADGES: Badge[] = [
  {
    id: 'first-save',
    name: 'Premier pas',
    description: 'Consomme ton premier aliment',
    icon: '🌱',
    condition: (s) => s.consumed >= 1
  },
  {
    id: 'zero-waste-week',
    name: 'Semaine parfaite',
    description: '7 jours sans gaspillage',
    icon: '🌟',
    condition: (s) => s.currentStreak >= 7
  },
  {
    id: 'save-10',
    name: 'Sauveur débutant',
    description: 'Sauve 10 aliments',
    icon: '🥉',
    condition: (s) => s.consumed >= 10
  },
  {
    id: 'save-50',
    name: 'Sauveur confirmé',
    description: 'Sauve 50 aliments',
    icon: '🥈',
    condition: (s) => s.consumed >= 50
  },
  {
    id: 'save-100',
    name: 'Héros anti-gaspi',
    description: 'Sauve 100 aliments',
    icon: '🥇',
    condition: (s) => s.consumed >= 100
  },
  {
    id: 'eco-warrior',
    name: 'Éco-guerrier',
    description: 'Plus de 90% d\'aliments consommés',
    icon: '♻️',
    condition: (s) => s.savedRate >= 90 && s.totalItems >= 10
  },
  {
    id: 'money-saver',
    name: 'Économe',
    description: 'Économise plus de 50€',
    icon: '💰',
    condition: (s) => s.moneySaved >= 50
  },
  {
    id: 'streak-master',
    name: 'Maître du streak',
    description: '30 jours sans gaspillage',
    icon: '🔥',
    condition: (s) => s.currentStreak >= 30
  }
]
