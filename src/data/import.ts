import { getDb } from './db'
import type { Item } from './types'

export type ExportData = {
  version: number
  exportedAt: number
  items: Item[]
}

export async function importData(data: ExportData) {
  const db = await getDb()
  
  for (const item of data.items) {
    await db.put('items', item)
  }
}
