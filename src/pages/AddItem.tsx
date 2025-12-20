import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { addItem } from '../data/db'
import { addXP } from '../data/xp'
import Header from '../ui/Header'
import { scheduleNotification, areNotificationsEnabled } from '../services/notifications'
import { trackEvent } from '../services/analytics'
import type { Category, Location } from '../data/types'

export default function AddItem() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as {
    name?: string
    category?: Category
    barcode?: string
    imageUrl?: string
  } | null

  const [name, setName] = useState(state?.name || '')
  const [category, setCategory] = useState<Category>(state?.category || 'Autre')
  const [openedAt, setOpenedAt] = useState(new Date().toISOString().split('T')[0])
  const [expiresAt, setExpiresAt] = useState('')
  const [itemLocation, setItemLocation] = useState<Location>('Frigo')
  const [barcode] = useState(state?.barcode || '')
  const [imageUrl] = useState(state?.imageUrl || '')

  // Durées conseillées par catégorie (jours après ouverture)
  const defaultDurations: Record<Category, number> = {
    'Fruits & Légumes': 5,
    'Viandes & Poissons': 3,
    'Produits laitiers': 4,
    'Boissons': 30,
    'Conserves': 30,
    'Surgelés': 60,
    'Autre': 7
  }

  useEffect(() => {
    trackEvent('page_view', { page: 'add_item' })
    
    if (state?.barcode && !name) {
      setName(`Produit scanné (${state.barcode})`)
    }
    
    calculateDefaultExpiry()
  }, [])

  useEffect(() => {
    calculateDefaultExpiry()
  }, [category, openedAt])

  const calculateDefaultExpiry = () => {
    if (!expiresAt) {
      const days = defaultDurations[category] || 7
      const opened = new Date(openedAt)
      const expires = new Date(opened.getTime() + days * 24 * 60 * 60 * 1000)
      setExpiresAt(expires.toISOString().split('T')[0])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    const expiresAtMs = new Date(expiresAt).getTime()
    const openedAtMs = new Date(openedAt).getTime()
    
    const newItem = await addItem({
      name: name.trim(),
      category,
      openedAt: openedAtMs,
      expiresAt: expiresAtMs,
      location: itemLocation,
      targetDays: Math.ceil((expiresAtMs - openedAtMs) / (24 * 60 * 60 * 1000)),
      status: 'active',
      barcode: barcode || undefined,
      imageUrl: imageUrl || undefined
    })

    await addXP('ITEM_ADDED', { name: name.trim(), category })

    trackEvent('item_added', {
      method: barcode ? 'scan' : 'manual',
      category,
      daysFromOpen: Math.ceil((expiresAtMs - openedAtMs) / (24 * 60 * 60 * 1000))
    })

    if (areNotificationsEnabled()) {
      const notifDaysBefore = parseInt(localStorage.getItem('notification-days-before') || '1')
      scheduleNotification(newItem.id as number, newItem.name, expiresAtMs, notifDaysBefore)
    }

    navigate('/')
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
            marginBottom: 16
          }}>
            <strong>📱 Code scanné :</strong> {barcode}
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
              placeholder="Ex: Lait ouvert hier"
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
              📅 Date d'ouverture *
            </label>
            <input
              type="date"
              value={openedAt}
              onChange={e => setOpenedAt(e.target.value)}
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
              Durée conseillée : <strong>{defaultDurations[category] || 7} jours</strong>
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
              onClick={() => navigate('/')}
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
