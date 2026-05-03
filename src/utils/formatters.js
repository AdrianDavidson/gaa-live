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
