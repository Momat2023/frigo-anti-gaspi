import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../ui/Header'
import { loadScanHistory, pushScanHistory } from '../data/scanHistory'

type CamState = 'idle' | 'starting' | 'running' | 'error'

export default function Scan() {
  const navigate = useNavigate()

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [state, setState] = useState<CamState>('idle')
  const [error, setError] = useState<string | null>(null)

  const [detected, setDetected] = useState<string | null>(null)
  const [manual, setManual] = useState('')
  const [history, setHistory] = useState<string[]>(() => loadScanHistory())

  const canVibrate = useMemo(() => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function', [])
  const canUseCamera = useMemo(() => !!navigator.mediaDevices?.getUserMedia, [])
  const hasBarcodeDetector = useMemo(() => typeof (globalThis as any).BarcodeDetector !== 'undefined', [])

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

  function acceptCode(code: string) {
    const c = code.trim()
    if (!c) return
    setDetected(c)
    pushScanHistory(c)
    setHistory(loadScanHistory())
    if (canVibrate) navigator.vibrate(50)
    stopCamera()
  }

  // Scan loop
  useEffect(() => {
    if (state !== 'running') return
    if (!hasBarcodeDetector) return
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
        if (value) acceptCode(value)
      } catch {
        // ignore (fallback manuel)
      }
    }, 300)

    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, detected, hasBarcodeDetector])

  useEffect(() => () => stopCamera(), [])

  function useDetected() {
    if (!detected) return
    navigate(`/add?barcode=${encodeURIComponent(detected)}`)
  }

  function rescan() {
    setDetected(null)
    startCamera()
  }

  function useManual() {
    acceptCode(manual)
    if (manual.trim()) navigate(`/add?barcode=${encodeURIComponent(manual.trim())}`)
  }

  return (
    <>
      <Header />
      <main style={{ padding: 12, display: 'grid', gap: 12 }}>
        <h1>Scan</h1>

        {detected && (
          <div style={{ border: '1px solid #ddd', borderRadius: 12, padding: 12 }}>
            <div>
              Détecté : <strong>{detected}</strong>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={useDetected}>Utiliser ce code</button>
              <button onClick={rescan}>Rescanner</button>
            </div>
          </div>
        )}

        {!hasBarcodeDetector && (
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            BarcodeDetector non disponible (polyfill devrait le fournir; sinon on passe en saisie manuelle).
          </div>
        )}

        <div style={{ background: '#111', borderRadius: 12, overflow: 'hidden' }}>
          <video
            ref={videoRef}
            style={{ width: '100%', height: '45vh', objectFit: 'cover', display: 'block' }}
            muted
          />
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={startCamera} disabled={!canUseCamera || state === 'starting' || state === 'running'}>
            {state === 'starting' ? 'Démarrage…' : 'Démarrer'}
          </button>
          <button onClick={stopCamera} disabled={state !== 'running'}>
            Stop
          </button>
          <button onClick={() => acceptCode(manual)} disabled={!manual.trim()}>
            Valider saisie
          </button>
        </div>

        <label>
          Saisie manuelle (si scan difficile)
          <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="EAN-13 / QR raw value" />
        </label>

        <button onClick={useManual} disabled={!manual.trim()}>
          Utiliser la saisie
        </button>

        {history.length > 0 && (
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Historique</div>
            {history.map((c) => (
              <button key={c} onClick={() => setManual(c)} style={{ textAlign: 'left' }}>
                {c}
              </button>
            ))}
          </div>
        )}

        {error && <div style={{ color: 'crimson' }}>Erreur : {error}</div>}
      </main>
    </>
  )
}
