import { ACTIVE_TSDB_COMPETITIONS } from '../data/competitions'
import { fetchAllGAAData }          from './theSportsDbService'

const USE_DIRECT = import.meta.env.VITE_USE_DIRECT_API === 'true'

export async function fetchGAAData() {
  if (USE_DIRECT) {
    // Development: call TheSportsDB directly from the browser
    return fetchAllGAAData(ACTIVE_TSDB_COMPETITIONS)
  }

  // Production: call the Vercel function (caches in Redis)
  const res  = await fetch('/api/fixtures')
  if (!res.ok) throw new Error(`Fixtures API error: ${res.status}`)
  return res.json()
}

// backward-compat alias
export const fetchHurlingData = fetchGAAData
