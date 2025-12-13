import { useEffect, useRef, useState } from 'react'
import Header from '../ui/Header'

type CamState = 'idle' | 'starting' | 'running' | 'error'

export default function Scan() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [state, setState] = useState<CamState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [detected, setDetected] = useState<string | null>(null)

  async function startCamera() {
    try {
      setError(null)
      setDetected(null)
      setState('starting')

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } },
      })

      streamRef.current = stream

      const video = videoRef.current
      if (!video) throw new Error('Video element introuvable')

      video.srcObject = stream
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
    if (stream) stream.getTracks().forEach((t) => t.stop())
    streamRef.current = null

    const video = videoRef.current
    if (video) {
      video.pause()
      video.srcObject = null
    }

    setState('idle')
  }

  // Boucle detect toutes les 300ms via canvas
  useEffect(() => {
    if (state !== 'running') return
    if (detected) return

    const Detector = (globalThis as any).BarcodeDetector
    const detector = new Detector({ formats: ['qr_code', 'ean_13'] })

    const timer = window.setInterval(async () => {
      try {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas) return
        if (video.readyState < 2) return
        if (!video.videoWidth || !video.videoHeight) return

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        const results = await detector.detect(canvas)
        const value = results?.[0]?.rawValue ?? null
        if (value) {
          setDetected(value)
          stopCamera()
        }
      } catch {
        // silencieux (on ajoutera une UI d'erreur plus tard si besoin)
      }
    }, 300)

    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, detected])

  useEffect(() => () => stopCamera(), [])

  const canUseCamera = !!navigator.mediaDevices?.getUserMedia

  function onUseCode() {
    if (!detected) return
    alert(`Code: ${detected}`)
  }

  return (
    <>
      <Header />
      <main style={{ padding: 12, display: 'grid', gap: 12 }}>
        <h1>Scan</h1>

        <div style={{ background: '#111', borderRadius: 12, overflow: 'hidden' }}>
          <video
            ref={videoRef}
            style={{ width: '100%', height: '50vh', objectFit: 'cover', display: 'block' }}
            muted
          />
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={startCamera} disabled={!canUseCamera || state === 'starting' || state === 'running'}>
            {state === 'starting' ? 'Démarrage…' : 'Démarrer'}
          </button>
          <button onClick={stopCamera} disabled={state !== 'running'}>
            Stop
          </button>
        </div>

        {detected && (
          <div style={{ display: 'grid', gap: 8 }}>
            <div>
              Détecté : <strong>{detected}</strong>
            </div>
            <button onClick={onUseCode}>Utiliser ce code</button>
          </div>
        )}

        {error && <div style={{ color: 'crimson' }}>Erreur : {error}</div>}
      </main>
    </>
  )
}
