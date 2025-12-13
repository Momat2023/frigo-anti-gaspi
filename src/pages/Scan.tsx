import { useEffect, useRef, useState } from 'react'
import Header from '../ui/Header'

type CamState = 'idle' | 'starting' | 'running' | 'error'

export default function Scan() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [state, setState] = useState<CamState>('idle')
  const [error, setError] = useState<string | null>(null)

  async function startCamera() {
    try {
      setError(null)
      setState('starting')

      // Caméra arrière (Android). "ideal" = préfère l'arrière si dispo. [web:583]
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
        },
      })

      streamRef.current = stream

      const video = videoRef.current
      if (!video) {
        setState('error')
        setError('Video element introuvable')
        return
      }

      video.srcObject = stream
      // iOS demande souvent playsInline; Android ok mais on le met quand même.
      video.playsInline = true
      await video.play()

      setState('running')
    } catch (e: any) {
      setState('error')
      setError(e?.message ?? 'Impossible de démarrer la caméra')
    }
  }

  function stopCamera() {
    const stream = streamRef.current
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
    }
    streamRef.current = null

    const video = videoRef.current
    if (video) {
      video.pause()
      video.srcObject = null
    }

    setState('idle')
  }

  // Nettoyage quand on quitte la page
  useEffect(() => {
    return () => {
      stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canUseCamera = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

  return (
    <>
      <Header />
      <main style={{ padding: 12, display: 'grid', gap: 12 }}>
        <h1>Scan</h1>

        {!canUseCamera && (
          <p>
            Caméra non disponible. Vérifie que tu es sur HTTPS ou localhost, et que le navigateur supporte getUserMedia.
          </p>
        )}

        <div style={{ background: '#111', borderRadius: 12, overflow: 'hidden' }}>
          <video
            ref={videoRef}
            style={{ width: '100%', height: '50vh', objectFit: 'cover', display: 'block' }}
            muted
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={startCamera} disabled={!canUseCamera || state === 'starting' || state === 'running'}>
            {state === 'starting' ? 'Démarrage…' : 'Démarrer caméra'}
          </button>
          <button onClick={stopCamera} disabled={state !== 'running'}>
            Stop
          </button>
        </div>

        {error && (
          <div style={{ color: 'crimson' }}>
            Erreur : {error}
          </div>
        )}

        <p style={{ fontSize: 12, opacity: 0.75 }}>
          Astuce Android : autorise la caméra quand Chrome le demande, puis vise un code-barres bien éclairé.
        </p>
      </main>
    </>
  )
}
