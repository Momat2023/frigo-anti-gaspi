import { getDb, saveSettings } from './db'
import type { Item, Settings } from './types'
import { setScanHistory } from './scanHistory'

export type ImportMode = 'merge' | 'replace'

export type ImportResult = {
  itemsProcessed: number
  itemsWritten: number
  settingsImported: boolean
  scanHistoryImported: boolean
}

type ExportBlobV1 = {
  schemaVersion: 1
  exportedAt: number
  deviceId?: string
  items: Item[]
  settings?: Settings
  scanHistory?: string[]
}

function parseExport(text: string): ExportBlobV1 {
  let data: any
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Fichier JSON invalide (parse).')
  }

  if (!data || data.schemaVersion !== 1) throw new Error('Schéma non supporté (schemaVersion).')
  if (!Array.isArray(data.items)) throw new Error('Export invalide: items manquant ou incorrect.')
  return data as ExportBlobV1
}

export async function importDataFromText(text: string, mode: ImportMode): Promise<ImportResult> {
  const data = parseExport(text)
  const db = await getDb()

  const tx = db.transaction('items', 'readwrite')
  const store = tx.objectStore('items')

  if (mode === 'replace') await store.clear()

  let written = 0
  for (const item of data.items) {
    await store.put(item)
    written++
  }
  await tx.done

  let settingsImported = false
  if (data.settings) {
    await saveSettings(data.settings)
    settingsImported = true
  }

  let scanHistoryImported = false
  if (Array.isArray(data.scanHistory)) {
    setScanHistory(data.scanHistory)
    scanHistoryImported = true
  }

  return { itemsProcessed: data.items.length, itemsWritten: written, settingsImported, scanHistoryImported }
}
