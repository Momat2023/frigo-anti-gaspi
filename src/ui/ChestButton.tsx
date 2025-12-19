import { useEffect, useState } from 'react'
import { getAvailableChest } from '../data/chests'
import type { ChestAvailable } from '../data/chests'

interface ChestButtonProps {
  onOpenChest: () => void
}

export default function ChestButton({ onOpenChest }: ChestButtonProps) {
  const [available, setAvailable] = useState<ChestAvailable | null>(null)

  useEffect(() => {
    checkAvailability()
  }, [])

  async function checkAvailability() {
    const chest = await getAvailableChest()
    setAvailable(chest)
  }

  if (!available) return null

  return (
    <button
      onClick={available.canOpen ? onOpenChest : undefined}
      disabled={!available.canOpen}
      style={{
        width: '100%',
        padding: 20,
        marginBottom: 24,
        background: available.canOpen
          ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
          : 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)',
        border: 'none',
        borderRadius: 16,
        cursor: available.canOpen ? 'pointer' : 'not-allowed',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: available.canOpen
          ? '0 8px 24px rgba(251, 191, 36, 0.4)'
          : '0 4px 12px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}
      onMouseEnter={(e) => {
        if (available.canOpen) {
          e.currentTarget.style.transform = 'scale(1.02)'
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(251, 191, 36, 0.5)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = available.canOpen
          ? '0 8px 24px rgba(251, 191, 36, 0.4)'
          : '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}
    >
      <style>{`
        @keyframes chest-shine {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        @keyframes chest-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>

      {available.canOpen && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '200%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          animation: 'chest-shine 3s infinite'
        }} />
      )}

      <div style={{ 
        position: 'relative', 
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 16
      }}>
        <div style={{
          fontSize: 48,
          animation: available.canOpen ? 'chest-bounce 2s ease-in-out infinite' : 'none'
        }}>
          🎁
        </div>
        
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: available.canOpen ? 'white' : '#6b7280',
            marginBottom: 4
          }}>
            {available.canOpen ? 'Coffre disponible !' : 'Coffre quotidien'}
          </div>
          <div style={{
            fontSize: 14,
            color: available.canOpen ? 'rgba(255,255,255,0.9)' : '#9ca3af'
          }}>
            {available.canOpen 
              ? `Ouvre ton coffre ${available.type === 'gold' ? 'Or' : available.type === 'silver' ? 'Argent' : 'Bronze'} !`
              : available.reason
            }
          </div>
        </div>

        {available.canOpen && (
          <div style={{
            fontSize: 32,
            color: 'white'
          }}>
            →
          </div>
        )}
      </div>
    </button>
  )
}
