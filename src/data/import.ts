import { getDb, saveSettings } from './db'
import type { Item, Settings } from './types'
import { setScanHistory } from './scanHistory'

export type ImportMode = 'merge' | 'replace'

export type ImportPreview = {
  schemaVersion: 1
  exportedAt: number
  deviceId?: string
  itemsCount: number
  hasSettings: boolean
  hasScanHistory: boolean
  keyPath: string | string[] | null
  duplicatesInFile: number
  missingKeyCount: number
}

export type ImportResult = {
  itemsProcessed: number
  uniqueItemsInFile: number
  itemsWritten: number
  duplicatesDropped: number
  missingKeySkipped: number
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

function makeKeyOf(keyPath: string | string[] | null) {
  if (typeof keyPath === 'string') {
    return (item: any) => item?.[keyPath] ?? null
  }
  if (Array.isArray(keyPath)) {
    return (item: any) => {
      const parts = keyPath.map((k) => item?.[k])
      if (parts.some((p) => p == null)) return null
      // clé composite sérialisée
      return JSON.stringify(parts)
    }
  }
  return (_item: any) => null
}

async function getItemsKeyPath(): Promise<string | string[] | null> {
  const db = await getDb()
  const tx = db.transaction('items')
  const store = tx.objectStore('items')
  const kp = (store as any).keyPath ?? null
  await (tx as any).done
  return kp
}

export async function previewImportFromText(text: string): Promise<ImportPreview> {
  const data = parseExport(text)
  const keyPath = await getItemsKeyPath()
  const keyOf = makeKeyOf(keyPath)

  const seen = new Set<string>()
  let duplicates = 0
  let missingKey = 0

  for (const item of data.items) {
    const k = keyOf(item)
    if (k == null) {
      missingKey++
      continue
    }
    const ks = String(k)
    if (seen.has(ks)) duplicates++
    else seen.add(ks)
  }

  return {
    schemaVersion: 1,
    exportedAt: data.exportedAt,
    deviceId: data.deviceId,
    itemsCount: data.items.length,
    hasSettings: Boolean(data.settings),
    hasScanHistory: Array.isArray(data.scanHistory),
    keyPath,
    duplicatesInFile: duplicates,
    missingKeyCount: missingKey,
  }
}

export async function importDataFromText(text: string, mode: ImportMode): Promise<ImportResult> {
  const data = parseExport(text)
  const db = await getDb()

  const tx = db.transaction('items', 'readwrite')
  const store = tx.objectStore('items')
  const keyPath = (store as any).keyPath ?? null
  const keyOf = makeKeyOf(keyPath)

  if (mode === 'replace') {
    await store.clear()
  }

  // dédup: dernier item du fichier gagne
  const map = new Map<string, Item>()
  let missingKey = 0

  for (const item of data.items) {
    const k = keyOf(item)
    if (k == null) {
      missingKey++
      continue
    }
    map.set(String(k), item)
  }

  let written = 0
  for (const item of map.values()) {
    await store.put(item)
    written++
  }

  await (tx as any).done

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

  return {
    itemsProcessed: data.items.length,
    uniqueItemsInFile: map.size,
    itemsWritten: written,
    duplicatesDropped: Math.max(0, data.items.length - missingKey - map.size),
    missingKeySkipped: missingKey,
    settingsImported,
    scanHistoryImported,
  }
}
