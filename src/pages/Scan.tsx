import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrowserMultiFormatReader } from '@zxing/library'
import Header from '../ui/Header'
import { 
  getProductByBarcode, 
  formatProductName, 
  mapToAppCategory, 
  suggestExpirationDays,
  type OpenFoodFactsProduct 
} from '../services/openFoodFacts'

export default function Scan() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scanning, setScanning] = useState(true)
  const [error, setError] = useState('')
  const [scannedCode, setScannedCode] = useState('')
  const [productInfo, setProductInfo] = useState<OpenFoodFactsProduct | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader()
    let active = true

    async function startScan() {
      try {
        const videoInputDevices = await codeReader.listVideoInputDevices()
        if (videoInputDevices.length === 0) {
          setError('Aucune caméra détectée')
          return
        }

        const backCamera = videoInputDevices.find(device =>
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('arrière') ||
          device.label.toLowerCase().includes('environment')
        )
        const deviceId = backCamera?.deviceId || videoInputDevices[0].deviceId

        await codeReader.decodeFromVideoDevice(
          deviceId,
          videoRef.current!,
          async (result) => {
            if (result && active) {
              const code = result.getText()
              setScannedCode(code)
              setScanning(false)
              setLoading(true)

              codeReader.reset()
              
              const productData = await getProductByBarcode(code)
              
              if (productData.status === 1 && productData.product) {
                setProductInfo(productData.product)
              } else {
                setProductInfo(null)
              }
              
              setLoading(false)
            }
          }
        )
      } catch (err) {
        console.error(err)
        setError('Erreur caméra : ' + (err as Error).message)
      }
    }

    if (scanning) {
      startScan()
    }

    return () => {
      active = false
      codeReader.reset()
    }
  }, [scanning])

  const handleUseProduct = () => {
    if (!productInfo) {
      navigate('/add', { state: { barcode: scannedCode } })
      return
    }

    const category = mapToAppCategory(productInfo.categories, productInfo.categories_tags)
    const expirationDays = suggestExpirationDays(category)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expirationDays)

    navigate('/add', {
      state: {
        barcode: scannedCode,
        name: formatProductName(productInfo),
        category,
        expiresAt: expiresAt.toISOString().split('T')[0],
        location: 'Frigo',
        imageUrl: productInfo.image_url
      }
    })
  }

  const handleRescan = () => {
    setScannedCode('')
    setProductInfo(null)
    setError('')
    setScanning(true)
  }

  if (error) {
    return (
      <>
        <Header />
        <main style={{ padding: 12, textAlign: 'center' }}>
          <div style={{ marginTop: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <p style={{ color: '#dc2626', marginBottom: 16 }}>{error}</p>
            <button
              onClick={() => navigate('/add')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                cursor: 'pointer'
              }}
            >
              Ajouter manuellement
            </button>
          </div>
        </main>
      </>
    )
  }

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ padding: 12, textAlign: 'center' }}>
          <div style={{ marginTop: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <p>Recherche du produit...</p>
          </div>
        </main>
      </>
    )
  }

  if (scannedCode && !scanning) {
    return (
      <>
        <Header />
        <main style={{ padding: 12, maxWidth: 600, margin: '0 auto' }}>
          <h1 style={{ marginBottom: 16 }}>✅ Code scanné</h1>
          
          <div style={{ 
            padding: 16, 
            backgroundColor: '#f3f4f6', 
            borderRadius: 12,
            marginBottom: 24
          }}>
            <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>Code-barres</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', fontFamily: 'monospace' }}>
              {scannedCode}
            </div>
          </div>

          {productInfo ? (
            <div style={{
              padding: 16,
              backgroundColor: '#ecfdf5',
              border: '2px solid #6ee7b7',
              borderRadius: 12,
              marginBottom: 24
            }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#059669' }}>
                ✨ Produit trouvé !
              </div>
              
              {productInfo.image_url && (
                <img 
                  src={productInfo.image_url} 
                  alt={productInfo.product_name}
                  style={{ 
                    width: '100%', 
                    maxWidth: 200, 
                    height: 'auto',
                    borderRadius: 8,
                    marginBottom: 12
                  }}
                />
              )}
              
              <div style={{ marginBottom: 8 }}>
                <strong>{formatProductName(productInfo)}</strong>
              </div>
              
              {productInfo.quantity && (
                <div style={{ fontSize: 14, color: '#065f46', marginBottom: 4 }}>
                  📦 {productInfo.quantity}
                </div>
              )}
              
              {productInfo.categories && (
                <div style={{ fontSize: 14, color: '#065f46', marginBottom: 4 }}>
                  🏷️ {productInfo.categories.split(',')[0]}
                </div>
              )}
              
              {productInfo.nutrition_grades && (
                <div style={{ fontSize: 14, color: '#065f46' }}>
                  🥗 Nutri-Score: {productInfo.nutrition_grades.toUpperCase()}
                </div>
              )}
            </div>
          ) : (
            <div style={{
              padding: 16,
              backgroundColor: '#fef2f2',
              border: '2px solid #fca5a5',
              borderRadius: 12,
              marginBottom: 24
            }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#991b1b' }}>
                ℹ️ Produit non trouvé
              </div>
              <div style={{ fontSize: 14, color: '#7f1d1d' }}>
                Ce code-barres n'est pas dans la base Open Food Facts. 
                Vous pourrez saisir les informations manuellement.
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleUseProduct}
              style={{
                flex: 1,
                padding: '14px 24px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {productInfo ? 'Utiliser ces infos' : 'Saisir manuellement'}
            </button>
            
            <button
              onClick={handleRescan}
              style={{
                padding: '14px 24px',
                backgroundColor: 'white',
                color: '#6366f1',
                border: '2px solid #6366f1',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Rescanner
            </button>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main style={{ padding: 12, textAlign: 'center' }}>
        <h1 style={{ marginBottom: 16 }}>📷 Scanner un code-barres</h1>
        <p style={{ marginBottom: 24, color: '#6b7280' }}>
          Pointez la caméra vers le code-barres
        </p>
        
        <div style={{ 
          maxWidth: 500, 
          margin: '0 auto',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <video
            ref={videoRef}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        <div style={{ marginTop: 24 }}>
          <button
            onClick={() => navigate('/add')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'white',
              color: '#6366f1',
              border: '2px solid #6366f1',
              borderRadius: 8,
              fontSize: 16,
              cursor: 'pointer'
            }}
          >
            Ajouter manuellement
          </button>
        </div>
      </main>
    </>
  )
}
