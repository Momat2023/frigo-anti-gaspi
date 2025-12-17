import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { addItem } from '../data/db'
import Header from '../ui/Header'
import { scheduleNotification, areNotificationsEnabled } from '../services/notifications'
import type { Category, Location } from '../data/types'

export default function AddItem() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as any

  const [name, setName] = useState(state?.name || '')
  const [category, setCategory] = useState<Category>(state?.category || 'Autre')
  const [expiresAt, setExpiresAt] = useState(state?.expiresAt || '')
  const [itemLocation, setItemLocation] = useState<Location>(state?.location || 'Frigo')
  const [barcode] = useState(state?.barcode || '')
  const [imageUrl] = useState(state?.imageUrl || '')

  useEffect(() => {
    if (!expiresAt) {
      const future = new Date()
      future.setDate(future.getDate() + 7)
      setExpiresAt(future.toISOString().split('T')[0])
    }
  }, [expiresAt])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    const expiresAtMs = new Date(expiresAt).getTime()
    
    const newItem = await addItem({
      name: name.trim(),
      category,
      expiresAt: expiresAtMs,
      location: itemLocation,
      targetDays: 7,
      barcode: barcode || undefined,
      imageUrl: imageUrl || undefined
    })

    // Programmer une notification si activées
    if (areNotificationsEnabled()) {
      const notifDaysBefore = parseInt(
        localStorage.getItem('notification-days-before') || '1'
      )
      scheduleNotification(newItem.id, newItem.name, expiresAtMs, notifDaysBefore)
    }

    navigate('/home')
  }

  return (
    <>
      <Header />
      <main style={{ padding: 12, maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 24 }}>➕ Ajouter un aliment</h1>

        {barcode && (
          <div style={{
            padding: 12,
            backgroundColor: '#eff6ff',
            border: '1px solid #93c5fd',
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 14
          }}>
            <strong>Code-barres:</strong> {barcode}
          </div>
        )}

        {imageUrl && (
          <div style={{ marginBottom: 16, textAlign: 'center' }}>
            <img 
              src={imageUrl} 
              alt="Produit"
              style={{ 
                maxWidth: 150, 
                height: 'auto',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Nom *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Yaourt nature"
              required
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '1px solid #d1d5db',
                fontSize: 16
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Catégorie
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as Category)}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '1px solid #d1d5db',
                fontSize: 16
              }}
            >
              <option>Fruits & Légumes</option>
              <option>Viandes & Poissons</option>
              <option>Produits laitiers</option>
              <option>Boissons</option>
              <option>Conserves</option>
              <option>Surgelés</option>
              <option>Autre</option>
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Date de péremption *
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              required
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '1px solid #d1d5db',
                fontSize: 16
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Emplacement
            </label>
            <select
              value={itemLocation}
              onChange={e => setItemLocation(e.target.value as Location)}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '1px solid #d1d5db',
                fontSize: 16
              }}
            >
              <option>Frigo</option>
              <option>Congélateur</option>
              <option>Placard</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Ajouter
            </button>
            
            <button
              type="button"
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
        </form>
      </main>
    </>
  )
}
