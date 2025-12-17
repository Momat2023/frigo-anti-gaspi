import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Attendre 3 secondes avant de montrer le prompt
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    console.log(`User response: ${outcome}`)
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  function handleDismiss() {
    setShowPrompt(false)
    // Ne plus montrer pendant 7 jours
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
  }

  // Ne pas montrer si déjà installé ou récemment dismissé
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed')
    if (dismissed) {
      const dismissedAt = parseInt(dismissed)
      const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
      if (daysSince < 7) {
        setShowPrompt(false)
      }
    }
  }, [])

  if (!showPrompt || !deferredPrompt) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        maxWidth: 400,
        margin: '0 auto',
        padding: 16,
        backgroundColor: '#6366f1',
        color: 'white',
        borderRadius: 12,
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        zIndex: 9999,
        animation: 'slideUp 0.3s ease-out'
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ fontSize: 32 }}>📱</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            Installer l'application
          </div>
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 12 }}>
            Accédez rapidement à Frigo Anti-Gaspi depuis votre écran d'accueil
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleInstall}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: 'white',
                color: '#6366f1',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Installer
            </button>
            <button
              onClick={handleDismiss}
              style={{
                padding: '10px 16px',
                backgroundColor: 'transparent',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 8,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
