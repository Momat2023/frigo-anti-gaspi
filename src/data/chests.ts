export type ChestType = 'bronze' | 'silver' | 'gold' | 'diamond'

export type ChestReward = {
  type: 'xp' | 'theme' | 'badge' | 'boost' | 'title' | 'emoji'
  value: string | number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  label: string
  emoji: string
}

export type Chest = {
  id: string
  type: ChestType
  openedAt: number
  reward: ChestReward
}

export type ChestAvailable = {
  type: ChestType
  canOpen: boolean
  reason?: string
}

// Récompenses par rareté
const REWARDS_POOL: Record<string, ChestReward[]> = {
  common: [
    { type: 'xp', value: 50, rarity: 'common', label: '+50 XP', emoji: '⭐' },
    { type: 'xp', value: 75, rarity: 'common', label: '+75 XP', emoji: '✨' },
    { type: 'emoji', value: '🎯', rarity: 'common', label: 'Emoji Cible', emoji: '🎯' },
    { type: 'emoji', value: '🔥', rarity: 'common', label: 'Emoji Flamme', emoji: '🔥' },
  ],
  rare: [
    { type: 'xp', value: 100, rarity: 'rare', label: '+100 XP', emoji: '💫' },
    { type: 'theme', value: 'ocean', rarity: 'rare', label: 'Thème Océan (24h)', emoji: '🌊' },
    { type: 'theme', value: 'forest', rarity: 'rare', label: 'Thème Forêt (24h)', emoji: '🌲' },
    { type: 'boost', value: 'double_xp_24h', rarity: 'rare', label: 'Double XP 24h', emoji: '⚡' },
    { type: 'emoji', value: '💎', rarity: 'rare', label: 'Emoji Diamant', emoji: '💎' },
  ],
  epic: [
    { type: 'xp', value: 200, rarity: 'epic', label: '+200 XP', emoji: '🌟' },
    { type: 'theme', value: 'royal', rarity: 'epic', label: 'Thème Royal', emoji: '👑' },
    { type: 'badge', value: 'chest_hunter', rarity: 'epic', label: 'Badge Chasseur', emoji: '🏹' },
    { type: 'boost', value: 'streak_freeze', rarity: 'epic', label: 'Streak Freeze', emoji: '❄️' },
    { type: 'title', value: 'Chanceux', rarity: 'epic', label: 'Titre "Chanceux"', emoji: '🍀' },
  ],
  legendary: [
    { type: 'xp', value: 500, rarity: 'legendary', label: '+500 XP', emoji: '💥' },
    { type: 'theme', value: 'platinum', rarity: 'legendary', label: 'Thème Platine', emoji: '💿' },
    { type: 'badge', value: 'legendary_luck', rarity: 'legendary', label: 'Badge Légende', emoji: '🌈' },
    { type: 'boost', value: 'triple_xp_24h', rarity: 'legendary', label: 'Triple XP 24h', emoji: '🚀' },
    { type: 'title', value: 'Béni des Dieux', rarity: 'legendary', label: 'Titre Légendaire', emoji: '⚡' },
  ]
}

// Chances par type de coffre
const CHEST_DROP_RATES: Record<ChestType, Record<string, number>> = {
  bronze: { common: 70, rare: 25, epic: 4, legendary: 1 },
  silver: { common: 40, rare: 45, epic: 13, legendary: 2 },
  gold: { common: 20, rare: 40, epic: 30, legendary: 10 },
  diamond: { common: 0, rare: 20, epic: 40, legendary: 40 }
}

function getRandomReward(chestType: ChestType): ChestReward {
  const rates = CHEST_DROP_RATES[chestType]
  const random = Math.random() * 100
  
  let cumulative = 0
  for (const [rarity, chance] of Object.entries(rates)) {
    cumulative += chance
    if (random <= cumulative) {
      const pool = REWARDS_POOL[rarity]
      return pool[Math.floor(Math.random() * pool.length)]
    }
  }
  
  return REWARDS_POOL.common[0]
}

export function getChestColor(type: ChestType): string {
  switch (type) {
    case 'bronze': return '#cd7f32'
    case 'silver': return '#c0c0c0'
    case 'gold': return '#ffd700'
    case 'diamond': return '#b9f2ff'
  }
}

export function getChestLabel(type: ChestType): string {
  switch (type) {
    case 'bronze': return 'Coffre Bronze'
    case 'silver': return 'Coffre Argent'
    case 'gold': return 'Coffre Or'
    case 'diamond': return 'Coffre Diamant'
  }
}

export async function getAvailableChest(): Promise<ChestAvailable | null> {
  const lastOpened = localStorage.getItem('last-chest-opened')
  
  // Vérifier si un coffre a déjà été ouvert aujourd'hui
  if (lastOpened) {
    const lastDate = new Date(parseInt(lastOpened))
    const today = new Date()
    
    if (
      lastDate.getDate() === today.getDate() &&
      lastDate.getMonth() === today.getMonth() &&
      lastDate.getFullYear() === today.getFullYear()
    ) {
      return {
        type: 'bronze',
        canOpen: false,
        reason: 'Reviens demain pour un nouveau coffre !'
      }
    }
  }
  
  // Déterminer le type de coffre disponible
  const streak = parseInt(localStorage.getItem('current-streak') || '0')
  
  let chestType: ChestType = 'bronze'
  if (streak >= 30) {
    chestType = 'gold'
  } else if (streak >= 7) {
    chestType = 'silver'
  }
  
  // Chance de coffre diamant (1% pour streak 30+)
  if (streak >= 30 && Math.random() < 0.01) {
    chestType = 'diamond'
  }
  
  return {
    type: chestType,
    canOpen: true
  }
}

export async function openChest(chestType: ChestType): Promise<Chest> {
  const reward = getRandomReward(chestType)
  
  const chest: Chest = {
    id: `chest_${Date.now()}`,
    type: chestType,
    openedAt: Date.now(),
    reward
  }
  
  // Enregistrer l'ouverture
  localStorage.setItem('last-chest-opened', Date.now().toString())
  
  // Enregistrer dans l'historique
  const history = getChestHistory()
  history.push(chest)
  localStorage.setItem('chest-history', JSON.stringify(history))
  
  // Appliquer la récompense
  await applyReward(reward)
  
  return chest
}

async function applyReward(reward: ChestReward) {
  switch (reward.type) {
    case 'xp':
      // Ajouter XP directement
      const xpEvents = localStorage.getItem('xp-events')
      const events = xpEvents ? JSON.parse(xpEvents) : []
      events.push({
        action: 'CHEST_REWARD',
        xp: reward.value,
        timestamp: Date.now(),
        details: { reward: reward.label }
      })
      localStorage.setItem('xp-events', JSON.stringify(events))
      break
      
    case 'theme':
      // Débloquer thème (temporaire ou permanent)
      const themes = localStorage.getItem('unlocked-themes')
      const unlockedThemes = themes ? JSON.parse(themes) : []
      if (!unlockedThemes.includes(reward.value)) {
        unlockedThemes.push(reward.value)
        localStorage.setItem('unlocked-themes', JSON.stringify(unlockedThemes))
      }
      break
      
    case 'boost':
      // Activer boost
      const boosts = localStorage.getItem('active-boosts')
      const activeBoosts = boosts ? JSON.parse(boosts) : []
      activeBoosts.push({
        type: reward.value,
        activatedAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      })
      localStorage.setItem('active-boosts', JSON.stringify(activeBoosts))
      break
      
    case 'badge':
    case 'title':
    case 'emoji':
      // Stocker dans inventaire
      const inventory = localStorage.getItem('chest-rewards-inventory')
      const inv = inventory ? JSON.parse(inventory) : []
      inv.push(reward)
      localStorage.setItem('chest-rewards-inventory', JSON.stringify(inv))
      break
  }
}

export function getChestHistory(): Chest[] {
  const history = localStorage.getItem('chest-history')
  return history ? JSON.parse(history) : []
}

export function getChestStats() {
  const history = getChestHistory()
  
  const total = history.length
  const byType = {
    bronze: history.filter(c => c.type === 'bronze').length,
    silver: history.filter(c => c.type === 'silver').length,
    gold: history.filter(c => c.type === 'gold').length,
    diamond: history.filter(c => c.type === 'diamond').length
  }
  
  const byRarity = {
    common: history.filter(c => c.reward.rarity === 'common').length,
    rare: history.filter(c => c.reward.rarity === 'rare').length,
    epic: history.filter(c => c.reward.rarity === 'epic').length,
    legendary: history.filter(c => c.reward.rarity === 'legendary').length
  }
  
  return { total, byType, byRarity }
}
