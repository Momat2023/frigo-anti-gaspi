import { getDb, getSettings } from './db'
import type { Item, Settings } from './types'

export type ExportData = {
  version: number
  exportedAt: number
  items: Item[]
  settings: Settings
}

export async function exportAllData(): Promise<ExportData> {
  const db = await getDb()
  const items = await db.getAll('items')
  const settings = await getSettings()

  return {
    version: 1,
    exportedAt: Date.now(),
    items,
    settings
  }
}

export function downloadJSON(data: ExportData, filename: string = 'frigo-backup.json') {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function clearAllData() {
  const db = await getDb()
  
  // Supprimer tous les items
  const items = await db.getAll('items')
  for (const item of items) {
    await db.delete('items', item.id)
  }
  
  // Supprimer les settings
  await db.delete('settings', 'main')
  
  // Nettoyer localStorage
  localStorage.clear()
}
