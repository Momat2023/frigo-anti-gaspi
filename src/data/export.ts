import { getDb, getSettings } from './db'
import type { Item, Settings } from './types'

export type ExportBlobV1 = {
  schemaVersion: 1
  exportedAt: number
  items: Item[]
  settings: Settings
}

export async function exportDataV1(): Promise<ExportBlobV1> {
  const db = await getDb()
  const items = await db.getAll('items')
  const settings = await getSettings()

  return {
    schemaVersion: 1,
    exportedAt: Date.now(),
    items,
    settings,
  }
}
