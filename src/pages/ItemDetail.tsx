import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDb } from '../data/db'
import type { Item } from '../data/types'
import Header from '../ui/Header'

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState<Item | null>(null)

  useEffect(() => {
    load()
  }, [id])

  async function load() {
    const db = await getDb()
    const found = await db.get('items', Number(id))
    setItem(found || null)
  }

  async function handleDelete() {
    if (!confirm('Supprimer cet aliment ?')) return
    const db = await getDb()
    await db.delete('items', Number(id))
    navigate('/home')
  }

  if (!item) return <div>Chargement...</div>

  const daysLeft = Math.ceil((item.expiresAt - Date.now()) / (24 * 60 * 60 * 1000))

  return (
    <>
      <Header />
      <main style={{ padding: 12, maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 24 }}>{item.name}</h1>

        {item.imageUrl && (
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <img 
              src={item.imageUrl}
              alt={item.name}
              style={{
                maxWidth: 200,
                height: 'auto',
                borderRadius: 12,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        )}

        <div style={{ 
          padding: 16,
          backgroundColor: '#f9fafb',
          borderRadius: 12,
          marginBottom: 16
        }}>
          <div style={{ marginBottom: 12 }}>
            <strong>Catégorie:</strong> {item.category}
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong>Emplacement:</strong> {item.location}
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong>Statut:</strong> {
              item.status === 'active' ? '✅ Actif' :
              item.status === 'eaten' ? '✅ Consommé' :
              '🗑️ Jeté'
            }
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong>Expire le:</strong> {new Date(item.expiresAt).toLocaleDateString()}
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong>Jours restants:</strong> {' '}
            <span style={{ 
              color: daysLeft < 0 ? '#dc2626' : daysLeft <= 2 ? '#f59e0b' : '#16a34a',
              fontWeight: 600
            }}>
              {daysLeft < 0 ? 'Périmé' : `${daysLeft} jour(s)`}
            </span>
          </div>
          {item.barcode && (
            <div>
              <strong>Code-barres:</strong> {item.barcode}
            </div>
          )}
        </div>

        <button
          onClick={handleDelete}
          style={{
            width: '100%',
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
          🗑️ Supprimer
        </button>
      </main>
    </>
  )
}
