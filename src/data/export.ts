import { getDb, getSettings } from './db'
import type { Item, Settings } from './types'
import { loadScanHistory } from './scanHistory'
import { getDeviceId } from './device'

export type ExportOptions = {
  includeArchived: boolean
  includeSettings: boolean
  includeScanHistory: boolean
}

export type ExportBlobV1 = {
  schemaVersion: 1
  exportedAt: number
  deviceId: string
  items: Item[]
  settings?: Settings
  scanHistory?: string[]
}

function isArchivedItem(x: Item): boolean {
  // tout ce qui n'est plus "active" est considéré comme historique
  return x.status !== 'active'
}

export async function exportDataV1(opts: ExportOptions): Promise<ExportBlobV1> {
  const db = await getDb()
  const all = await db.getAll('items')
  const items = opts.includeArchived ? all : all.filter((x) => !isArchivedItem(x as Item))

  const out: ExportBlobV1 = {
    schemaVersion: 1,
    exportedAt: Date.now(),
    deviceId: getDeviceId(),
    items,
  }

  if (opts.includeSettings) out.settings = await getSettings()
  if (opts.includeScanHistory) out.scanHistory = loadScanHistory()

  return out
}

export async function exportPreview(opts: ExportOptions) {
  const db = await getDb()
  const all = await db.getAll('items')
  const archived = all.filter((x) => isArchivedItem(x as Item)).length
  const included = opts.includeArchived ? all.length : all.length - archived

  return {
    totalItems: all.length,
    archivedItems: archived,
    includedItems: included,
    scanHistoryCount: opts.includeScanHistory ? loadScanHistory().length : 0,
    includesSettings: opts.includeSettings,
  }
}
