import { openDB } from 'idb'
import type { DBSchema } from 'idb'
import type { Item, Settings } from './types'

interface AppDB extends DBSchema {
  items: {
    key: number
    value: Item
  }
  settings: {
    key: string
    value: Settings
  }
}

const DB_NAME = 'frigo-anti-gaspi-db'
const DB_VERSION = 1
const SETTINGS_KEY = 'main'

export async function getDb() {
  return openDB<AppDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('items')) {
        db.createObjectStore('items', { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' })
      }
    }
  })
}

export async function addItem(item: Omit<Item, 'id'>): Promise<Item> {
  const db = await getDb()
  const id = await db.add('items', {
    ...item,
    id: Date.now()
  } as Item)
  
  const newItem = await db.get('items', id)
  return newItem!
}

export async function getSettings(): Promise<Settings> {
  const db = await getDb()
  let settings = await db.get('settings', SETTINGS_KEY)
  
  if (!settings) {
    settings = {
      id: SETTINGS_KEY,
      notificationsEnabled: false
    }
    await db.put('settings', settings)
  }
  
  return settings
}

export async function updateSettings(updates: Partial<Settings>): Promise<Settings> {
  const db = await getDb()
  const current = await getSettings()
  
  const updated: Settings = {
    ...current,
    ...updates
  }
  
  await db.put('settings', updated)
  return updated
}
