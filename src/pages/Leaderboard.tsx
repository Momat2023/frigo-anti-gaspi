import { useEffect, useState } from 'react'
import Header from '../ui/Header'
import { trackEvent } from '../services/analytics'
import {
  getLeaderboardWithUser,
  getComparisonStats,
  getCurrentWeeklyChallenge,
  getRankEmoji,
  getRankColor,
  type LeaderboardEntry,
  type LeaderboardType,
  type WeeklyChallenge
} from '../services/leaderboard'

export default function Leaderboard() {
  const [type, setType] = useState<LeaderboardType>('global')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null)
  const [userRankInfo, setUserRankInfo] = useState<any>(null)
  const [challenge, setChallenge] = useState<WeeklyChallenge | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    trackEvent('page_view', { page: 'leaderboard' })
    load()
  }, [type])

  async function load() {
    setLoading(true)
    const data = await getLeaderboardWithUser(type)
    setLeaderboard(data.leaderboard)
    setUserEntry(data.userEntry)
    setUserRankInfo(data.userRankInfo)
    
    const weeklyChallenge = getCurrentWeeklyChallenge()
    setChallenge(weeklyChallenge)
    
    setLoading(false)
  }

  function handleShare() {
    if (navigator.share && userEntry) {
      navigator.share({
        title: 'Frigo Anti-Gaspi',
        text: `Je suis #${userEntry.rank} dans le classement Anti-Gaspi ! 🏆 ${userEntry.itemsSaved} aliments sauvés 💪`,
        url: window.location.href
      })
      trackEvent('leaderboard_shared', { rank: userEntry.rank })
    }
  }

  const stats = userEntry ? getComparisonStats(userEntry, leaderboard) : null

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ padding: 16 }}>
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40 }}>⏳</div>
            <div style={{ marginTop: 16 }}>Chargement...</div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main style={{ padding: 12 }}>
        <h1 style={{ marginBottom: 16 }}>🏆 Classement</h1>

        {/* DÉFI HEBDOMADAIRE */}
        {challenge && (
          <div style={{
            padding: 16,
            marginBottom: 24,
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            borderRadius: 12,
            border: '2px solid #fbbf24'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 32 }}>{challenge.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#92400e' }}>
                  Défi de la semaine
                </div>
                <div style={{ fontSize: 14, color: '#78350f', marginTop: 4 }}>
                  {challenge.name}
                </div>
              </div>
              <div style={{
                padding: '6px 12px',
                backgroundColor: '#fbbf24',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                color: '#78350f'
              }}>
                +{challenge.reward.xp} XP
              </div>
            </div>

            <div style={{ fontSize: 13, color: '#78350f', marginBottom: 12 }}>
              {challenge.description}
            </div>

            {/* Progress bar */}
            <div style={{
              height: 24,
              backgroundColor: '#fef3c7',
              borderRadius: 12,
              overflow: 'hidden',
              border: '2px solid #fbbf24',
              position: 'relative'
            }}>
              <div style={{
                height: '100%',
                width: `${(challenge.progress / challenge.goal) * 100}%`,
                backgroundColor: '#f59e0b',
                transition: 'width 0.3s ease'
              }} />
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 600,
                color: '#78350f'
              }}>
                {challenge.progress} / {challenge.goal}
              </div>
            </div>
          </div>
        )}

        {/* TON RANG */}
        {userEntry && userRankInfo && (
          <div style={{
            padding: 20,
            marginBottom: 24,
            background: `linear-gradient(135deg, ${getRankColor(userRankInfo.rank)}22 0%, ${getRankColor(userRankInfo.rank)}44 100%)`,
            borderRadius: 12,
            border: `2px solid ${getRankColor(userRankInfo.rank)}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 48 }}>{getRankEmoji(userRankInfo.rank)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 600 }}>
                  Rang {userRankInfo.rank.toUpperCase()}
                </div>
                <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
                  Position #{userEntry.rank} · {stats?.betterThan}% dépassés
                </div>
              </div>
              <button
                onClick={handleShare}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                📤 Partager
              </button>
            </div>

            {userRankInfo.nextRank && (
              <div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
                  Prochain rang : {getRankEmoji(userRankInfo.nextRank.rank)} {userRankInfo.nextRank.rank.toUpperCase()}
                </div>
                <div style={{
                  height: 8,
                  backgroundColor: '#e5e7eb',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(userEntry.totalXP / userRankInfo.nextRank.xpNeeded) * 100}%`,
                    backgroundColor: getRankColor(userRankInfo.nextRank.rank),
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  {userRankInfo.nextRank.xpNeeded - userEntry.totalXP} XP restants
                </div>
              </div>
            )}
          </div>
        )}

        {/* FILTRES */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          overflowX: 'auto',
          paddingBottom: 8
        }}>
          {[
            { value: 'global', label: '🌍 Mondial' },
            { value: 'weekly', label: '�� Semaine' },
            { value: 'city', label: '🏙️ Ma ville' },
            { value: 'friends', label: '👥 Amis' }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setType(tab.value as LeaderboardType)}
              style={{
                padding: '10px 16px',
                backgroundColor: type === tab.value ? '#3b82f6' : 'white',
                color: type === tab.value ? 'white' : '#6b7280',
                border: '2px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* LEADERBOARD */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {leaderboard.slice(0, 50).map((entry, _index) => {
            const isUser = entry.id === 'current_user'
            const isTop3 = entry.rank <= 3
            
            return (
              <div
                key={entry.id}
                style={{
                  padding: 16,
                  backgroundColor: isUser ? '#dbeafe' : isTop3 ? '#fef3c7' : '#f9fafb',
                  border: isUser ? '2px solid #3b82f6' : isTop3 ? '2px solid #fbbf24' : '1px solid #e5e7eb',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                {/* Rank */}
                <div style={{
                  minWidth: 40,
                  fontSize: isTop3 ? 24 : 18,
                  fontWeight: 600,
                  color: isTop3 ? '#92400e' : '#6b7280',
                  textAlign: 'center'
                }}>
                  {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                </div>

                {/* Avatar */}
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24
                }}>
                  {entry.avatar}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: isUser ? '#1e40af' : '#111'
                  }}>
                    {entry.username} {isUser && '(Toi)'}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    Niv. {entry.level} · {entry.itemsSaved} sauvés · {entry.streak}🔥
                  </div>
                </div>

                {/* XP */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: isUser ? '#1e40af' : '#059669'
                  }}>
                    {entry.totalXP.toLocaleString()} XP
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                    {entry.wasteRate}% gaspillage
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* INFO */}
        <div style={{
          marginTop: 24,
          padding: 16,
          backgroundColor: '#f0f9ff',
          borderRadius: 12,
          fontSize: 13,
          color: '#1e40af',
          textAlign: 'center'
        }}>
          💡 Le classement se met à jour en temps réel !<br />
          Continue à sauver des aliments pour grimper 📈
        </div>
      </main>
    </>
  )
}
