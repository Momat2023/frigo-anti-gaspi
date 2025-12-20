import { useState } from 'react'
import QrScanner from 'react-qr-barcode-scanner'
import { useNavigate } from 'react-router-dom'

export default function Scan() {
  const [data, setData] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleDetected = (code: string) => {
    setData(code)
    setError(null)
    navigate('/add', { state: { barcode: code } })
  }

  return (
    <main style={{ padding: '16px' }}>
      <h1>Scanner un code-barres</h1>

      <div style={{ marginTop: '16px', width: '100%' }}>
        <QrScanner
          delay={300}
          onError={(err: string | DOMException) => {
            console.error(err)
            setError('Erreur accès caméra ou scan impossible')
          }}
          onUpdate={(_err: unknown, result: any) => {
            if (result?.text) {
              handleDetected(result.text as string)
            }
          }}
        />
      </div>

      {data && (
        <p style={{ marginTop: '16px' }}>
          Dernier code détecté : <strong>{data}</strong>
        </p>
      )}

      {error && (
        <p style={{ marginTop: '16px', color: 'red' }}>
          {error}
        </p>
      )}

      <p style={{ marginTop: '16px', fontSize: '0.9rem', opacity: 0.8 }}>
        Pointe ton téléphone vers le code-barres ou QR code. Assure-toi d&apos;avoir autorisé l&apos;accès à la caméra.
      </p>
    </main>
  )
}
