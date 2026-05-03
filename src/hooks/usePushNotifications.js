import { useState } from 'react'
import { subscribeToPush } from '../services/pushService'

export function usePushNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function subscribe() {
    setLoading(true)
    setError(null)
    try {
      const result = await Notification.requestPermission()
      if (result !== 'granted') {
        setPermission(result)
        return
      }
      await subscribeToPush()
      setPermission('granted')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { permission, subscribe, loading, error }
}
