import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDb, deleteItem } from '../data/db'
import Header from '../ui/Header'
import type { Item, Location, Category } from '../data/types'

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [item, setItem] = useState<Item | null>(null)
  const [editing, setEditing] = useState(false)

  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('Autre')
  const [location, setLocation] = useState<Location>('Frigo')
  const [targetDays, setTargetDays] = useState(7)

  useEffect(() => {
    load()
  }, [id])

  async function load() {
    if (!id) return
    const db = await getDb()
    const all = await db.getAll('items')
    const it = all.find(x => x.id === Number(id))
    if (!it) return
    setItem(it)
    setName(it.name)
    setCategory(it.category)
    setLocation(it.location)
    setTargetDays(it.targetDays)
  }

  async function handleSave() {
    if (!item) return
    const db = await getDb()
    await db.put('items', {
      ...item,
      name,
      category,
      location,
      targetDays,
    })
    setEditing(false)
    load()
  }

  async function handleDelete() {
    if (!item) return
    if (!confirm('Supprimer cet aliment ?')) return
    await deleteItem(item.id)
    navigate('/home')
  }

  if (!item) {
    return (
      <>
        <Header />
        <main style={{ padding: 12 }}>Chargement...</main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main style={{ padding: 12, maxWidth: 600, margin: '0 auto' }}>
        {editing ? (
          <>
            <h1 style={{ marginBottom: 24 }}>✏️ Modifier</h1>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Nom</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
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
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Catégorie</label>
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
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Emplacement</label>
              <select
                value={location}
                onChange={e => setLocation(e.target.value as Location)}
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
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                Jours de conservation
              </label>
              <input
                type="number"
                value={targetDays}
                onChange={e => setTargetDays(Number(e.target.value))}
                min={1}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 16
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleSave}
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
                Enregistrer
              </button>
              <button
                onClick={() => setEditing(false)}
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
          </>
        ) : (
          <>
            <h1 style={{ marginBottom: 24 }}>{item.name}</h1>
            
            {item.imageUrl && (
              <div style={{ marginBottom: 16, textAlign: 'center' }}>
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  style={{ 
                    maxWidth: 200, 
                    height: 'auto',
                    borderRadius: 8
                  }}
                />
              </div>
            )}
            
            <div style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 12 }}>
                <strong>Catégorie:</strong> {item.category}
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>Emplacement:</strong> {item.location}
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>Ajouté le:</strong> {new Date(item.createdAt).toLocaleDateString()}
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>Conservation:</strong> {item.targetDays} jours
              </div>
              {item.barcode && (
                <div style={{ marginBottom: 12 }}>
                  <strong>Code-barres:</strong> {item.barcode}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={() => setEditing(true)}
                style={{
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
                Modifier
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '14px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Supprimer
              </button>
            </div>
          </>
        )}
      </main>
    </>
  )
}
