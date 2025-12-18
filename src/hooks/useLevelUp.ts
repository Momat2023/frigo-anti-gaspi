import { useState, useEffect } from 'react'
import { getCurrentLevel } from '../data/xp'

export function useLevelUp() {
  const [levelUpData, setLevelUpData] = useState<{
    newLevel: number
    rewards: string[]
  } | null>(null)

  useEffect(() => {
    checkForLevelUp()
  }, [])

  async function checkForLevelUp() {
    const lastCheckedLevel = parseInt(localStorage.getItem('last-checked-level') || '1')
    const currentLevel = await getCurrentLevel()

    if (currentLevel.level > lastCheckedLevel) {
      // Level up détecté !
      setLevelUpData({
        newLevel: currentLevel.level,
        rewards: currentLevel.rewards
      })
      localStorage.setItem('last-checked-level', currentLevel.level.toString())
    }
  }

  function dismissLevelUp() {
    setLevelUpData(null)
  }

  return {
    levelUpData,
    dismissLevelUp,
    checkForLevelUp
  }
}
