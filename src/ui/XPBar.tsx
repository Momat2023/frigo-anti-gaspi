import { useEffect, useState } from 'react'
import { getCurrentLevel, getXPForLevel } from '../data/xp'
import type { Level } from '../data/xp'

interface XPBarProps {
  compact?: boolean
}

export default function XPBar({ compact = false }: XPBarProps) {
  const [level, setLevel] = useState<Level | null>(null)

  useEffect(() => {
    loadLevel()
  }, [])

  async function loadLevel() {
    const l = await getCurrentLevel()
    setLevel(l)
  }

  if (!level) return null

  const xpInCurrentLevel = level.xp - (level.level > 1 ? getXPForLevel(level.level) : 0)
  const xpNeededForLevel = getXPForLevel(level.level + 1) - getXPForLevel(level.level)
  const progress = (xpInCurrentLevel / xpNeededForLevel) * 100

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 12px',
        backgroundColor: '#f0f9ff',
        borderRadius: 8,
        border: '1px solid #bfdbfe'
      }}>
        <div style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: '#1e40af'
        }}>
          {level.level}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            height: 8,
            backgroundColor: '#dbeafe',
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
              transition: 'width 0.5s ease-out',
              boxShadow: '0 0 8px #3b82f6'
            }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      padding: 20,
      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      borderRadius: 16,
      border: '2px solid #93c5fd',
      marginBottom: 24,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; box-shadow: 0 0 20px #3b82f6; }
          50% { opacity: 1; box-shadow: 0 0 40px #3b82f6; }
        }
      `}</style>

      {/* Animation de fond */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '200%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
        animation: 'shimmer 3s infinite'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header : Niveau + Titre */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16
        }}>
          <div>
            <div style={{ 
              fontSize: 14,
              color: '#6b7280',
              marginBottom: 4
            }}>
              Niveau
            </div>
            <div style={{ 
              fontSize: 40,
              fontWeight: 'bold',
              color: '#1e40af',
              lineHeight: 1
            }}>
              {level.level}
            </div>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              fontSize: 28,
              marginBottom: 4
            }}>
              {level.titleEmoji}
            </div>
            <div style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#1e40af'
            }}>
              {level.title}
            </div>
          </div>
        </div>

        {/* Barre de progression */}
        <div style={{ marginBottom: 12 }}>
          <div style={{
            width: '100%',
            height: 20,
            backgroundColor: '#dbeafe',
            borderRadius: 10,
            overflow: 'hidden',
            position: 'relative',
            border: '2px solid #93c5fd'
          }}>
            {/* Barre remplie */}
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 50%, #3b82f6 100%)',
              backgroundSize: '200% 100%',
              animation: progress > 90 ? 'pulse-glow 2s ease-in-out infinite' : 'none',
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: 8,
              color: 'white',
              fontSize: 12,
              fontWeight: 600
            }}>
              {progress > 20 && `${Math.floor(progress)}%`}
            </div>
          </div>
        </div>

        {/* Infos XP */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 13,
          color: '#6b7280'
        }}>
          <span>
            <strong style={{ color: '#1e40af' }}>{xpInCurrentLevel}</strong> / {xpNeededForLevel} XP
          </span>
          <span>
            <strong style={{ color: '#f59e0b' }}>+{level.xpToNext} XP</strong> pour niveau {level.level + 1}
          </span>
        </div>

        {/* Récompenses du niveau actuel */}
        {level.rewards.length > 0 && (
          <div style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: '#fef3c7',
            borderRadius: 8,
            border: '1px solid #fbbf24'
          }}>
            <div style={{ 
              fontSize: 12,
              fontWeight: 600,
              color: '#92400e',
              marginBottom: 6
            }}>
              🎁 Récompenses débloquées :
            </div>
            <div style={{ fontSize: 13, color: '#78350f' }}>
              {level.rewards.join(' • ')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
