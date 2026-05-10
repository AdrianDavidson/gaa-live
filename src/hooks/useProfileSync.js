import { useEffect, useRef } from 'react'
import { useAuth }           from '@clerk/react'
import { useAppStore }       from '../store/appStore'

export function useProfileSync() {
  const { isSignedIn, getToken } = useAuth()
  const homeClubId  = useAppStore((s) => s.homeClubId)
  const setHomeClub = useAppStore((s) => s.setHomeClub)
  const synced      = useRef(false)

  useEffect(() => {
    if (!isSignedIn) { synced.current = false; return }
    if (synced.current) return

    async function sync() {
      const token = await getToken()
      const res   = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return

      const { homeClubId: serverClubId } = await res.json()

      if (serverClubId) {
        // Server has a saved club — authoritative across devices
        setHomeClub(serverClubId)
      } else if (homeClubId) {
        // User had a local club before signing in — persist it to the server
        await fetch('/api/user/profile', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body:    JSON.stringify({ homeClubId }),
        })
      }

      synced.current = true
    }

    sync()
  }, [isSignedIn]) // eslint-disable-line react-hooks/exhaustive-deps
}
