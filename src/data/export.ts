import { getDb } from './db'

export async function exportAllData() {
  const db = await getDb()
  const items = await db.getAll('items')
  
  const data = {
    items,
    exportedAt: new Date().toISOString(),
    version: '1.0.0'
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `frigo-safe-export-${new Date().toISOString().split('T')[0]}.json`
  a.click()
}
