import { openDB, type DBSchema } from 'idb'
import type { Item } from './types'

type FrigoDB = DBSchema & {
  items: {
    key: string
    value: Item
    indexes: {
      'by-status': string
      'by-createdAt': number
    }
  }
}

const DB_NAME = 'frigo-anti-gaspi'
const DB_VERSION = 2

export async function getDb() {
  return openDB<FrigoDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, _newVersion, _transaction) {
      // v1: création store + indexes
      if (oldVersion < 1) {
        const store = db.createObjectStore('items', { keyPath: 'id' })
        store.createIndex('by-status', 'status')
        store.createIndex('by-createdAt', 'createdAt')
      }

      // v2: exemple de migration (si tu veux créer un nouvel index, c’est ici)
      if (oldVersion < 2) {
        // Exemple (optionnel) : si le store existe déjà, on peut le récupérer via la transaction
        // const store = transaction.objectStore('items')
        // (pas nécessaire pour "category" car c’est juste un champ)
      }
    },
  })
}

export function newId() {
  return crypto.randomUUID()
}

export async function addItem(item: Item) {
  const db = await getDb()
  await db.put('items', item)
}

export async function listActiveItems() {
  const db = await getDb()
  // Version simple sans dépendre d’index (robuste)
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

