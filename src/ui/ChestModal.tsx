import { useState, useEffect } from 'react'
import { openChest, getChestColor, getChestLabel } from '../data/chests'
import type { ChestType, Chest } from '../data/chests'

interface ChestModalProps {
  chestType: ChestType
  onClose: (chest: Chest) => void
}

export default function ChestModal({ chestType, onClose }: ChestModalProps) {
  const [stage, setStage] = useState<'opening' | 'revealed'>('opening')
  const [chest, setChest] = useState<Chest | null>(null)

  useEffect(() => {
    // Vibration
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 200])
    }

    // Ouvrir le coffre après 2 secondes
    const timer = setTimeout(async () => {
      const openedChest = await openChest(chestType)
      setChest(openedChest)
      setStage('revealed')
      
      // Vibration de célébration
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 300])
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [chestType])

  const chestColor = getChestColor(chestType)
  const chestLabel = getChestLabel(chestType)

  return (
    <>
      <style>{`
        @keyframes chest-shake {
          0%, 100% { transform: rotate(0deg) scale(1); }
          10% { transform: rotate(-5deg) scale(1.05); }
          20% { transform: rotate(5deg) scale(1.05); }
          30% { transform: rotate(-5deg) scale(1.05); }
          40% { transform: rotate(5deg) scale(1.05); }
          50% { transform: rotate(0deg) scale(1); }
        }
        @keyframes chest-open {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.2) rotate(10deg); }
          100% { transform: scale(0.8) rotate(0deg); opacity: 0; }
        }
        @keyframes reward-appear {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          50% { transform: scale(1.3) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes particles-burst {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
      `}</style>

      {/* Overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Particules */}
        {stage === 'revealed' && <Particles color={chestColor} />}

        <div style={{
          background: `linear-gradient(135deg, ${chestColor}22 0%, ${chestColor}11 100%)`,
          borderRadius: 24,
          padding: 40,
          maxWidth: 400,
          width: '90%',
          textAlign: 'center',
          position: 'relative',
          border: `3px solid ${chestColor}`,
          boxShadow: `0 20px 60px ${chestColor}55`
        }}>
          {stage === 'opening' && (
            <>
              <div style={{
                fontSize: 120,
                marginBottom: 24,
                animation: 'chest-shake 0.5s ease-in-out infinite'
              }}>
                🎁
              </div>
              <div style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: chestColor,
                marginBottom: 8
              }}>
                Ouverture...
              </div>
              <div style={{
                fontSize: 16,
                color: '#6b7280'
              }}>
                {chestLabel}
              </div>
            </>
          )}

          {stage === 'revealed' && chest && (
            <>
              <div style={{
                fontSize: 100,
                marginBottom: 24,
                animation: 'reward-appear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}>
                {chest.reward.emoji}
              </div>

              <div style={{
                display: 'inline-block',
                padding: '6px 16px',
                backgroundColor: getRarityColor(chest.reward.rarity),
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                color: 'white',
                marginBottom: 16,
                textTransform: 'uppercase',
                letterSpacing: 1
              }}>
                {chest.reward.rarity === 'common' && 'Commun'}
                {chest.reward.rarity === 'rare' && 'Rare'}
                {chest.reward.rarity === 'epic' && 'Épique'}
                {chest.reward.rarity === 'legendary' && 'Légendaire'}
              </div>

              <div style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: '#111',
                marginBottom: 8
              }}>
                {chest.reward.label}
              </div>

              <div style={{
                fontSize: 14,
                color: '#6b7280',
                marginBottom: 32
              }}>
                Tu as obtenu cette récompense !
              </div>

              <button
                onClick={() => onClose(chest)}
                style={{
                  padding: '14px 32px',
                  backgroundColor: chestColor,
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: `0 4px 12px ${chestColor}66`,
                  transition: 'transform 0.2s'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Récupérer 🎉
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return '#6b7280'
    case 'rare': return '#3b82f6'
    case 'epic': return '#a855f7'
    case 'legendary': return '#f59e0b'
    default: return '#6b7280'
  }
}

function Particles({ color }: { color: string }) {
  const particles = Array.from({ length: 30 })

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      pointerEvents: 'none',
      zIndex: 9999
    }}>
      {particles.map((_, i) => {
        const angle = (360 / particles.length) * i
        const distance = 150 + Math.random() * 100
        const tx = Math.cos(angle * Math.PI / 180) * distance
        const ty = Math.sin(angle * Math.PI / 180) * distance

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 12,
              height: 12,
              backgroundColor: color,
              borderRadius: '50%',
              animation: 'particles-burst 1s ease-out forwards',
              animationDelay: `${Math.random() * 0.2}s`,
              // @ts-ignore
              '--tx': `${tx}px`,
              '--ty': `${ty}px`
            }}
          />
        )
      })}
    </div>
  )
}
