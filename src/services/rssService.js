export async function getLatestRSSScores(fixture) {
  try {
    const res  = await fetch('/api/scores')
    const data = await res.json()
    if (!data.items?.length) return null

    const home = fixture.homeTeam.toLowerCase()
    const away = fixture.awayTeam.toLowerCase()

    const match = data.items.find((item) => {
      const title = item.title?.toLowerCase() ?? ''
      return title.includes(home) && title.includes(away)
    })

    if (!match) return null

    return {
      title:     match.title,
      source:    match.source,
      link:      match.link,
      fetchedAt: new Date(data.updatedAt),
    }
  } catch (err) {
    console.error('RSS score lookup error:', err)
    return null
  }
}
