import { findYouTubeLiveStream } from './youtubeService'
import { getLatestRSSScores }    from './rssService'
import { isMatchWindow }         from '../utils/matchStatus'

export const DATA_TIERS = {
  STREAM: 'stream',
  LIVE:   'live',
  POLLED: 'polled',
  NONE:   'none',
}

export async function resolveFixtureTier(fixture) {
  if (isMatchWindow(fixture)) {
    const stream = await findYouTubeLiveStream(
      `${fixture.homeTeam} ${fixture.awayTeam} GAA`
    )
    if (stream) {
      return { tier: DATA_TIERS.STREAM, streamData: stream, scoreData: null, lastUpdated: new Date() }
    }
  }

  // Tier 2 reserved: const liveScore = await getLiveScore(fixture.id)

  const rssScore = await getLatestRSSScores(fixture)
  if (rssScore) {
    return { tier: DATA_TIERS.POLLED, streamData: null, scoreData: rssScore, lastUpdated: rssScore.fetchedAt }
  }

  return { tier: DATA_TIERS.NONE, streamData: null, scoreData: null, lastUpdated: null }
}
