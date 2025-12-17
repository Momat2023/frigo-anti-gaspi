import { useEffect, useState } from 'react'
import Header from '../ui/Header'
import { getStats, getWeeklyStats, type Stats, type StatsSnapshot } from '../data/stats'

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [weekly, setWeekly] = useState<StatsSnapshot[]>([])

  useEffect(() => {
    Promise.all([getStats(), getWeeklyStats()]).then(([s, w]) => {
      setStats(s)
      setWeekly(w)
    })
  }, [])

  if (!stats) {
    return (
      <>
        <Header />
        <main style={{ padding: 12 }}>Chargement...</main>
      </>
    )
  }

  const unlockedBadges = stats.badges.filter(b => b.condition(stats))
  const lockedBadges = stats.badges.filter(b => !b.condition(stats))

  return (
    <>
      <Header />
      <main style={{ padding: 12, maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 24 }}>📊 Statistiques</h1>

        {/* Vue d'ensemble */}
        <section style={{ 
          marginBottom: 24, 
          padding: 16, 
          borderRadius: 12, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>Vue d'ensemble</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 'bold' }}>{stats.consumed}</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Consommés</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 'bold' }}>{stats.thrown}</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Jetés</div>
            </div>
          </div>
        </section>

        {/* Taux de réussite */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Taux de réussite</h2>
          <div style={{ 
            padding: 16, 
            borderRadius: 12, 
            backgroundColor: '#f0fdf4',
            border: '1px solid #86efac'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 32 }}>✅</div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#16a34a' }}>
                  {stats.savedRate.toFixed(1)}%
                </div>
                <div style={{ fontSize: 12, color: '#15803d' }}>Aliments sauvés</div>
              </div>
            </div>
            {stats.wasteRate > 0 && (
              <div style={{ fontSize: 12, color: '#15803d' }}>
                {stats.wasteRate.toFixed(1)}% de gaspillage
              </div>
            )}
          </div>
        </section>

        {/* Économies */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Impact financier</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ 
              padding: 16, 
              borderRadius: 12, 
              backgroundColor: '#ecfdf5',
              border: '1px solid #6ee7b7'
            }}>
              <div style={{ fontSize: 12, color: '#065f46', marginBottom: 4 }}>Économisé</div>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#059669' }}>
                {stats.moneySaved.toFixed(2)} €
              </div>
            </div>
            {stats.moneyWasted > 0 && (
              <div style={{ 
                padding: 16, 
                borderRadius: 12, 
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5'
              }}>
                <div style={{ fontSize: 12, color: '#7f1d1d', marginBottom: 4 }}>Gaspillé</div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#dc2626' }}>
                  {stats.moneyWasted.toFixed(2)} €
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Streak */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Série en cours</h2>
          <div style={{ 
            padding: 16, 
            borderRadius: 12, 
            backgroundColor: '#fef3c7',
            border: '1px solid #fcd34d',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{ fontSize: 48 }}>🔥</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 28, fontWeight: 'bold', color: '#92400e' }}>
                {stats.currentStreak} jours
              </div>
              <div style={{ fontSize: 12, color: '#78350f' }}>
                Sans gaspillage
              </div>
              {stats.longestStreak > stats.currentStreak && (
                <div style={{ fontSize: 11, color: '#78350f', marginTop: 4 }}>
                  Record : {stats.longestStreak} jours
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Évolution hebdomadaire (mini graphique texte) */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Cette semaine</h2>
          <div style={{ 
            padding: 16, 
            borderRadius: 12, 
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb'
          }}>
            {weekly.map((day, i) => {
              const date = new Date(day.date)
              const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' })
              const total = day.consumed + day.thrown
              const consumedPct = total > 0 ? (day.consumed / total) * 100 : 0
              
              return (
                <div key={day.date} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8,
                  marginBottom: i < weekly.length - 1 ? 8 : 0
                }}>
                  <div style={{ fontSize: 12, width: 30, color: '#6b7280' }}>{dayName}</div>
                  <div style={{ 
                    flex: 1, 
                    height: 20, 
                    backgroundColor: '#e5e7eb', 
                    borderRadius: 4,
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {total > 0 && (
                      <div style={{ 
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: `${consumedPct}%`,
                        backgroundColor: '#16a34a',
                        transition: 'width 0.3s'
                      }} />
                    )}
                  </div>
                  <div style={{ fontSize: 12, width: 40, textAlign: 'right', color: '#6b7280' }}>
                    {day.consumed}/{total}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Badges */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            Badges ({unlockedBadges.length}/{stats.badges.length})
          </h2>
          
          {/* Badges débloqués */}
          {unlockedBadges.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#059669', marginBottom: 8, fontWeight: 500 }}>
                Débloqués
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                {unlockedBadges.map(badge => (
                  <div key={badge.id} style={{ 
                    padding: 12, 
                    borderRadius: 12, 
                    backgroundColor: '#ecfdf5',
                    border: '2px solid #6ee7b7',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 4 }}>{badge.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{badge.name}</div>
                    <div style={{ fontSize: 11, color: '#065f46' }}>{badge.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges verrouillés */}
          {lockedBadges.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: 500 }}>
                À débloquer
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                {lockedBadges.map(badge => (
                  <div key={badge.id} style={{ 
                    padding: 12, 
                    borderRadius: 12, 
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center',
                    opacity: 0.6
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 4, filter: 'grayscale(100%)' }}>
                      {badge.icon}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{badge.name}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>{badge.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
