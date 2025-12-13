import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '../ui/Header'
import { addItem, getSettings, newId } from '../data/db'
import type { Category, Item, Location } from '../data/types'
import { CATEGORY_LABEL, DEFAULT_DAYS } from '../data/presets'

type DaysMap = Record<Category, number>

export default function AddItem() {
  const [searchParams] = useSearchParams()

  const [name, setName] = useState('')
  const [barcode, setBarcode] = useState('')

  const [location, setLocation] = useState<Location>('fridge')
  const [category, setCategory] = useState<Category>('cooked_dish')

  const [defaultDays, setDefaultDays] = useState<DaysMap>(DEFAULT_DAYS)
  const [targetDays, setTargetDays] = useState<number>(DEFAULT_DAYS.cooked_dish)

  // Pré-remplir depuis l'URL (?barcode=...)
  useEffect(() => {
    const b = searchParams.get('barcode') ?? ''
    if (b) setBarcode(b)
  }, [searchParams])

  // Charger settings au montage
  useEffect(() => {
    getSettings().then((s) => {
      setDefaultDays(s.defaultDaysByCategory)
      setTargetDays(s.defaultDaysByCategory[category])
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Quand catégorie change -> proposer la durée par défaut
  useEffect(() => {
    setTargetDays(defaultDays[category])
  }, [category, defaultDays])

  const categories = useMemo(() => Object.keys(CATEGORY_LABEL) as Category[], [])

  async function quickAdd(preset: { name: string; category: Category }) {
    const item: Item = {
      id: newId(),
      name: (name.trim() || preset.name).trim(),
      category: preset.category,
      location,
      openedAt: Date.now(),
      targetDays: defaultDays[preset.category],
      status: 'active',
      createdAt: Date.now(),
      ...(barcode.trim() ? { barcode: barcode.trim() } : {}),
    }
    await addItem(item)
    setName('')
    setBarcode('')
    alert('Ajouté !')
  }

  async function onSave() {
    const item: Item = {
      id: newId(),
      name: (name.trim() || 'Sans nom').trim(),
      category,
      location,
      openedAt: Date.now(),
      targetDays,
      status: 'active',
      createdAt: Date.now(),
      ...(barcode.trim() ? { barcode: barcode.trim() } : {}),
    }
    await addItem(item)
    setName('')
    setBarcode('')
    alert('Ajouté !')
  }

  return (
    <>
      <Header />
      <main style={{ padding: 12, display: 'grid', gap: 12 }}>
        <h1>Ajouter</h1>

        <label>
          Code-barres (optionnel)
          <input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="EAN-13 / QR raw value"
          />
        </label>

        <label>
          Nom (optionnel)
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Restes pâtes"
          />
        </label>

        <label>
          Emplacement
          <select value={location} onChange={(e) => setLocation(e.target.value as Location)}>
            <option value="fridge">Frigo</option>
            <option value="freezer">Congélateur</option>
          </select>
        </label>

        <div style={{ display: 'grid', gap: 8 }}>
          <strong>Ajout rapide</strong>
          <button onClick={() => quickAdd({ name: 'Plat cuisiné', category: 'cooked_dish' })}>
            Restes / plat cuisiné (J+{defaultDays.cooked_dish})
          </button>
          <button onClick={() => quickAdd({ name: 'Soupe', category: 'soup' })}>
            Soupe (J+{defaultDays.soup})
          </button>
          <button onClick={() => quickAdd({ name: 'Poisson/volaille cuits', category: 'cooked_fish_poultry' })}>
            Poisson / volaille cuits (J+{defaultDays.cooked_fish_poultry})
          </button>
          <button onClick={() => quickAdd({ name: 'Sauce viande', category: 'meat_sauce' })}>
            Sauce / bouillon viande (J+{defaultDays.meat_sauce})
          </button>
        </div>

        <hr />

        <h2>Ajout détaillé</h2>

        <label>
          Catégorie
          <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABEL[cat]}
              </option>
            ))}
          </select>
        </label>

        <label>
          Rappel (jours)
          <input
            type="number"
            min={1}
            max={30}
            value={targetDays}
            onChange={(e) => setTargetDays(Number(e.target.value))}
          />
        </label>

        <button onClick={onSave}>Enregistrer</button>
      </main>
    </>
  )
}
