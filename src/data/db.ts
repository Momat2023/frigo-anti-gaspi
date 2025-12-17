import { openDB, type IDBPDatabase } from 'idb'
import type { Item, Settings } from './types'
import { DEFAULT_DAYS } from './presets'

const DB_NAME = 'frigo-anti-gaspi'
const DB_VERSION = 1

export type AppDB = {
  items: {
    key: number
    value: Item
  }
  settings: {
    key: string
    value: Settings
  }
}

let dbInstance: IDBPDatabase<AppDB> | null = null

export async function getDb() {
  if (dbInstance) return dbInstance
  dbInstance = await openDB<AppDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('items')) {
        db.createObjectStore('items', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' })
      }
    }
  })
  await initSettings()
  return dbInstance
}

const SETTINGS_KEY = 'main'

async function initSettings() {
  if (!dbInstance) return
  const db = dbInstance
  const existing = await db.get('settings', SETTINGS_KEY)
  if (!existing) {
    await db.put('settings', {
      key: SETTINGS_KEY,
      notificationsEnabled: false,
      defaultLocation: 'Frigo',
      defaultTargetDays: 7,
      defaultDaysByCategory: DEFAULT_DAYS
    })
  }
}

export async function addItem(item: Omit<Item, 'id' | 'status' | 'createdAt' | 'openedAt'>) {
  const db = await getDb()
  const newItem: Item = {
    ...item,
    id: Date.now(),
    status: 'active',
    createdAt: Date.now(),
    openedAt: Date.now()
  }
  await db.add('items', newItem)
  return newItem
}

export async function updateItem(id: number, updates: Partial<Item>) {
  const db = await getDb()
  const all = await db.getAll('items')
  const item = all.find(x => x.id === id)
  if (!item) return
  await db.put('items', { ...item, ...updates })
}

export async function deleteItem(id: number) {
  const db = await getDb()
  const all = await db.getAll('items')
  const item = all.find(x => x.id === id)
  if (!item) return
  await db.delete('items', item.id)
}

export async function getSettings(): Promise<Settings> {
  const db = await getDb()
  const s = await db.get('settings', SETTINGS_KEY)
  if (!s) {
    return {
      key: SETTINGS_KEY,
      notificationsEnabled: false,
      defaultLocation: 'Frigo',
      defaultTargetDays: 7,
      defaultDaysByCategory: DEFAULT_DAYS,
      updatedAt: Date.now()
    }
  }
  return s
}

export async function updateSettings(updates: Partial<Settings>) {
  const db = await getDb()
  const current = await getSettings()
  await db.put('settings', {
    ...current,
    ...updates,
    updatedAt: Date.now()
  })
}

// Alias pour compatibilité
export const saveSettings = updateSettings
