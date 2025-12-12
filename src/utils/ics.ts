function pad(n: number) {
  return String(n).padStart(2, '0')
}

// UTC: YYYYMMDDTHHMMSSZ
function toIcsUtc(dt: Date) {
  return (
    dt.getUTCFullYear() +
    pad(dt.getUTCMonth() + 1) +
    pad(dt.getUTCDate()) +
    'T' +
    pad(dt.getUTCHours()) +
    pad(dt.getUTCMinutes()) +
    pad(dt.getUTCSeconds()) +
    'Z'
  )
}

// Escape minimal pour V1
function esc(s: string) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

export function buildEatReminderIcs(params: {
  title: string
  description?: string
  startUtc: Date
  endUtc: Date
  uid: string
}) {
  const dtStart = toIcsUtc(params.startUtc)
  const dtEnd = toIcsUtc(params.endUtc)
  const dtStamp = toIcsUtc(new Date())

  // VEVENT classique (DTSTART/DTEND/UID/DTSTAMP/SUMMARY/...) [web:272][web:274]
  return (
    [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//FrigoAntiGaspi//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${esc(params.uid)}`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${esc(params.title)}`,
      params.description ? `DESCRIPTION:${esc(params.description)}` : undefined,
      'END:VEVENT',
      'END:VCALENDAR',
    ]
      .filter((line): line is string => Boolean(line))
      // Les lignes iCalendar sont séparées par CRLF [web:306][web:274]
      .join('\r\n') + '\r\n'
  )
}

export function downloadTextFile(
  filename: string,
  content: string,
  mime = 'text/calendar;charset=utf-8',
) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob) // Blob URL [web:304]

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  a.remove()

  // Petit délai = plus fiable sur certains navigateurs
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

