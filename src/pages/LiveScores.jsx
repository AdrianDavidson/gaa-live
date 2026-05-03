import { useState, useEffect } from 'react'
import PageWrapper  from '../components/layout/PageWrapper'
import MatchList    from '../components/scores/MatchList'
import { LIVE_FIXTURES } from '../data/mockFixtures'

export default function LiveScores() {
  const [secondsAgo, setSecondsAgo] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setSecondsAgo((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <PageWrapper title="Live Scores">
      <p className="text-sm text-gray-500 mb-4" aria-live="polite">
        Last checked: {secondsAgo === 0 ? 'just now' : `${secondsAgo}s ago`}
      </p>

      <div aria-live="polite" aria-label="Live score updates">
        <MatchList
          fixtures={LIVE_FIXTURES}
          emptyMessage="No live games right now. Check Fixtures for what's coming up."
        />
      </div>
    </PageWrapper>
  )
}
