import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../ui/Header'
import { listActiveItems, setStatus } from '../data/db'
import type { Item } from '../data/types'

function daysLeft(item: Item) {
  const msTarget = item.openedAt + item.targetDays * 24 * 60 * 60 * 1000
  return Math.ceil((msTarget - Date.now()) / (24 * 60 * 60 * 1000))
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([])
  const navigate = useNavigate()

  async function refresh() {
    const data = await listActiveItems()
    setItems(data)
  }

  useEffect(() => {
    refresh()
  }, [])

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => daysLeft(a) - daysLeft(b))
  }, [items])

  async function mark(id: string, status: 'eaten' | 'thrown') {
    await setStatus(id, status)
    await refresh()
  }

  return (
    <>
      <Header />
      <main style={{ padding: 12 }}>
        <h1>À consommer d’abord</h1>

        {sorted.length === 0 ? (
          <p>Aucun aliment actif. Ajoute-en via “Ajouter”.</p>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {sorted.map((it) => {
              const left = daysLeft(it)
              return (
                <li key={it.id} style={{ marginBottom: 12 }}>
                  <div
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/item/${it.id}`)}
                  >
                    <strong>{it.name}</strong> — {left <= 0 ? 'à faire aujourd’hui' : `${left} jour(s)`}
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <button onClick={() => mark(it.id, 'eaten')}>Consommé</button>
                    <button onClick={() => mark(it.id, 'thrown')}>Jeté</button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </>
  )
}

