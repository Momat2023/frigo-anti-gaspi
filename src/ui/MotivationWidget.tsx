import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStats, ALL_BADGES } from '../data/stats'
import type { Stats } from '../data/stats'

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

  // Trouver le prochain badge à débloquer
  const nextBadge = ALL_BADGES.find(badge => !badge.condition(stats))
  
  // Calculer la progression vers le prochain badge (exemple avec "save-10")
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
    } else if (nextBadge.id === 'zero-waste-week') {
      progress = (stats.currentStreak / 7) * 100
      progressLabel = `${stats.currentStreak}/7 jours sans gaspillage`
    } else if (nextBadge.id === 'eco-warrior') {
      progress = stats.totalItems >= 10 ? (stats.savedRate / 90) * 100 : 0
      progressLabel = `${stats.savedRate.toFixed(0)}%/90% de réussite`
    } else if (nextBadge.id === 'money-saver') {
      progress = (stats.moneySaved / 50) * 100
      progressLabel = `${stats.moneySaved.toFixed(0)}€/50€ économisés`
    } else if (nextBadge.id === 'streak-master') {
      progress = (stats.currentStreak / 30) * 100
      progressLabel = `${stats.currentStreak}/30 jours de streak`
    }
  }

  // Couleur dynamique selon le taux de réussite
  const getColor = () => {
    if (stats.savedRate >= 90) return { bg: '#ecfdf5', border: '#6ee7b7', text: '#065f46' }
    if (stats.savedRate >= 70) return { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af' }
    if (stats.savedRate >= 50) return { bg: '#fef3c7', border: '#fcd34d', text: '#78350f' }
    return { bg: '#fee2e2', border: '#fca5a5', text: '#7f1d1d' }
  }

  const colors = getColor()

  return (
    <Link
      to="/stats"
      style={{
        display: 'block',
        padding: 16,
        borderRadius: 12,
        backgroundColor: colors.bg,
        border: `2px solid ${colors.border}`,
        marginBottom: 24,
        textDecoration: 'none',
        transition: 'transform 0.2s',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {/* Header avec streak et taux */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>🔥</span>
          <div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>
              {stats.currentStreak} jours
            </div>
            <div style={{ fontSize: 11, color: colors.text, opacity: 0.8 }}>
              Sans gaspillage
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>
            {stats.savedRate.toFixed(0)}%
          </div>
          <div style={{ fontSize: 11, color: colors.text, opacity: 0.8 }}>
            Réussite
          </div>
        </div>
      </div>

      {/* Économies */}
      {stats.moneySaved > 0 && (
        <div style={{ 
          marginBottom: 12,
          padding: 8,
          backgroundColor: 'rgba(255,255,255,0.5)',
          borderRadius: 8
        }}>
          <div style={{ fontSize: 12, color: colors.text, opacity: 0.8 }}>
            💰 Économisé
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: colors.text }}>
            {stats.moneySaved.toFixed(2)} €
          </div>
        </div>
      )}

      {/* Prochain badge */}
      {nextBadge && (
        <div>
          <div style={{ 
            fontSize: 11, 
            fontWeight: 600, 
            color: colors.text, 
            marginBottom: 6,
            opacity: 0.8
          }}>
            🎯 Prochain badge : {nextBadge.name}
          </div>
          
          {/* Barre de progression */}
          <div style={{ 
            height: 8, 
            backgroundColor: 'rgba(0,0,0,0.1)', 
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: 4
          }}>
            <div style={{ 
              height: '100%',
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: colors.text,
              transition: 'width 0.3s ease'
            }} />
          </div>
          
          <div style={{ fontSize: 10, color: colors.text, opacity: 0.7 }}>
            {progressLabel}
          </div>
        </div>
      )}

      {/* Tous les badges débloqués */}
      {!nextBadge && (
        <div style={{ 
          textAlign: 'center',
          padding: 8,
          backgroundColor: 'rgba(255,255,255,0.5)',
          borderRadius: 8
        }}>
          <span style={{ fontSize: 18 }}>🏆</span>
          <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
            Tous les badges débloqués !
          </div>
        </div>
      )}
    </Link>
  )
}
