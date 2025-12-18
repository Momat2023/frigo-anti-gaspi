export type Level = {
  level: number
  xp: number
  xpToNext: number
  title: string
  titleEmoji: string
  rewards: string[]
}

export type XPEvent = {
  action: string
  xp: number
  timestamp: number
  details?: any
}

// Formule XP : 100 × level^1.5 + 50 × level
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.floor(100 * Math.pow(level, 1.5) + 50 * level)
}

// Gains XP par action
export const XP_GAINS = {
  ITEM_ADDED: 10,
  ITEM_CONSUMED: 20,
  ITEM_THROWN: -5,
  PERFECT_DAY: 50,
  RECIPE_VIEWED: 5,
  RECIPE_COOKED: 30,
  STREAK_7: 100,
  STREAK_14: 200,
  STREAK_30: 500,
  BADGE_UNLOCKED: 75,
  SCAN_BARCODE: 15
}

// Titres par niveau
const TITLES = [
  { min: 1, max: 5, title: 'Débutant', emoji: '��' },
  { min: 6, max: 10, title: 'Apprenti', emoji: '📚' },
  { min: 11, max: 15, title: 'Initié', emoji: '⭐' },
  { min: 16, max: 20, title: 'Confirmé', emoji: '💪' },
  { min: 21, max: 25, title: 'Expert', emoji: '🎓' },
  { min: 26, max: 30, title: 'Maître', emoji: '👑' },
  { min: 31, max: 35, title: 'Grand Maître', emoji: '🏆' },
  { min: 36, max: 40, title: 'Champion', emoji: '💎' },
  { min: 41, max: 45, title: 'Héros', emoji: '🦸' },
  { min: 46, max: 50, title: 'Légende', emoji: '🌟' }
]

// Récompenses par niveau
const LEVEL_REWARDS: Record<number, string[]> = {
  5: ['Thème Bleu Océan 🌊'],
  10: ['Badge "Apprenti" 📚', 'Thème Vert Forêt 🌲'],
  15: ['Avatar Frigo Étoilé ⭐'],
  20: ['Thème Violet Royal 👑', 'Badge "Expert" 🎓'],
  25: ['Avatar Frigo Diamant 💎'],
  30: ['Thème Doré Luxe ✨', 'Badge "Maître" 👑'],
  35: ['Avatar Frigo Légendaire 🌟'],
  40: ['Thème Arc-en-ciel 🌈'],
  45: ['Badge "Héros" 🦸'],
  50: ['Titre "Légende Vivante" 🌟', 'Thème Platine 💿', 'Avatar Ultimate 🚀']
}

export function getTitleForLevel(level: number): { title: string; emoji: string } {
  const found = TITLES.find(t => level >= t.min && level <= t.max)
  return found || TITLES[TITLES.length - 1]
}

export async function getCurrentLevel(): Promise<Level> {
  const totalXP = await getTotalXP()
  
  let currentLevel = 1
  
  for (let i = 1; i <= 50; i++) {
    const xpNeeded = getXPForLevel(i)
    if (totalXP >= xpNeeded) {
      currentLevel = i
    } else {
      break
    }
  }
  
  const xpForNextLevel = getXPForLevel(currentLevel + 1)
  const xpToNext = xpForNextLevel - totalXP
  
  const titleInfo = getTitleForLevel(currentLevel)
  const rewards = LEVEL_REWARDS[currentLevel] || []
  
  return {
    level: currentLevel,
    xp: totalXP,
    xpToNext,
    title: titleInfo.title,
    titleEmoji: titleInfo.emoji,
    rewards
  }
}

export async function getTotalXP(): Promise<number> {
  const events = localStorage.getItem('xp-events')
  if (!events) return 0
  
  const parsed: XPEvent[] = JSON.parse(events)
  return parsed.reduce((sum, event) => sum + event.xp, 0)
}

export async function addXP(action: keyof typeof XP_GAINS, details?: any): Promise<{
  xpGained: number
  oldLevel: number
  newLevel: number
  leveledUp: boolean
}> {
  const oldLevel = await getCurrentLevel()
  const xpGained = XP_GAINS[action]
  
  const events = localStorage.getItem('xp-events')
  const parsed: XPEvent[] = events ? JSON.parse(events) : []
  
  parsed.push({
    action,
    xp: xpGained,
    timestamp: Date.now(),
    details
  })
  
  localStorage.setItem('xp-events', JSON.stringify(parsed))
  
  const newLevelData = await getCurrentLevel()
  const leveledUp = newLevelData.level > oldLevel.level
  
  return {
    xpGained,
    oldLevel: oldLevel.level,
    newLevel: newLevelData.level,
    leveledUp
  }
}

export async function getXPHistory(): Promise<XPEvent[]> {
  const events = localStorage.getItem('xp-events')
  if (!events) return []
  return JSON.parse(events)
}

export async function getXPStats() {
  const events = await getXPHistory()
  const today = new Date().setHours(0, 0, 0, 0)
  
  const todayXP = events
    .filter(e => e.timestamp >= today)
    .reduce((sum, e) => sum + e.xp, 0)
  
  const last7Days = events
    .filter(e => e.timestamp >= Date.now() - 7 * 24 * 60 * 60 * 1000)
    .reduce((sum, e) => sum + e.xp, 0)
  
  return {
    todayXP,
    last7DaysXP: last7Days,
    totalEvents: events.length
  }
}
