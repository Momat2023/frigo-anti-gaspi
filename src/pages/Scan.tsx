import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrowserMultiFormatReader } from '@zxing/library'
import Header from '../ui/Header'
import { CATEGORY_DURATIONS } from '../data/presets'
import type { Category } from '../data/types'
import { trackEvent } from '../services/analytics'
import { addXP } from '../data/xp'

export default function Scan() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const navigate = useNavigate()
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)

  useEffect(() => {
    trackEvent('page_view', { page: 'scan' })
    startScanning()
    return () => stopScanning()
  }, [])

  async function startScanning() {
    try {
      setScanning(true)
      setError('')

      const reader = new BrowserMultiFormatReader()
      readerRef.current = reader

      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(d => d.kind === 'videoinput')
      
      if (videoDevices.length === 0) {
        setError('Aucune caméra détectée')
        return
      }

      // Préférer la caméra arrière sur mobile
      const backCamera = videoDevices.find(d => 
        d.label.toLowerCase().includes('back') || 
        d.label.toLowerCase().includes('rear')
      )
      const deviceId = backCamera ? backCamera.deviceId : videoDevices[0].deviceId

      reader.decodeFromVideoDevice(
        deviceId,
        videoRef.current!,
        async (result) => {
          if (result) {
            const barcode = result.getText()
            console.log('Code-barres détecté:', barcode)
            
            // Gagner XP pour scan
            await addXP('SCAN_BARCODE', { barcode })
            
            // Track event
            trackEvent('barcode_scanned', { barcode })
            
            stopScanning()
            await fetchProductInfo(barcode)
          }
        }
      )
    } catch (err) {
      console.error('Erreur scanning:', err)
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.')
    }
  }

  function stopScanning() {
    if (readerRef.current) {
      readerRef.current.reset()
      readerRef.current = null
    }
    setScanning(false)
  }

  async function fetchProductInfo(barcode: string) {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
      const data = await response.json()

      if (data.status === 1) {
        const product = data.product
        const name = product.product_name || product.product_name_fr || 'Produit inconnu'
        const category = guessCategory(product.categories_tags || [])
        const imageUrl = product.image_url || product.image_front_url

        const targetDays = CATEGORY_DURATIONS[category]
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + targetDays)

        navigate('/add', {
          state: {
            name,
            category,
            expiresAt: expiresAt.toISOString().split('T')[0],
            location: 'Frigo',
            barcode,
            imageUrl
          }
        })
      } else {
        navigate('/add', {
          state: { barcode }
        })
      }
    } catch (err) {
      console.error('Erreur fetch produit:', err)
      navigate('/add', {
        state: { barcode }
      })
    }
  }

  function guessCategory(tags: string[]): Category {
    const tagStr = tags.join(' ').toLowerCase()
    
    if (tagStr.includes('fruit') || tagStr.includes('vegetable') || tagStr.includes('legume')) {
      return 'Fruits & Légumes'
    }
    if (tagStr.includes('meat') || tagStr.includes('fish') || tagStr.includes('viande') || tagStr.includes('poisson')) {
      return 'Viandes & Poissons'
    }
    if (tagStr.includes('dairy') || tagStr.includes('milk') || tagStr.includes('cheese') || tagStr.includes('yaourt') || tagStr.includes('lait')) {
      return 'Produits laitiers'
    }
    if (tagStr.includes('beverage') || tagStr.includes('drink') || tagStr.includes('boisson')) {
      return 'Boissons'
    }
    if (tagStr.includes('canned') || tagStr.includes('conserve')) {
      return 'Conserves'
    }
    if (tagStr.includes('frozen') || tagStr.includes('surgele')) {
      return 'Surgelés'
    }
    
    return 'Autre'
  }

  return (
    <>
      <Header />
      <main style={{ padding: 12, maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 24 }}>📷 Scanner un code-barres</h1>

        {error && (
          <div style={{
            padding: 16,
            backgroundColor: '#fef2f2',
            border: '2px solid #fca5a5',
            borderRadius: 12,
            marginBottom: 24,
            color: '#dc2626'
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: 500,
          margin: '0 auto 24px',
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: '#000'
        }}>
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block'
            }}
          />
          
          {scanning && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              height: 4,
              backgroundColor: '#22c55e',
              animation: 'scan-line 2s ease-in-out infinite'
            }} />
          )}
        </div>

        <style>{`
          @keyframes scan-line {
            0%, 100% { transform: translate(-50%, -200px); }
            50% { transform: translate(-50%, 200px); }
          }
        `}</style>

        <div style={{
          textAlign: 'center',
          color: '#6b7280',
          fontSize: 14,
          marginBottom: 24
        }}>
          {scanning ? (
            <>
              <div style={{ marginBottom: 12 }}>
                Positionnez le code-barres devant la caméra
              </div>
              <div style={{ fontSize: 12 }}>
                Le scan se fait automatiquement
              </div>
            </>
          ) : (
            'Chargement de la caméra...'
          )}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigate('/add')}
            style={{
              flex: 1,
              padding: '14px',
              backgroundColor: 'white',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: 16,
              cursor: 'pointer'
            }}
          >
            Ajouter manuellement
          </button>
          
          <button
            onClick={() => navigate('/home')}
            style={{
              padding: '14px 24px',
              backgroundColor: 'white',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: 16,
              cursor: 'pointer'
            }}
          >
            Annuler
          </button>
        </div>
      </main>
    </>
  )
}
