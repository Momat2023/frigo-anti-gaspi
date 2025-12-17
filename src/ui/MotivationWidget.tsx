import { useEffect, useState } from 'react'
import { getStats, ALL_BADGES } from '../data/stats'
import type { Stats } from '../data/types'

export default function MotivationWidget() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const s = await getStats()
    setStats(s)
  }

  if (!stats) return null

  const nextBadge = ALL_BADGES.find(badge => !badge.condition(stats))
  
  let progress = 0
  let progressLabel = ''
  
  if (nextBadge) {
    if (nextBadge.id === 'save-10') {
      progress = (stats.consumed / 10) * 100
      progressLabel = `${stats.consumed}/10 aliments sauvés`
    } else if (nextBadge.id === 'save-50') {
      progress = (stats.consumed / 50) * 100
      progressLabel = `${stats.consumed}/50 aliments sauvés`
    } else if (nextBadge.id === 'save-100') {
      progress = (stats.consumed / 100) * 100
      progressLabel = `${stats.consumed}/100 aliments sauvés`
    } else if (nextBadge.id === 'perfect-week') {
      progress = (stats.streak / 7) * 100
      progressLabel = `${stats.streak}/7 jours de streak`
    } else if (nextBadge.id === 'streak-30') {
      progress = (stats.streak / 30) * 100
      progressLabel = `${stats.streak}/30 jours de streak`
    }
  }

  return (
    <div style={{
      padding: 16,
      backgroundColor: '#eff6ff',
      borderRadius: 12,
      marginBottom: 24,
      border: '2px solid #93c5fd'
    }}>
      <div style={{ marginBottom: 12, fontSize: 16, fontWeight: 600 }}>
        �� Prochain badge
      </div>
      
      {nextBadge ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 32 }}>{nextBadge.icon}</div>
            <div>
              <div style={{ fontWeight: 600 }}>{nextBadge.name}</div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>{nextBadge.description}</div>
            </div>
          </div>
          
          <div style={{ marginBottom: 8 }}>
            <div style={{
              width: '100%',
              height: 12,
              backgroundColor: '#e0e7ff',
              borderRadius: 6,
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min(progress, 100)}%`,
                height: '100%',
                backgroundColor: '#6366f1',
                borderRadius: 6,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
          
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            {progressLabel}
          </div>
        </>
      ) : (
        <div style={{ fontSize: 14, color: '#6b7280' }}>
          🎉 Tous les badges débloqués ! Tu es une légende !
        </div>
      )}
    </div>
  )
}
