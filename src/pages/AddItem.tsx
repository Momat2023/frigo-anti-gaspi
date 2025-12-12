import { useMemo, useState } from 'react'
import Header from '../ui/Header'
import { addItem, newId } from '../data/db'
import type { Category, Item, Location } from '../data/types'
import { CATEGORY_LABEL, DEFAULT_DAYS } from '../data/presets'

export default function AddItem() {
  const [name, setName] = useState('')
  const [location, setLocation] = useState<Location>('fridge')
  const [category, setCategory] = useState<Category>('cooked_dish')
  const [targetDays, setTargetDays] = useState<number>(DEFAULT_DAYS.cooked_dish)

  // Quand la catégorie change, on propose une durée par défaut
  useMemo(() => {
    setTargetDays(DEFAULT_DAYS[category])
  }, [category])

  async function quickAdd(preset: { name: string; category: Category }) {
    const item: Item = {
      id: newId(),
      name: (name.trim() || preset.name).trim(),
      category: preset.category,
      location,
      openedAt: Date.now(),
      targetDays: DEFAULT_DAYS[preset.category],
      status: 'active',
      createdAt: Date.now(),
    }
    await addItem(item)
    setName('')
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
    }
    await addItem(item)
    setName('')
    alert('Ajouté !')
  }

  return (
    <>
      <Header />
      <main style={{ padding: 12, display: 'grid', gap: 12 }}>
        <h1>Ajouter (rapide)</h1>

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
          <strong>Ajout en 1 tap</strong>
          <button onClick={() => quickAdd({ name: 'Plat cuisiné', category: 'cooked_dish' })}>
            Restes / plat cuisiné
          </button>
          <button onClick={() => quickAdd({ name: 'Soupe', category: 'soup' })}>Soupe</button>
          <button onClick={() => quickAdd({ name: 'Poisson/volaille cuits', category: 'cooked_fish_poultry' })}>
            Poisson / volaille cuits
          </button>
          <button onClick={() => quickAdd({ name: 'Sauce viande', category: 'meat_sauce' })}>
            Sauce / bouillon viande
          </button>
        </div>

        <hr />

        <h2>Ajout détaillé</h2>

        <label>
          Catégorie
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
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

        <p style={{ fontSize: 12, opacity: 0.75 }}>
          Les durées proposées sont des repères; toujours vérifier l’odeur/aspect et respecter la chaîne du froid. [web:217]
        </p>
      </main>
    </>
  )
}

