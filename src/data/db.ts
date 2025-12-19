import { openDB, type IDBPDatabase } from 'idb'
import type { Item } from './types'
import { syncData } from '../services/syncService'

const DB_NAME = 'frigo-safe'
const STORE_NAME = 'items'

export async function getDb(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
      }
    },
  })
}

export async function addItem(item: Omit<Item, 'id'>): Promise<Item> {
  const db = await getDb()
  const id = await db.add(STORE_NAME, item)
  
  // Forcer la sync cloud
  syncData()
  
  return { ...item, id: id as number }
}

export async function getAllItems(): Promise<Item[]> {
  const db = await getDb()
  return db.getAll(STORE_NAME)
}

export async function updateItem(item: Item) {
  const db = await getDb()
  await db.put(STORE_NAME, item)
  syncData()
}

export async function deleteItem(id: number) {
  const db = await getDb()
  await db.delete(STORE_NAME, id)
  syncData()
}
