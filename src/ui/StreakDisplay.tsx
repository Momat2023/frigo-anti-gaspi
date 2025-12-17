import { useEffect, useState } from 'react'
import { getStats } from '../data/stats'

export default function StreakDisplay() {
  const [streak, setStreak] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    loadStreak()
  }, [])

  async function loadStreak() {
    const stats = await getStats()
    const newStreak = stats.streak
    
    // Si le streak vient d'atteindre un milestone
    const milestones = [7, 14, 30, 60, 90]
    if (milestones.includes(newStreak)) {
      const lastCelebrated = localStorage.getItem('last-streak-celebration')
      if (lastCelebrated !== newStreak.toString()) {
        triggerCelebration(newStreak)
        localStorage.setItem('last-streak-celebration', newStreak.toString())
      }
    }
    
    setStreak(newStreak)
  }

  function triggerCelebration(streakValue: number) {
    // Confettis
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)

    // Vibration (si supporté)
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 200])
    }

    // Notification
    if (Notification.permission === 'granted') {
      new Notification(`🎉 ${streakValue} jours de streak !`, {
        body: 'Tu es en feu ! Continue comme ça ! 🔥',
        icon: '/pwa-192x192.png'
      })
    }
  }

  function getFlameLevel() {
    if (streak === 0) return { flames: 0, size: 'small', color: '#9ca3af', label: 'Pas encore de streak', emoji: '💤' }
    if (streak < 7) return { flames: 1, size: 'small', color: '#f97316', label: 'Début prometteur', emoji: '🔥' }
    if (streak < 14) return { flames: 2, size: 'medium', color: '#ef4444', label: 'Tu chauffes !', emoji: '🔥🔥' }
    if (streak < 30) return { flames: 3, size: 'large', color: '#dc2626', label: 'En feu !', emoji: '��🔥🔥' }
    if (streak < 60) return { flames: 4, size: 'xlarge', color: '#991b1b', label: 'Inarrêtable !', emoji: '🔥🔥🔥🔥' }
    return { flames: 5, size: 'legendary', color: '#fbbf24', label: 'LÉGENDE !', emoji: '💎🔥💎' }
  }

  const level = getFlameLevel()

  return (
    <>
      {showConfetti && <Confetti />}
      
      <div style={{
        padding: 24,
        background: `linear-gradient(135deg, ${level.color}22 0%, ${level.color}11 100%)`,
        borderRadius: 16,
        border: `2px solid ${level.color}`,
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 8px 32px ${level.color}33`
      }}>
        {/* Animation de fond */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 50%, ${level.color}11 0%, transparent 70%)`,
          animation: 'pulse 2s ease-in-out infinite'
        }} />

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes confetti-fall {
            0% { transform: translateY(-100vh) rotate(0deg); }
            100% { transform: translateY(100vh) rotate(720deg); }
          }
        `}</style>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Emoji animé */}
          <div style={{ 
            textAlign: 'center', 
            fontSize: level.size === 'legendary' ? 80 : level.size === 'xlarge' ? 64 : level.size === 'large' ? 52 : level.size === 'medium' ? 44 : 36,
            marginBottom: 12,
            animation: streak >= 7 ? 'bounce 1s ease-in-out infinite' : 'none'
          }}>
            {level.emoji}
          </div>

          {/* Streak count */}
          <div style={{ 
            textAlign: 'center',
            fontSize: 48,
            fontWeight: 'bold',
            color: level.color,
            marginBottom: 8,
            textShadow: `0 2px 8px ${level.color}55`
          }}>
            {streak} jour{streak > 1 ? 's' : ''}
          </div>

          {/* Label */}
          <div style={{ 
            textAlign: 'center',
            fontSize: 18,
            fontWeight: 600,
            color: level.color,
            marginBottom: 16
          }}>
            {level.label}
          </div>

          {/* Barre de progression vers prochain milestone */}
          {streak > 0 && <ProgressBar streak={streak} />}

          {/* Message motivant */}
          <div style={{ 
            textAlign: 'center',
            fontSize: 14,
            color: '#6b7280',
            marginTop: 12
          }}>
            {streak === 0 && "Commence ton streak aujourd'hui ! 💪"}
            {streak > 0 && streak < 7 && "Continue ! Le badge 7 jours t'attend 🎯"}
            {streak >= 7 && streak < 14 && "Incroyable ! Vise maintenant 14 jours 🚀"}
            {streak >= 14 && streak < 30 && "Tu es un pro ! 30 jours en vue 🏆"}
            {streak >= 30 && streak < 60 && "Légendaire ! Continue vers 60 jours 💎"}
            {streak >= 60 && "TU ES UNE LÉGENDE VIVANTE ! 🌟"}
          </div>
        </div>
      </div>
    </>
  )
}

function ProgressBar({ streak }: { streak: number }) {
  const milestones = [7, 14, 30, 60, 90]
  const nextMilestone = milestones.find(m => m > streak) || 100
  const prevMilestone = [...milestones].reverse().find(m => m <= streak) || 0
  
  const progress = ((streak - prevMilestone) / (nextMilestone - prevMilestone)) * 100

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 8
      }}>
        <span>Prochain objectif</span>
        <span style={{ fontWeight: 600 }}>{nextMilestone} jours</span>
      </div>
      
      <div style={{
        width: '100%',
        height: 12,
        backgroundColor: '#f3f4f6',
        borderRadius: 6,
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #f97316 0%, #ef4444 100%)',
          borderRadius: 6,
          transition: 'width 0.5s ease-out',
          boxShadow: '0 0 10px #f9731655'
        }} />
      </div>
      
      <div style={{ 
        textAlign: 'center',
        fontSize: 12,
        color: '#6b7280',
        marginTop: 8
      }}>
        Plus que {nextMilestone - streak} jour{(nextMilestone - streak) > 1 ? 's' : ''} ! 💪
      </div>
    </div>
  )
}

function Confetti() {
  const colors = ['#fbbf24', '#f97316', '#ef4444', '#ec4899', '#a855f7', '#6366f1']
  const pieces = Array.from({ length: 50 })

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 9999
    }}>
      {pieces.map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: -20,
            width: 10,
            height: 10,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            animation: `confetti-fall ${2 + Math.random() * 2}s linear`,
            animationDelay: `${Math.random() * 0.5}s`,
            opacity: 0.8
          }}
        />
      ))}
    </div>
  )
}
