import { getDb } from '../data/db'
import type { Item } from '../data/types'
import { showSystemNotification } from './system'

const LAST_KEY = 'notif:lastExpiryAt:v1'

function getLastSent(): number {
  try {
    return Number(localStorage.getItem(LAST_KEY) || '0') || 0
  } catch {
    return 0
  }
}

function setLastSent(ts: number) {
  try {
    localStorage.setItem(LAST_KEY, String(ts))
  } catch {
    // ignore
  }
}

function pickExpiryTimestamp(item: Item): number | null {
  // TODO: adapte à ton modèle réel si nécessaire
  const anyItem = item as any
  const ts: unknown = anyItem.expiresAt ?? anyItem.bestBefore ?? anyItem.eatBefore
  return typeof ts === 'number' ? ts : null
}

function countSoon(items: Item[]) {
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000

  let soon = 0
  let late = 0

  for (const it of items) {
    if ((it as any).status && (it as any).status !== 'active') continue
    const ts = pickExpiryTimestamp(it)
    if (ts == null) continue
    const delta = ts - now
    if (delta >= -oneDay && delta <= 2 * oneDay) soon++
    else if (delta < -oneDay) late++
  }
  return { soon, late }
}

export async function runExpiryAutoCheck(cooldownMinutes = 180) {
  const now = Date.now()
  const last = getLastSent()
  const cooldownMs = cooldownMinutes * 60 * 1000
  if (now - last < cooldownMs) return { skipped: true, reason: 'cooldown' as const }

  if (!('indexedDB' in window)) return { skipped: true, reason: 'no-db' as const }

  const db = await getDb()
  const items = await db.getAll('items')
  const { soon, late } = countSoon(items)

  if (soon === 0 && late === 0) return { skipped: true, reason: 'no-items' as const }

  const title = soon + late === 1 ? 'Frigo: 1 aliment à surveiller' : `Frigo: ${soon + late} aliments à surveiller`
  const body = `${soon} bientôt à la date. ${late} déjà dépassés.`

  const res = await showSystemNotification(title, {
    body,
    tag: 'frigo-expiry-auto',
    data: { url: '/' },
  })

  if (res === 'shown') setLastSent(now)
  return { skipped: res !== 'shown', reason: res as any, soon, late }
}

export function startExpiryAutoCheckLoop() {
  // 1) au lancement
  window.setTimeout(() => {
    runExpiryAutoCheck().catch(() => {})
  }, 4000)

  // 2) toutes les 10 minutes
  window.setInterval(() => {
    runExpiryAutoCheck().catch(() => {})
  }, 10 * 60 * 1000)
}
