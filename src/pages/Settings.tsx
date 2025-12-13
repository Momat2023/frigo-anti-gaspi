import { useEffect, useMemo, useState } from 'react'
import Header from '../ui/Header'
import { getSettings, saveSettings } from '../data/db'
import { CATEGORY_LABEL, DEFAULT_DAYS } from '../data/presets'
import type { Category } from '../data/types'
import { clampInt } from '../utils/number'
import { exportDataV1 } from '../data/export'
import { downloadJsonFile } from '../utils/download'

type DaysMap = Record<Category, number>

export default function Settings() {
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState<DaysMap>(DEFAULT_DAYS)

  const categories = useMemo(() => Object.keys(CATEGORY_LABEL) as Category[], [])

  useEffect(() => {
    getSettings()
      .then((s) => {
        setDays(s.defaultDaysByCategory)
      })
      .finally(() => setLoading(false))
  }, [])

  function setDay(cat: Category, value: number) {
    setDays((prev) => ({ ...prev, [cat]: value }))
  }

  async function onSave() {
    await saveSettings({
      defaultDaysByCategory: days,
    })
    alert('Réglages enregistrés')
  }

  function onReset() {
    setDays(DEFAULT_DAYS)
  }

  async function onExportDownload() {
    const data = await exportDataV1()
    const yyyyMmDd = new Date().toISOString().slice(0, 10)
    downloadJsonFile(`frigo-export-${yyyyMmDd}.json`, data)
  }

  async function onExportShare() {
    const data = await exportDataV1()
    const yyyyMmDd = new Date().toISOString().slice(0, 10)
    const filename = `frigo-export-${yyyyMmDd}.json`
    const json = JSON.stringify(data, null, 2)

    // Partage fichier (progressive enhancement) [web:752][web:761]
    const file = new File([json], filename, { type: 'application/json' })
    const shareData: any = {
      title: 'Export Frigo Anti-Gaspi',
      text: 'Voici l’export JSON (items + réglages).',
      files: [file],
    }

    if (navigator.canShare && navigator.canShare(shareData) && navigator.share) {
      await navigator.share(shareData)
    } else {
      // fallback: téléchargement
      downloadJsonFile(filename, data)
      alert("Partage non disponible: fichier téléchargé à la place.")
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ padding: 12 }}>Chargement…</main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main style={{ padding: 12, display: 'grid', gap: 12 }}>
        <h1>Réglages</h1>

        <p style={{ fontSize: 12, opacity: 0.75 }}>
          Ces durées sont des valeurs par défaut pour les nouveaux aliments. Tu peux toujours les changer pour un aliment précis.
        </p>

        {categories.map((cat) => (
          <label key={cat} style={{ display: 'grid', gap: 6 }}>
            {CATEGORY_LABEL[cat]}
            <input
              type="number"
              min={1}
              max={30}
              value={days[cat]}
              onChange={(e) => {
                const n = Number(e.target.value)
                setDay(cat, clampInt(n, 1, 30))
              }}
            />
          </label>
        ))}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={onSave}>Enregistrer</button>
          <button onClick={onReset}>Réinitialiser</button>
        </div>

        <hr />

        <h2>Foyer (export/import)</h2>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={onExportDownload}>Exporter (télécharger)</button>
          <button onClick={onExportShare}>Exporter (partager)</button>
        </div>

        <p style={{ fontSize: 12, opacity: 0.75 }}>
          L’import sera ajouté au Jour 13.
        </p>
      </main>
    </>
  )
}
