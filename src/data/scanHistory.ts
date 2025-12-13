const KEY = 'scanHistory:v1'
const MAX = 10

export function loadScanHistory(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x) => typeof x === 'string')
  } catch {
    return []
  }
}

export function pushScanHistory(code: string) {
  const c = code.trim()
  if (!c) return

  const current = loadScanHistory()
  const next = [c, ...current.filter((x) => x !== c)].slice(0, MAX)
  localStorage.setItem(KEY, JSON.stringify(next))
}

export function setScanHistory(codes: string[]) {
  const cleaned = (Array.isArray(codes) ? codes : [])
    .filter((x) => typeof x === 'string')
    .map((x) => x.trim())
    .filter(Boolean)

  const uniq: string[] = []
  for (const c of cleaned) if (!uniq.includes(c)) uniq.push(c)

  localStorage.setItem(KEY, JSON.stringify(uniq.slice(0, MAX)))
}
