import { useEffect, useMemo, useState } from 'react'
import Header from '../ui/Header'
import { getSettings, saveSettings } from '../data/db'
import { CATEGORY_LABEL, DEFAULT_DAYS } from '../data/presets'
import type { Category } from '../data/types'
import { clampInt } from '../utils/number'
import { exportDataV1, exportPreview } from '../data/export'
import { downloadJsonFile } from '../utils/download'
import { exportFilename } from '../utils/filename'

type DaysMap = Record<Category, number>

export default function Settings() {
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState<DaysMap>(DEFAULT_DAYS)

  // Export options
  const [includeArchived, setIncludeArchived] = useState(true)
  const [includeSettingsOpt, setIncludeSettingsOpt] = useState(true)
  const [includeScanHistory, setIncludeScanHistory] = useState(true)

  const [preview, setPreview] = useState<{
    totalItems: number
    archivedItems: number
    includedItems: number
    scanHistoryCount: number
    includesSettings: boolean
  } | null>(null)

  const categories = useMemo(() => Object.keys(CATEGORY_LABEL) as Category[], [])

  const opts = useMemo(
    () => ({
      includeArchived,
      includeSettings: includeSettingsOpt,
      includeScanHistory,
    }),
    [includeArchived, includeSettingsOpt, includeScanHistory]
  )

  useEffect(() => {
    getSettings()
      .then((s) => setDays(s.defaultDaysByCategory))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    // preview refresh on option changes
    exportPreview(opts).then(setPreview)
  }, [opts])

  function setDay(cat: Category, value: number) {
    setDays((prev) => ({ ...prev, [cat]: value }))
  }

  async function onSave() {
    await saveSettings({ defaultDaysByCategory: days })
    alert('Réglages enregistrés')
  }

  function onReset() {
    setDays(DEFAULT_DAYS)
  }

  async function onExportDownload() {
    const data = await exportDataV1(opts)
    downloadJsonFile(exportFilename(), data)
  }

  async function onExportShare() {
    const data = await exportDataV1(opts)
    const filename = exportFilename()
    const json = JSON.stringify(data, null, 2)

    const file = new File([json], filename, { type: 'application/json' })
    const shareData: any = {
      title: 'Export Frigo Anti-Gaspi',
      text: "Export JSON (foyer).",
      files: [file],
    }

    if (navigator.canShare && navigator.canShare(shareData) && navigator.share) {
      await navigator.share(shareData)
    } else {
      downloadJsonFile(filename, data)
      alert("Partage non disponible: export téléchargé à la place.")
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
          Ces durées sont des valeurs par défaut pour les nouveaux aliments.
        </p>

        {categories.map((cat) => (
          <label key={cat} style={{ display: 'grid', gap: 6 }}>
            {CATEGORY_LABEL[cat]}
            <input
              type="number"
              min={1}
              max={30}
              value={days[cat]}
              onChange={(e) => setDay(cat, clampInt(Number(e.target.value), 1, 30))}
            />
          </label>
        ))}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={onSave}>Enregistrer</button>
          <button onClick={onReset}>Réinitialiser</button>
        </div>

        <hr />

        <h2>Foyer (export)</h2>

        <div style={{ display: 'grid', gap: 8 }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
            />
            Inclure l’historique (archivés)
          </label>

          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={includeSettingsOpt}
              onChange={(e) => setIncludeSettingsOpt(e.target.checked)}
            />
            Inclure les réglages
          </label>

          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={includeScanHistory}
              onChange={(e) => setIncludeScanHistory(e.target.checked)}
            />
            Inclure l’historique de scan
          </label>

          {preview && (
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              Items: {preview.includedItems} (total {preview.totalItems}, archivés {preview.archivedItems})<br />
              Scan history: {preview.scanHistoryCount}<br />
              Réglages: {preview.includesSettings ? 'oui' : 'non'}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={onExportDownload}>Exporter (télécharger)</button>
            <button onClick={onExportShare}>Exporter (partager)</button>
          </div>
        </div>

        <p style={{ fontSize: 12, opacity: 0.75 }}>
          Import + fusion/remplacement au Jour 13.
        </p>
      </main>
    </>
  )
}
