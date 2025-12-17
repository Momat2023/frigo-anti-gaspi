import { useEffect, useState } from 'react'
import Header from '../ui/Header'
import { getStats, getWeeklyData, getUnlockedBadges, ALL_BADGES, type Badge } from '../data/stats'
import type { Stats } from '../data/types'

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([])

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const s = await getStats()
    const weekly = await getWeeklyData()
    const badges = await getUnlockedBadges()
    
    setStats(s)
    setWeeklyData(weekly)
    setUnlockedBadges(badges)
  }

  if (!stats) return <div>Chargement...</div>

  const lockedBadges = ALL_BADGES.filter(b => !unlockedBadges.some(ub => ub.id === b.id))

  return (
    <>
      <Header />
      <main style={{ padding: 12, maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 24 }}>📊 Statistiques</h1>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
          marginBottom: 32
        }}>
          <div style={{ 
            padding: 16, 
            backgroundColor: '#ecfdf5', 
            borderRadius: 12,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#16a34a' }}>
              {stats.consumed}
            </div>
            <div style={{ fontSize: 14, color: '#6b7280' }}>Consommés</div>
          </div>

          <div style={{ 
            padding: 16, 
            backgroundColor: '#fef2f2', 
            borderRadius: 12,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#dc2626' }}>
              {stats.thrown}
            </div>
            <div style={{ fontSize: 14, color: '#6b7280' }}>Jetés</div>
          </div>

          <div style={{ 
            padding: 16, 
            backgroundColor: '#eff6ff', 
            borderRadius: 12,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#2563eb' }}>
              {stats.successRate}%
            </div>
            <div style={{ fontSize: 14, color: '#6b7280' }}>Réussite</div>
          </div>

          <div style={{ 
            padding: 16, 
            backgroundColor: '#fef3c7', 
            borderRadius: 12,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#d97706' }}>
              {stats.streak}
            </div>
            <div style={{ fontSize: 14, color: '#6b7280' }}>Streak</div>
          </div>
        </div>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>💰 Impact financier</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: 16, backgroundColor: '#ecfdf5', borderRadius: 12 }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#16a34a' }}>
                {stats.totalSaved}€
              </div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>Économisé</div>
            </div>
            <div style={{ padding: 16, backgroundColor: '#fef2f2', borderRadius: 12 }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#dc2626' }}>
                {stats.totalWasted}€
              </div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>Gaspillé</div>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>📈 Cette semaine</h2>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            gap: 8,
            height: 200,
            padding: 16,
            backgroundColor: 'white',
            borderRadius: 12,
            border: '1px solid #e5e7eb'
          }}>
            {weeklyData.map((day, i) => {
              const total = day.consumed + day.thrown
              const maxHeight = 160
              const height = total > 0 ? (total / Math.max(...weeklyData.map(d => d.consumed + d.thrown))) * maxHeight : 10
              
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ 
                    width: '100%',
                    height: height,
                    backgroundColor: day.thrown > 0 ? '#fca5a5' : '#86efac',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: 'white'
                  }}>
                    {total > 0 && total}
                  </div>
                  <div style={{ fontSize: 12, marginTop: 8, color: '#6b7280' }}>
                    {day.date}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>🏆 Badges</h2>
          
          <h3 style={{ fontSize: 16, marginBottom: 12, color: '#16a34a' }}>
            Débloqués ({unlockedBadges.length}/{ALL_BADGES.length})
          </h3>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 12,
            marginBottom: 24
          }}>
            {unlockedBadges.map((badge) => (
              <div
                key={badge.id}
                style={{
                  padding: 16,
                  backgroundColor: '#ecfdf5',
                  borderRadius: 12,
                  border: '2px solid #6ee7b7',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 8 }}>{badge.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                  {badge.name}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  {badge.description}
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: 16, marginBottom: 12, color: '#6b7280' }}>
            Verrouillés ({lockedBadges.length})
          </h3>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 12
          }}>
            {lockedBadges.map((badge) => (
              <div
                key={badge.id}
                style={{
                  padding: 16,
                  backgroundColor: '#f9fafb',
                  borderRadius: 12,
                  border: '2px solid #e5e7eb',
                  textAlign: 'center',
                  opacity: 0.6
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 8, filter: 'grayscale(1)' }}>
                  {badge.icon}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                  {badge.name}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  {badge.description}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
