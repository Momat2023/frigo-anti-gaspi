import { useEffect, useState } from 'react'
import { getDb } from '../data/db'
import type { Item } from '../data/types'
import Header from '../ui/Header'
import BadgeToast from '../ui/BadgeToast'
import MotivationWidget from '../ui/MotivationWidget'
import { useBadgeNotification } from '../hooks/useBadgeNotification'
import { Link, useNavigate } from 'react-router-dom'
import { trackEvent } from '../services/analytics'

function getUrgencyClass(item: Item) {
  const msTarget = item.openedAt + item.targetDays * 24 * 60 * 60 * 1000
  const now = Date.now()
  const diff = msTarget - now
  const daysLeft = Math.ceil(diff / (24 * 60 * 60 * 1000))

  if (daysLeft < 0) return { class: 'expired', label: 'Périmé' }
  if (daysLeft === 0) return { class: 'today', label: 'Aujourd\'hui !' }
  if (daysLeft <= 2) return { class: 'urgent', label: `${daysLeft}j` }
  return { class: 'ok', label: `${daysLeft}j` }
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([])
  const { newBadge, dismissBadge, checkForNewBadges } = useBadgeNotification()
  const [refreshWidget, setRefreshWidget] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    load()
    trackEvent('page_view', { page: 'home' })
  }, [])

  async function load() {
    const db = await getDb()
    const all = await db.getAll('items')
    const active = all.filter(x => x.status === 'active')
    active.sort((a, b) => {
      const msA = a.openedAt + a.targetDays * 24 * 60 * 60 * 1000
      const msB = b.openedAt + b.targetDays * 24 * 60 * 60 * 1000
      return msA - msB
    })
    setItems(active)
  }

  async function mark(id: number, status: 'eaten' | 'thrown') {
    const db = await getDb()
    const all = await db.getAll('items')
    const item = all.find(x => x.id === id)
    if (!item) return
    
    await db.put('items', { ...item, status })
    await load()
    
    // Track event
    trackEvent('item_marked', { 
      status, 
      category: item.category,
      daysBeforeExpiry: Math.ceil((item.openedAt + item.targetDays * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000))
    })
    
    await checkForNewBadges()
    setRefreshWidget(prev => prev + 1)
  }

  function handleCookSuggestions() {
    const topUrgent = items.slice(0, 3)
    const ingredients = topUrgent.map(item => item.name)
    
    trackEvent('cook_suggestions_clicked', { itemCount: topUrgent.length })
    navigate('/recipes', { state: { ingredients } })
  }

  const urgent = items.filter(it => {
    const msTarget = it.openedAt + it.targetDays * 24 * 60 * 60 * 1000
    const daysLeft = Math.ceil((msTarget - Date.now()) / (24 * 60 * 60 * 1000))
    return daysLeft <= 2
  })

  const normal = items.filter(it => {
    const msTarget = it.openedAt + it.targetDays * 24 * 60 * 60 * 1000
    const daysLeft = Math.ceil((msTarget - Date.now()) / (24 * 60 * 60 * 1000))
    return daysLeft > 2
  })

  return (
    <>
      <Header />
      <BadgeToast badge={newBadge} onClose={dismissBadge} />
      
      <main style={{ padding: 12 }}>
        <h1 style={{ marginBottom: 16 }}>🏠 Mon Frigo</h1>

        <MotivationWidget key={refreshWidget} />

        {items.length > 0 && (
          <button
            onClick={handleCookSuggestions}
            style={{
              width: '100%',
              padding: '16px',
              marginBottom: 24,
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            🍳 Que cuisiner avec mes aliments urgents ?
          </button>
        )}

        <div style={{ marginBottom: 16, fontSize: 14, color: '#6b7280' }}>
          {items.length === 0 ? (
            <p>Aucun aliment. <Link to="/add">Ajouter un aliment</Link></p>
          ) : (
            <p>{items.length} aliment(s) actif(s)</p>
          )}
        </div>

        {urgent.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, marginBottom: 12, color: '#dc2626' }}>
              ⚠️ Urgent ({urgent.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {urgent.map(it => {
                const u = getUrgencyClass(it)
                return (
                  <div
                    key={it.id}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      backgroundColor: '#fee',
                      border: '2px solid #fca5a5',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <Link
                        to={`/item/${it.id}`}
                        style={{ 
                          fontSize: 16, 
                          fontWeight: 600,
                          textDecoration: 'none',
                          color: '#111'
                        }}
                      >
                        {it.name}
                      </Link>
                      <div style={{ fontSize: 12, color: '#7f1d1d', marginTop: 4 }}>
                        {it.category} · {it.location}
                      </div>
                      <div style={{ 
                        fontSize: 13, 
                        fontWeight: 600, 
                        color: '#dc2626',
                        marginTop: 4
                      }}>
                        {u.label}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => mark(it.id, 'eaten')}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#16a34a',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        ✅ Mangé
                      </button>
                      <button
                        onClick={() => mark(it.id, 'thrown')}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Jeté
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {normal.length > 0 && (
          <section>
            <h2 style={{ fontSize: 18, marginBottom: 12 }}>
              📦 Autres aliments ({normal.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {normal.map(it => {
                const u = getUrgencyClass(it)
                return (
                  <div
                    key={it.id}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <Link
                        to={`/item/${it.id}`}
                        style={{ 
                          fontSize: 16, 
                          fontWeight: 600,
                          textDecoration: 'none',
                          color: '#111'
                        }}
                      >
                        {it.name}
                      </Link>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                        {it.category} · {it.location}
                      </div>
                      <div style={{ 
                        fontSize: 13, 
                        color: '#059669',
                        marginTop: 4
                      }}>
                        {u.label}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => mark(it.id, 'eaten')}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#16a34a',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        ✅
                      </button>
                      <button
                        onClick={() => mark(it.id, 'thrown')}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </main>
    </>
  )
}
