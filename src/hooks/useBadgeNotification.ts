import { useState } from 'react'
import { getStats, ALL_BADGES, type Badge } from '../data/stats'

const STORAGE_KEY = 'frigo-badges-seen'

function getSeenBadges(): Set<string> {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? new Set(JSON.parse(stored)) : new Set()
}

function markBadgeAsSeen(badgeId: string) {
  const seen = getSeenBadges()
  seen.add(badgeId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]))
}

export function useBadgeNotification() {
  const [newBadge, setNewBadge] = useState<Badge | null>(null)

  async function checkForNewBadges() {
    const stats = await getStats()
    const seenBadges = getSeenBadges()
    
    // Trouver les badges débloqués mais pas encore vus
    const unlockedBadges = ALL_BADGES.filter(badge => badge.condition(stats))
    const newlyUnlocked = unlockedBadges.find(badge => !seenBadges.has(badge.id))
    
    if (newlyUnlocked) {
      setNewBadge(newlyUnlocked)
      markBadgeAsSeen(newlyUnlocked.id)
    }
  }

  function dismissBadge() {
    setNewBadge(null)
  }

  return {
    newBadge,
    dismissBadge,
    checkForNewBadges
  }
}
