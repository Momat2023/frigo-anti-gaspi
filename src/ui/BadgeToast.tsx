import { useEffect, useState } from 'react'

type BadgeToastProps = {
  badge: {
    icon: string
    name: string
    description: string
  } | null
  onClose: () => void
}

export default function BadgeToast({ badge, onClose }: BadgeToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (badge) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onClose, 300) // Attendre la fin de l'animation
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [badge, onClose])

  if (!badge) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: visible ? 24 : -200,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        maxWidth: 400,
        width: 'calc(100% - 32px)',
        padding: 20,
        backgroundColor: '#10b981',
        color: 'white',
        borderRadius: 16,
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        transition: 'top 0.3s ease-out',
        textAlign: 'center'
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 8 }}>{badge.icon}</div>
      <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
        🎉 Badge débloqué !
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
        {badge.name}
      </div>
      <div style={{ fontSize: 14, opacity: 0.9 }}>
        {badge.description}
      </div>
    </div>
  )
}
