const KEY = 'deviceId:v1'

function fallbackId() {
  return `dev_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function getDeviceId(): string {
  try {
    const existing = localStorage.getItem(KEY)
    if (existing) return existing

    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : fallbackId()

    localStorage.setItem(KEY, id)
    return id
  } catch {
    return fallbackId()
  }
}
