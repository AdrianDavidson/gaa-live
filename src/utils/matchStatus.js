export function isMatchWindow(fixture) {
  const now      = Date.now()
  const kickoff  = new Date(fixture.startDate).getTime()
  const earliest = kickoff - 30 * 60 * 1000
  const latest   = kickoff + 110 * 60 * 1000
  return now >= earliest && now <= latest
}

export function getElapsedMinutes(fixture) {
  const elapsed = (Date.now() - new Date(fixture.startDate).getTime()) / 60000
  return Math.min(Math.round(Math.max(elapsed, 0)), 80)
}

export function formatTimeAgo(date) {
  if (!date) return 'unknown'
  const diffMs   = Date.now() - new Date(date).getTime()
  const diffMins = Math.round(diffMs / 60000)
  if (diffMins < 1)  return 'just now'
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`
  const diffHrs  = Math.round(diffMins / 60)
  return `${diffHrs} hr${diffHrs === 1 ? '' : 's'} ago`
}
