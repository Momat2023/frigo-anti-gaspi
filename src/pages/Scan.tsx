import { useEffect, useMemo, useRef, useState } from 'react'
import Header from '../ui/Header'

type CamState = 'idle' | 'starting' | 'running' | 'error'

export default function Scan() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Loop control
  const rafRef = useRef<number | null>(null)
  const detectingRef = useRef(false)

  // “Stabilisation” simple (même valeur vue plusieurs fois)
  const lastValueRef = useRef<string | null>(null)
  const sameCountRef = useRef(0)

  const [state, setState] = useState<CamState>('idle')
  const [error, setError] = useState<string | null>(null)

  const [supported, setSupported] = useState<string[]>([])
  const [detected, setDetected] = useState<string | null>(null)

  const canUseBarcodeDetector = useMemo(() => typeof (globalThis as any).BarcodeDetector !== 'undefined', [])

  async function startCamera() {
    try {
      setError(null)
      setDetected(null)
      lastValueRef.current = null
      sameCountRef.current = 0

      setState('starting')

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } },
      })

      streamRef.current = stream

      const video = videoRef.current
      if (!video) {
        setState('error')
        setError('Video element introuvable')
        return
      }

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
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    detectingRef.current = false

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

  // Charger formats supportés (natif)
  useEffect(() => {
    if (!canUseBarcodeDetector) return
    // getSupportedFormats() renvoie un tableau des formats supportés [web:490]
    ;(globalThis as any).BarcodeDetector.getSupportedFormats()
      .then((fmts: string[]) => setSupported(fmts))
      .catch(() => setSupported([]))
  }, [canUseBarcodeDetector])

  // Loop de détection quand la caméra tourne
  useEffect(() => {
    if (state !== 'running') return
    if (!canUseBarcodeDetector) return
    if (!videoRef.current) return
    if (detected) return

    const formats = supported.filter((f) => f === 'ean_13' || f === 'qr_code')
    const Detector = (globalThis as any).BarcodeDetector
    const detector = new Detector({ formats: formats.length ? formats : undefined })

    const tick = async () => {
      rafRef.current = requestAnimationFrame(tick)

      if (detectingRef.current) return
      if (detected) return

      const video = videoRef.current
      if (!video) return
      if (video.readyState < 2) return // pas assez de data

      detectingRef.current = true
      try {
        // detect() accepte HTMLVideoElement et renvoie des barcodes avec rawValue [web:590]
        const barcodes = await detector.detect(video)
        const value = barcodes?.[0]?.rawValue ?? null

        if (value) {
          if (lastValueRef.current === value) {
            sameCountRef.current += 1
          } else {
            lastValueRef.current = value
            sameCountRef.current = 1
          }

          // “stabilisé” si vu 3 fois
          if (sameCountRef.current >= 3) {
            setDetected(value)
            stopCamera()
          }
        }
      } catch {
        // ignore (certains devices jettent parfois pendant la lecture)
      } finally {
        detectingRef.current = false
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      detectingRef.current = false
    }
  }, [state, canUseBarcodeDetector, supported, detected])

  // Nettoyage quand on quitte la page
  useEffect(() => {
    return () => stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canUseCamera = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

  function onUseCode() {
    if (!detected) return
    // J9: on fera /add?barcode=... ; pour l’instant on montre juste la valeur
    alert(`Code: ${detected}`)
  }

  return (
    <>
      <Header />
      <main style={{ padding: 12, display: 'grid', gap: 12 }}>
        <h1>Scan</h1>

        {!canUseCamera && (
          <p>Caméra non disponible (HTTPS ou localhost requis).</p>
        )}

        {canUseCamera && !canUseBarcodeDetector && (
          <p>
            BarcodeDetector non supporté sur ce navigateur. (Jour 8: on ajoutera le polyfill.)
          </p>
        )}

        {canUseBarcodeDetector && supported.length > 0 && (
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Formats supportés: {supported.join(', ')}
          </div>
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
