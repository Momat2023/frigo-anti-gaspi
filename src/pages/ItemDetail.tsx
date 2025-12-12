import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../ui/Header'
import { deleteItem, getItem, setStatus, updateItem } from '../data/db'
import type { Item, Location } from '../data/types'
import { buildEatReminderIcs, downloadTextFile } from '../utils/ics'

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Guard ID (et on crée une constante string)
  if (!id) {
    return (
      <>
        <Header />
        <main style={{ padding: 12 }}>ID manquant</main>
      </>
    )
  }
  const itemId: string = id

  const [item, setItem] = useState<Item | null>(null)

  // Champs éditables
  const [name, setName] = useState('')
  const [targetDays, setTargetDays] = useState(3)
  const [location, setLocation] = useState<Location>('fridge')

  // Jour 6: rappel calendrier
  const [remindInDays, setRemindInDays] = useState(0)

  useEffect(() => {
    getItem(itemId).then((it) => {
      if (!it) return
      setItem(it)
      setName(it.name)
      setTargetDays(it.targetDays)
      setLocation(it.location)
      setRemindInDays(it.targetDays)
    })
  }, [itemId])

  if (!item) {
    return (
      <>
        <Header />
        <main style={{ padding: 12 }}>Chargement…</main>
      </>
    )
  }

  // Constante locale non-null (évite les problèmes de narrowing dans closures)
  const it: Item = item

  const remindAtText = useMemo(() => {
    const ms = it.openedAt + remindInDays * 24 * 60 * 60 * 1000
    return new Date(ms).toLocaleString()
  }, [it.openedAt, remindInDays])

  async function onSave() {
    const updated: Item = {
      ...it,
      name: name.trim() || it.name,
      targetDays,
      location,
    }
    await updateItem(updated)
    navigate('/')
  }

  async function onMark(status: 'eaten' | 'thrown') {
    await setStatus(itemId, status)
    navigate('/')
  }

  async function onDelete() {
    await deleteItem(itemId)
    navigate('/')
  }

  function onAddToCalendar() {
    const remindAt = new Date(it.openedAt + remindInDays * 24 * 60 * 60 * 1000)
    const startUtc = remindAt
    const endUtc = new Date(remindAt.getTime() + 60 * 1000)

    const ics = buildEatReminderIcs({
      title: `Manger: ${it.name}`,
      description: `Rappel Frigo Anti-Gaspi. Aliment ajouté le ${new Date(it.openedAt).toLocaleString()}.`,
      uid: `${it.id}@frigo-antigaspi.local`,
      startUtc,
      endUtc,
    })

    const safeName = it.name.trim() ? it.name.trim() : 'aliment'
    downloadTextFile(`rappel-${safeName.replace(/\s+/g, '-').toLowerCase()}.ics`, ics)
  }

  return (
    <>
      <Header />
      <main style={{ padding: 12, display: 'grid', gap: 12 }}>
        <h1>Détail</h1>

        <label>
          Nom
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label>
          Emplacement
          <select value={location} onChange={(e) => setLocation(e.target.value as Location)}>
            <option value="fridge">Frigo</option>
            <option value="freezer">Congélateur</option>
          </select>
        </label>

        <label>
          Rappel (jours) — pour le tri “à consommer d’abord”
          <input
            type="number"
            min={1}
            max={30}
            value={targetDays}
            onChange={(e) => setTargetDays(Number(e.target.value))}
          />
        </label>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onSave}>Enregistrer</button>
          <button onClick={() => onMark('eaten')}>Consommé</button>
          <button onClick={() => onMark('thrown')}>Jeté</button>
        </div>

        <hr />

        <h2>Rappel calendrier</h2>

        <label>
          Ajouter au calendrier dans (jours)
          <input
            type="number"
            min={0}
            max={30}
            value={remindInDays}
            onChange={(e) => setRemindInDays(Number(e.target.value))}
          />
        </label>

        <div style={{ fontSize: 12, opacity: 0.75 }}>
          Le rappel sera le : {remindAtText}
        </div>

        <button onClick={onAddToCalendar}>Ajouter au calendrier (.ics)</button>

        <hr />

        <button onClick={onDelete}>Supprimer</button>
      </main>
    </>
  )
}

