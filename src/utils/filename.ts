export function exportFilename(prefix = 'frigo-export', ext = 'json') {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  // local time, safe characters only
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`
  return `${prefix}-${stamp}.${ext}`
}
