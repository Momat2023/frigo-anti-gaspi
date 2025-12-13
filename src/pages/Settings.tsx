import { useEffect, useMemo, useRef, useState } from 'react'
import Header from '../ui/Header'
import { getSettings, saveSettings } from '../data/db'
import { CATEGORY_LABEL, DEFAULT_DAYS } from '../data/presets'
import type { Category } from '../data/types'
import { clampInt } from '../utils/number'
import { exportDataV1, exportPreview } from '../data/export'
import { downloadJsonFile } from '../utils/download'
import { exportFilename } from '../utils/filename'
import { importDataFromText, previewImportFromText, type ImportMode, type ImportPreview } from '../data/import'
import { readFileAsText } from '../utils/file'
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  showExpiryTestNotification,
} from '../notifications/expiry'
import { runExpiryAutoCheck } from '../notifications/autoCheck'
import PwaPanel from '../ui/PwaPanel'
import { factoryResetThisDevice } from '../utils/factoryReset'
import DiagnosticsPanel from '../ui/DiagnosticsPanel'

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

  // Import
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [importMode, setImportMode] = useState<ImportMode>('merge')
  const [importBusy, setImportBusy] = useState(false)
  const [importText, setImportText] = useState<string | null>(null)
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  // Notifications
  const [notifSupported, setNotifSupported] = useState<'unknown' | 'yes' | 'no'>('unknown')
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported' | 'unknown'>('unknown')

  const categories = useMemo(() => Object.keys(CATEGORY_LABEL) as Category[], [])
  const exportOpts = useMemo(
    () => ({ includeArchived, includeSettings: includeSettingsOpt, includeScanHistory }),
    [includeArchived, includeSettingsOpt, includeScanHistory]
  )

  useEffect(() => {
    getSettings()
      .then((s) => setDays(s.defaultDaysByCategory))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    exportPreview(exportOpts).then(setPreview)
  }, [exportOpts])

  useEffect(() => {
    const supported = isNotificationSupported()
    setNotifSupported(supported ? 'yes' : 'no')
    setNotifPermission(supported ? getNotificationPermission() : 'unsupported')
  }, [])

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
    const data = await exportDataV1(exportOpts)
    downloadJsonFile(exportFilename(), data)
  }

  async function onExportShare() {
    const data = await exportDataV1(exportOpts)
    const filename = exportFilename()
    const json = JSON.stringify(data, null, 2)

    const file = new File([json], filename, { type: 'application/json' })
    const shareData: any = { title: 'Export Frigo Anti-Gaspi', text: 'Export JSON (foyer).', files: [file] }

    if (navigator.canShare && navigator.canShare(shareData) && navigator.share) {
      await navigator.share(shareData)
    } else {
      downloadJsonFile(filename, data)
      alert("Partage non disponible: export téléchargé à la place.")
    }
  }

  async function onPickImportFile() {
    setImportError(null)
    setImportPreview(null)
    setImportText(null)

    const f = fileRef.current?.files?.[0]
    if (!f) return

    try {
      const text = await readFileAsText(f)
      setImportText(text)
      const p = await previewImportFromText(text)
      setImportPreview(p)
    } catch (e: any) {
      setImportError(e?.message ?? 'Fichier import illisible')
    }
  }

  async function onImport() {
    if (!importText) return alert('Choisis un fichier .json à importer (preview requis).')

    const msg =
      importMode === 'replace'
        ? "Mode 'Remplacer' : tous les items existants seront supprimés puis remplacés."
        : "Mode 'Fusionner' : les items seront ajoutés/mis à jour."
    if (!confirm(`${msg}\n\nContinuer ?`)) return

    setImportBusy(true)
    try {
      if (importMode === 'replace') {
        const backup = await exportDataV1({
          includeArchived: true,
          includeSettings: true,
          includeScanHistory: true,
        })
        downloadJsonFile(exportFilename('frigo-backup-before-replace'), backup)
      }

      const r = await importDataFromText(importText, importMode)
      alert(
        `Import OK.\n` +
          `Items: écrits ${r.itemsWritten} (uniques ${r.uniqueItemsInFile}, source ${r.itemsProcessed})\n` +
          `Doublons ignorés: ${r.duplicatesDropped}\n` +
          `Sans clé ignorés: ${r.missingKeySkipped}\n` +
          `Réglages: ${r.settingsImported ? 'oui' : 'non'}\n` +
          `Scan history: ${r.scanHistoryImported ? 'oui' : 'non'}`
      )

      window.location.reload()
    } catch (e: any) {
      alert(e?.message ?? 'Import impossible')
    } finally {
      setImportBusy(false)
      if (fileRef.current) fileRef.current.value = ''
      setImportText(null)
      setImportPreview(null)
    }
  }

  async function onRequestNotifPermission() {
    const perm = await requestNotificationPermission()
    setNotifPermission(perm)
    if (perm === 'granted') {
      alert('Notifications autorisées pour ce site.')
    } else if (perm === 'denied') {
      alert("Notifications refusées. Tu peux changer ça dans les réglages du navigateur.")
    } else if (perm === 'unsupported') {
      alert('Notifications non supportées sur ce navigateur.')
    }
  }

  async function onTestExpiryNotification() {
    const res = await showExpiryTestNotification()
    if (res === 'unsupported') {
      alert('Notifications non supportées sur ce navigateur.')
    } else if (res === 'denied' || res === 'no-permission') {
      alert("Pas d’autorisation pour envoyer des notifications.")
    } else if (res === 'no-items') {
      alert("Aucun aliment proche de la date pour l’instant.")
    } else if (res === 'shown') {
      // la notif est déjà affichée par le système
    }
  }


  async function onRunAutoCheckNow() {
    const r = await runExpiryAutoCheck(0) // cooldown=0 pour test immédiat
    alert(JSON.stringify(r, null, 2))
  }


  async function onFactoryReset() {
    const ok = confirm(
      "Cette action va:\n" +
      "- Effacer les données locales (IndexedDB, localStorage)\n" +
      "- Vider les caches offline\n" +
      "- Désinstaller les service workers sur cet appareil\n\n" +
      "Les autres appareils ne sont pas impactés.\n\n" +
      "Continuer ?"
    )
    if (!ok) return

    try {
      await factoryResetThisDevice()
      alert("Réinitialisation terminée. L’app va recharger.")
      window.location.reload()
    } catch (e: any) {
      alert(e?.message ?? "Impossible de réinitialiser complètement.")
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

        <PwaPanel />

        <hr />

        <h2>Notifications</h2>

        <p style={{ fontSize: 12, opacity: 0.75 }}>
          Les notifications système nécessitent HTTPS / site installé, et ton accord explicite via le navigateur.
        </p>

        <div style={{ fontSize: 12, opacity: 0.85 }}>
          Support navigateur:{' '}
          {notifSupported === 'unknown' ? '…' : notifSupported === 'yes' ? 'oui' : 'non'}
          <br />
          Permission:{' '}
          {notifPermission === 'unknown'
            ? '…'
            : notifPermission === 'unsupported'
            ? 'non supporté'
            : notifPermission}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={onRequestNotifPermission}>Demander / mettre à jour l’autorisation</button>
          <button onClick={onTestExpiryNotification}>Tester la notif “proche de la date”</button>
          <button onClick={onRunAutoCheckNow}>Run auto-check (debug)</button>
        </div>

        <hr />

        <h2>Foyer (export)</h2>

        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={includeArchived} onChange={(e) => setIncludeArchived(e.target.checked)} />
          Inclure l’historique (archivés)
        </label>

        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={includeSettingsOpt} onChange={(e) => setIncludeSettingsOpt(e.target.checked)} />
          Inclure les réglages
        </label>

        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={includeScanHistory} onChange={(e) => setIncludeScanHistory(e.target.checked)} />
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

        <hr />

        <h2>Foyer (import)</h2>

        <input ref={fileRef} type="file" accept=".json,application/json" onChange={onPickImportFile} />

        {importError && <div style={{ color: 'crimson' }}>Erreur: {importError}</div>}

        {importPreview && (
          <div style={{ fontSize: 12, opacity: 0.85 }}>
            Schema: v{importPreview.schemaVersion}
            <br />
            Exporté: {new Date(importPreview.exportedAt).toLocaleString()}
            <br />
            Items (source): {importPreview.itemsCount}
            <br />
            Doublons dans le fichier: {importPreview.duplicatesInFile}
            <br />
            Items sans clé (ignorés à l’import): {importPreview.missingKeyCount}
            <br />
            KeyPath DB:{' '}
            {Array.isArray(importPreview.keyPath)
              ? importPreview.keyPath.join(',')
              : String(importPreview.keyPath)}
            <br />
            Réglages présents: {importPreview.hasSettings ? 'oui' : 'non'}
            <br />
            Scan history présent: {importPreview.hasScanHistory ? 'oui' : 'non'}
          </div>
        )}

        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="radio" name="importMode" checked={importMode === 'merge'} onChange={() => setImportMode('merge')} />
          Fusionner (recommandé)
        </label>

        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="radio"
            name="importMode"
            checked={importMode === 'replace'}
            onChange={() => setImportMode('replace')}
          />
          Remplacer (dangereux, fait un backup auto)
        </label>

        <button onClick={onImport} disabled={importBusy || !importText}>
          {importBusy ? 'Import…' : 'Importer'}
        </button>
      
        <hr />

        <section style={{ display: 'grid', gap: 8 }}>
          <h2>Debug / Reset</h2>
          <p style={{ fontSize: 12, opacity: 0.75 }}>
            Réinitialise complètement cet appareil : données locales, caches, service workers.
            Utilise-le seulement si l’app semble bloquée ou corrompue sur ce device.
          </p>
          <button onClick={onFactoryReset}>Réinitialiser cet appareil</button>
        </section>


        <hr />

        <DiagnosticsPanel />

</main>
    </>
  )
}
