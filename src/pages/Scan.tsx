import { useEffect, useMemo, useRef, useState } from 'react'
import Header from '../ui/Header'

type CamState = 'idle' | 'starting' | 'running' | 'error'

export default function Scan() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [state, setState] = useState<CamState>('idle')
  const [error, setError] = useState<string | null>(null)

  const [supported, setSupported] = useState<string[] | null>(null)
  const [detectError, setDetectError] = useState<string | null>(null)
  const [detected, setDetected] = useState<string | null>(null)

  const hasBarcodeDetector = useMemo(() => typeof (globalThis as any).BarcodeDetector !== 'undefined', [])

  async function startCamera() {
    try {
      setError(null)
      setDetectError(null)
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

  // Afficher formats supportés (ou l'erreur)
  useEffect(() => {
    if (!hasBarcodeDetector) {
      setSupported(null)
      return
    }
    ;(globalThis as any).BarcodeDetector.getSupportedFormats()
      .then((fmts: string[]) => setSupported(fmts))
      .catch((e: any) => {
        setSupported([])
        setDetectError(`getSupportedFormats() a échoué: ${e?.message ?? String(e)}`)
      })
  }, [hasBarcodeDetector])

  // Loop simple toutes les 300ms via canvas (souvent plus fiable que detect(video) selon devices)
  useEffect(() => {
    if (state !== 'running') return
    if (!hasBarcodeDetector) return
    if (detected) return

    const Detector = (globalThis as any).BarcodeDetector
    let detector: any
    try {
      detector = new Detector({ formats: ['qr_code', 'ean_13'] })
    } catch (e: any) {
      setDetectError(`Constructor BarcodeDetector a échoué: ${e?.message ?? String(e)}`)
      return
    }

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
      } catch (e: any) {
        setDetectError(`detect() a échoué: ${e?.message ?? String(e)}`)
      }
    }, 300)

    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, hasBarcodeDetector, detected])

  useEffect(() => () => stopCamera(), [])

  const canUseCamera = !!navigator.mediaDevices?.getUserMedia

  return (
    <>
      <Header />
      <main style={{ padding: 12, display: 'grid', gap: 12 }}>
        <h1>Scan</h1>

        <div style={{ fontSize: 12, opacity: 0.75 }}>
          Camera API: {canUseCamera ? 'OK' : 'NON'}
          <br />
          BarcodeDetector: {hasBarcodeDetector ? 'OK' : 'NON'}
          <br />
          Formats: {supported === null ? '(n/a)' : supported.length ? supported.join(', ') : '(vide)'}
        </div>

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

        {detected && <div>Détecté : <strong>{detected}</strong></div>}
        {error && <div style={{ color: 'crimson' }}>Caméra: {error}</div>}
        {detectError && <div style={{ color: 'crimson' }}>Détection: {detectError}</div>}
      </main>
    </>
  )
}
