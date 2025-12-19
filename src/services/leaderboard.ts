import { getStats } from '../data/stats'
import { getCurrentLevel } from '../data/xp'

export type LeaderboardEntry = {
  id: string
  username: string
  avatar: string
  level: number
  totalXP: number
  streak: number
  itemsSaved: number
  wasteRate: number
  rank: number
  badge?: string
  city?: string
  country: string
}

export type LeaderboardType = 'global' | 'friends' | 'city' | 'weekly'

export type UserRank = 
  | 'bronze'
  | 'silver' 
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master'
  | 'legend'

const RANK_THRESHOLDS = {
  bronze: 0,
  silver: 1000,
  gold: 5000,
  platinum: 15000,
  diamond: 40000,
  master: 100000,
  legend: 250000
}

export function getUserRank(totalXP: number): UserRank {
  if (totalXP >= RANK_THRESHOLDS.legend) return 'legend'
  if (totalXP >= RANK_THRESHOLDS.master) return 'master'
  if (totalXP >= RANK_THRESHOLDS.diamond) return 'diamond'
  if (totalXP >= RANK_THRESHOLDS.platinum) return 'platinum'
  if (totalXP >= RANK_THRESHOLDS.gold) return 'gold'
  if (totalXP >= RANK_THRESHOLDS.silver) return 'silver'
  return 'bronze'
}

export function getRankEmoji(rank: UserRank): string {
  const emojis = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
    diamond: '💠',
    master: '👑',
    legend: '⚡'
  }
  return emojis[rank]
}

export function getRankColor(rank: UserRank): string {
  const colors = {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    platinum: '#e5e4e2',
    diamond: '#b9f2ff',
    master: '#9333ea',
    legend: '#ff0080'
  }
  return colors[rank]
}

export function getNextRank(currentRank: UserRank): { rank: UserRank; xpNeeded: number } | null {
  const ranks: UserRank[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'legend']
  const currentIndex = ranks.indexOf(currentRank)
  if (currentIndex >= ranks.length - 1) return null
  const nextRank = ranks[currentIndex + 1]
  return { rank: nextRank, xpNeeded: RANK_THRESHOLDS[nextRank] }
}

export async function generateMockLeaderboard(type: LeaderboardType = 'global', count: number = 50): Promise<LeaderboardEntry[]> {
  const firstNames = ['Alex', 'Sophie', 'Thomas', 'Emma', 'Lucas', 'Chloé', 'Hugo', 'Léa', 'Jules', 'Manon']
  const lastNames = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand']
  const cities = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice']
  const avatars = ['😊', '🤓', '😎', '🥳', '🤩', '🌟']
  const entries: LeaderboardEntry[] = []
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const username = `${firstName} ${lastName.charAt(0)}.`
    const totalXP = type === 'weekly' ? Math.floor(Math.random() * 5000) : Math.floor(Math.pow(Math.random(), 2) * 200000)
    entries.push({
      id: `user_${i}`,
      username,
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
      level: Math.floor(totalXP / 1000) + 1,
      totalXP,
      streak: Math.floor(Math.random() * 30),
      itemsSaved: Math.floor(totalXP / 50),
      wasteRate: Math.floor(Math.random() * 20),
      rank: i + 1,
      city: cities[Math.floor(Math.random() * cities.length)],
      country: 'FR'
    })
  }
  entries.sort((a, b) => b.totalXP - a.totalXP)
  entries.forEach((entry, index) => entry.rank = index + 1)
  return entries
}

export async function getUserLeaderboardPosition(): Promise<LeaderboardEntry> {
  const stats = await getStats()
  const levelData = await getCurrentLevel()
  const streak = parseInt(localStorage.getItem('current-streak') || '0')
  const username = localStorage.getItem('username') || 'Toi'
  const city = localStorage.getItem('user-city') || 'Paris'
  
  // Correction ici : Stats utilise 'consumed' et 'thrown'
  const totalItems = stats.consumed + stats.thrown
  const wasteRate = totalItems > 0 ? Math.round((stats.thrown / totalItems) * 100) : 0
  
  return {
    id: 'current_user',
    username,
    avatar: '🎯',
    level: levelData.level,
    totalXP: levelData.xp, // Dans xp.ts le champ est 'xp', pas 'totalXP'
    streak,
    itemsSaved: stats.consumed,
    wasteRate,
    rank: 0,
    city,
    country: 'FR'
  }
}

export async function getLeaderboardWithUser(type: LeaderboardType = 'global'): Promise<{
  leaderboard: LeaderboardEntry[]
  userEntry: LeaderboardEntry
  userRankInfo: { rank: UserRank; nextRank: { rank: UserRank; xpNeeded: number } | null }
}> {
  const leaderboard = await generateMockLeaderboard(type)
  const userEntry = await getUserLeaderboardPosition()
  let insertIndex = leaderboard.findIndex(entry => entry.totalXP < userEntry.totalXP)
  if (insertIndex === -1) insertIndex = leaderboard.length
  userEntry.rank = insertIndex + 1
  leaderboard.forEach((entry, i) => { if (i >= insertIndex) entry.rank = i + 2 })
  leaderboard.splice(insertIndex, 0, userEntry)
  const currentRank = getUserRank(userEntry.totalXP)
  const nextRank = getNextRank(currentRank)
  return { leaderboard, userEntry, userRankInfo: { rank: currentRank, nextRank } }
}

export function getComparisonStats(userEntry: LeaderboardEntry, leaderboard: LeaderboardEntry[]) {
  const betterThan = ((leaderboard.length - userEntry.rank + 1) / leaderboard.length) * 100
  return { betterThan: Math.round(betterThan) }
}

export type WeeklyChallenge = {
  id: string
  name: string
  description: string
  emoji: string
  goal: number
  progress: number
  reward: { xp: number }
}

export function getCurrentWeeklyChallenge(): WeeklyChallenge {
  return {
    id: 'weekly_1',
    name: 'Zéro Déchet',
    description: 'Ne jette rien cette semaine',
    emoji: '♻️',
    goal: 7,
    progress: 3,
    reward: { xp: 500 }
  }
}
