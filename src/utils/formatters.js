import { format, isToday, isTomorrow, isYesterday } from 'date-fns'

export function formatMatchDate(dateStr) {
  const d = new Date(dateStr)
  if (isToday(d))     return `Today, ${format(d, 'HH:mm')}`
  if (isTomorrow(d))  return `Tomorrow, ${format(d, 'HH:mm')}`
  if (isYesterday(d)) return `Yesterday, ${format(d, 'HH:mm')}`
  return format(d, 'EEE d MMM, HH:mm')
}

export function formatDateGroup(dateStr) {
  const d = new Date(dateStr)
  if (isToday(d))     return 'Today'
  if (isTomorrow(d))  return 'Tomorrow'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'EEEE d MMMM')
}

// Returns the ISO date string (YYYY-MM-DD) of the Monday of the week containing dateStr.
export function weekMondayKey(dateStr) {
  const d   = new Date(dateStr)
  const day = d.getUTCDay() || 7          // 1 Mon … 7 Sun
  const mon = new Date(d)
  mon.setUTCDate(d.getUTCDate() - day + 1)
  return mon.toISOString().slice(0, 10)   // YYYY-MM-DD
}

// Convert a competition name/code to a short readable pill label.
// Strips context words implied by the app (Cork, Minor, Hurling/Football)
// and maps Championship → Cup so labels stay concise.
// Falls back to parsing the short_name code if name is unavailable.
export function compPillLabel(name, shortName) {
  if (name) {
    const label = name
      .replace(/\bCork\s+/gi, '')
      .replace(/\bMinor\s+/gi, '')
      .replace(/\bHurling\s+/gi, '')
      .replace(/\bFootball\s+/gi, '')
      .replace(/\bChampionship\b/gi, 'Cup')
      .replace(/\s+/g, ' ')
      .trim()
    if (label) return label
  }
  // Fallback: decode short_name code e.g. PMHL → "Premier League"
  const code  = shortName ?? ''
  const grade = code.startsWith('PM') ? 'Premier' :
                code.startsWith('MA') ? 'A' :
                code.startsWith('MB') ? 'B' : code.slice(0, 2)
  const last  = code.slice(-1)
  const type  = last === 'L' ? 'League' : last === 'C' ? 'Cup' : ''
  return type ? `${grade} ${type}` : code
}

// "14–20 Jun" or "28 Jun – 4 Jul" when the week crosses a month boundary.
export function formatWeekRange(mondayIso) {
  const mon = new Date(mondayIso + 'T00:00:00Z')
  const sun = new Date(mon)
  sun.setUTCDate(mon.getUTCDate() + 6)

  const monDay   = mon.getUTCDate()
  const sunDay   = sun.getUTCDate()
  const monMonth = mon.toLocaleDateString('en-IE', { month: 'short', timeZone: 'UTC' })
  const sunMonth = sun.toLocaleDateString('en-IE', { month: 'short', timeZone: 'UTC' })

  if (monMonth === sunMonth) {
    return `${monDay}–${sunDay} ${sunMonth}`
  }
  return `${monDay} ${monMonth} – ${sunDay} ${sunMonth}`
}
