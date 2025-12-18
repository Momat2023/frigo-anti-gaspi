import { useEffect, useState } from 'react'
import { getTitleForLevel } from '../data/xp'

interface LevelUpModalProps {
  newLevel: number
  rewards: string[]
  onClose: () => void
}

export default function LevelUpModal({ newLevel, rewards, onClose }: LevelUpModalProps) {
  const [show, setShow] = useState(false)
  const titleInfo = getTitleForLevel(newLevel)

  useEffect(() => {
    // Vibration
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 300])
    }

    // Animation d'entrée
    setTimeout(() => setShow(true), 100)

    // Fermeture auto après 5 secondes
    const timer = setTimeout(() => {
      handleClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  function handleClose() {
    setShow(false)
    setTimeout(onClose, 300)
  }

  return (
    <>
      <style>{`
        @keyframes level-up-enter {
          0% { 
            transform: scale(0.5) rotate(-10deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) rotate(5deg);
          }
          100% { 
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        @keyframes confetti-burst {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(-300px) rotate(720deg) scale(0); opacity: 0; }
        }
        @keyframes rays-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Overlay */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: show ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      >
        {/* Confettis */}
        <ConfettiBurst />

        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)',
            borderRadius: 24,
            padding: 40,
            maxWidth: 400,
            width: '90%',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            border: '4px solid #f59e0b',
            boxShadow: '0 20px 60px rgba(251, 191, 36, 0.5)',
            animation: show ? 'level-up-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
          }}
        >
          {/* Rayons de lumière rotatifs */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 300,
            height: 300,
            marginLeft: -150,
            marginTop: -150,
            background: 'conic-gradient(from 0deg, transparent 0%, rgba(251, 191, 36, 0.3) 10%, transparent 20%, rgba(251, 191, 36, 0.3) 30%, transparent 40%, rgba(251, 191, 36, 0.3) 50%, transparent 60%, rgba(251, 191, 36, 0.3) 70%, transparent 80%, rgba(251, 191, 36, 0.3) 90%, transparent 100%)',
            animation: 'rays-rotate 4s linear infinite',
            pointerEvents: 'none'
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Icon */}
            <div style={{
              fontSize: 80,
              marginBottom: 16,
              animation: 'bounce 1s ease-in-out infinite'
            }}>
              {titleInfo.emoji}
            </div>

            {/* Titre */}
            <div style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: '#92400e',
              marginBottom: 8
            }}>
              NIVEAU {newLevel} !
            </div>

            {/* Sous-titre */}
            <div style={{
              fontSize: 24,
              fontWeight: 600,
              color: '#b45309',
              marginBottom: 24
            }}>
              {titleInfo.title}
            </div>

            {/* Message */}
            <div style={{
              fontSize: 16,
              color: '#78350f',
              marginBottom: 24,
              fontStyle: 'italic'
            }}>
              Tu es maintenant {titleInfo.title} ! 🎉
            </div>

            {/* Récompenses */}
            {rewards.length > 0 && (
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                borderRadius: 12,
                padding: 16,
                marginBottom: 24
              }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#92400e',
                  marginBottom: 12
                }}>
                  🎁 Récompenses débloquées
                </div>
                {rewards.map((reward, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 14,
                      color: '#78350f',
                      marginBottom: 6,
                      fontWeight: 500
                    }}
                  >
                    ✨ {reward}
                  </div>
                ))}
              </div>
            )}

            {/* Bouton */}
            <button
              onClick={handleClose}
              style={{
                padding: '14px 32px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
                transition: 'transform 0.2s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Continuer 🚀
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function ConfettiBurst() {
  const colors = ['#fbbf24', '#f59e0b', '#ef4444', '#ec4899', '#a855f7', '#6366f1', '#10b981']
  const pieces = Array.from({ length: 80 })

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      width: 10,
      height: 10,
      pointerEvents: 'none',
      zIndex: 9999
    }}>
      {pieces.map((_, i) => {
        const angle = (360 / pieces.length) * i
        const velocity = 200 + Math.random() * 100
        const x = Math.cos(angle * Math.PI / 180) * velocity
        const y = Math.sin(angle * Math.PI / 180) * velocity

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 12,
              height: 12,
              backgroundColor: colors[Math.floor(Math.random() * colors.length)],
              animation: `confetti-burst 1.5s ease-out forwards`,
              animationDelay: `${Math.random() * 0.2}s`,
              transform: `translate(${x}px, ${y}px)`,
              borderRadius: Math.random() > 0.5 ? '50%' : '0'
            }}
          />
        )
      })}
    </div>
  )
}
