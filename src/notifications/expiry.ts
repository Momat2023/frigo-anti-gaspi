import { getDb } from '../data/db'
import type { Item } from '../data/types'

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported'
  const perm = await Notification.requestPermission()
  return perm
}

function pickExpiryTimestamp(item: Item): number | null {
  // TODO: adapte ce mapping à ton vrai modèle
  // exemples possibles: item.expiresAt, item.bestBefore, item.eatBefore...
  const anyItem = item as any
  const ts: unknown = anyItem.expiresAt ?? anyItem.bestBefore ?? anyItem.eatBefore
  if (typeof ts === 'number') return ts
  return null
}

function filterSoonExpiring(items: Item[]) {
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000

  const soon: Item[] = []
  const late: Item[] = []

  for (const item of items) {
    const ts = pickExpiryTimestamp(item)
    if (ts == null) continue
    const delta = ts - now

    if (delta >= -oneDay && delta <= 2 * oneDay) {
      // entre hier et dans 2 jours
      soon.push(item)
    } else if (delta < -oneDay) {
      late.push(item)
    }
  }
  return { soon, late }
}

export async function showExpiryTestNotification(): Promise<
  'unsupported' | 'denied' | 'no-items' | 'shown' | 'no-permission'
> {
  if (!isNotificationSupported()) return 'unsupported'

  let perm = Notification.permission
  if (perm === 'default') {
    perm = await Notification.requestPermission()
  }
  if (perm !== 'granted') return 'denied'

  const db = await getDb()
  const items = await db.getAll('items')

  const { soon, late } = filterSoonExpiring(items)

  if (soon.length === 0 && late.length === 0) return 'no-items'

  const total = soon.length + late.length
  const title =
    total === 1
      ? 'Frigo: 1 aliment à surveiller'
      : `Frigo: ${total} aliments à surveiller`

  let body = ''
  if (soon.length > 0) {
    body += `${soon.length} bientôt à la date. `
  }
  if (late.length > 0) {
    body += `${late.length} déjà dépassés.`
  }

  // Notification "foreground" simple (pas via service worker) [web:954]
  new Notification(title, {
    body,
    tag: 'frigo-expiry-test',
  })

  return 'shown'
}
