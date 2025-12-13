import { useEffect, useState } from 'react'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export default function PwaPanel() {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null)
  const [installState, setInstallState] = useState<'idle' | 'available' | 'done'>('idle')

  const [updateReady, setUpdateReady] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  // Install prompt
  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault()
      setDeferred(e as InstallPromptEvent)
      setInstallState('available')
    }
    window.addEventListener('beforeinstallprompt', onBip as any)
    return () => window.removeEventListener('beforeinstallprompt', onBip as any)
  }, [])

  // SW update detection
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const handleRegistration = (reg: ServiceWorkerRegistration | undefined) => {
      if (!reg) return

      // cas: déjà en waiting
      if (reg.waiting) {
        setUpdateReady(true)
        setWaitingWorker(reg.waiting)
      }

      reg.addEventListener('updatefound', () => {
        const installing = reg.installing
        if (!installing) return

        installing.addEventListener('statechange', () => {
          // Quand installé, s'il y a déjà un controller, c'est une update (pas la 1ère install)
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateReady(true)
            setWaitingWorker(reg.waiting || null)
          }
        })
      })
    }

    navigator.serviceWorker.getRegistration().then(handleRegistration).catch(() => {})
  }, [])

  async function onInstall() {
    if (!deferred) return
    try {
      await deferred.prompt()
      await deferred.userChoice
    } finally {
      setDeferred(null)
      setInstallState('done')
    }
  }

  async function onUpdateNow() {
    if (!waitingWorker) {
      alert("Aucune mise à jour en attente (essaie de recharger / redeployer).")
      return
    }
    waitingWorker.postMessage({ type: 'SKIP_WAITING' })
    // le reload est géré par controllerchange dans main.tsx
  }

  return (
    <section style={{ display: 'grid', gap: 8 }}>
      <h2>PWA (install / update)</h2>

      <div style={{ fontSize: 12, opacity: 0.8 }}>
        Install: {installState}
        <br />
        Update: {updateReady ? 'disponible' : 'rien à signaler'}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={onInstall} disabled={installState !== 'available'}>
          Installer l’app
        </button>

        <button onClick={onUpdateNow} disabled={!updateReady}>
          Mettre à jour maintenant
        </button>
      </div>

      <p style={{ fontSize: 12, opacity: 0.75 }}>
        “Installer l’app” n’apparaît que si le navigateur déclenche beforeinstallprompt (critères PWA). 
      </p>
    </section>
  )
}
