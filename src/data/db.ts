import { openDB, type DBSchema } from 'idb'
import type { Item, Settings } from './types'
import { DEFAULT_DAYS } from './presets'

type FrigoDB = DBSchema & {
  items: {
    key: string
    value: Item
    indexes: {
      'by-status': string
      'by-createdAt': number
    }
  }
  settings: {
    key: 'main'
    value: Settings
  }
}

const DB_NAME = 'frigo-anti-gaspi'
const DB_VERSION = 3
const SETTINGS_KEY: Settings['key'] = 'main'

export async function getDb() {
  return openDB<FrigoDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, _newVersion, transaction) {
      // v1: store items
      if (oldVersion < 1) {
        const store = db.createObjectStore('items', { keyPath: 'id' })
        store.createIndex('by-status', 'status')
        store.createIndex('by-createdAt', 'createdAt')
      }

      // v3: store settings (création de schema uniquement dans upgrade) [web:240][web:238]
      if (oldVersion < 3) {
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' })
        }

        // Seed settings par défaut (dans la transaction d'upgrade)
        const settingsStore = transaction.objectStore('settings')
        const initial: Settings = {
          key: SETTINGS_KEY,
          defaultDaysByCategory: DEFAULT_DAYS,
          updatedAt: Date.now(),
        }
        settingsStore.put(initial)
      }
    },
  })
}

export function newId() {
  return crypto.randomUUID()
}

/* -------------------- Items -------------------- */
export async function addItem(item: Item) {
  const db = await getDb()
  await db.put('items', item)
}

export async function listActiveItems() {
  const db = await getDb()
  const all = await db.getAll('items')
  return all.filter((x) => x.status === 'active')
}

export async function getItem(id: string) {
  const db = await getDb()
  return db.get('items', id)
}

export async function updateItem(item: Item) {
  const db = await getDb()
  await db.put('items', item)
}

export async function setStatus(id: string, status: 'active' | 'eaten' | 'thrown') {
  const db = await getDb()
  const item = await db.get('items', id)
  if (!item) return
  await db.put('items', { ...item, status })
}

export async function deleteItem(id: string) {
  const db = await getDb()
  await db.delete('items', id)
}

/* -------------------- Settings -------------------- */
export async function getSettings(): Promise<Settings> {
  const db = await getDb()
  const existing = await db.get('settings', SETTINGS_KEY)
  if (existing) return existing

  const initial: Settings = {
    key: SETTINGS_KEY,
    defaultDaysByCategory: DEFAULT_DAYS,
    updatedAt: Date.now(),
  }
  await db.put('settings', initial)
  return initial
}

export async function saveSettings(partial: Omit<Settings, 'key' | 'updatedAt'>) {
  const db = await getDb()
  const next: Settings = {
    key: SETTINGS_KEY,
    ...partial,
    updatedAt: Date.now(),
  }
  await db.put('settings', next)
}
