import { useAppStore } from '../store/appStore'

export function useClubNotifications() {
  const { followedClubs, setFollowedClubs } = useAppStore()

  async function subscribe(clubs) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false

    const reg = await navigator.serviceWorker.ready
    let sub   = await reg.pushManager.getSubscription()
    if (!sub) {
      const res = await fetch('/vapid-public-key')
      const { key } = await res.json().catch(() => ({ key: import.meta.env.VITE_VAPID_PUBLIC_KEY }))
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key,
      })
    }

    await fetch('/api/subscribe-minor', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ subscription: sub.toJSON(), clubs }),
    })

    setFollowedClubs(clubs)
    return true
  }

  function followClub(clubName) {
    const updated = [...new Set([...followedClubs, clubName])]
    subscribe(updated)
  }

  function unfollowClub(clubName) {
    const updated = followedClubs.filter((c) => c !== clubName)
    subscribe(updated)
  }

  return { followedClubs, followClub, unfollowClub }
}
