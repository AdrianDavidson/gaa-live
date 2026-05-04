import { useState }               from 'react'
import { usePushNotifications }   from '../../hooks/usePushNotifications'
import { useAppStore }            from '../../store/appStore'

export default function NotificationBanner() {
  const { permission, subscribe } = usePushNotifications()
  const { notificationsEnabled, toggleNotifications } = useAppStore()
  const [dismissed, setDismissed] = useState(false)

  if (
    dismissed ||
    notificationsEnabled ||
    permission === 'granted' ||
    permission === 'denied' ||
    !('Notification' in window)
  ) return null

  async function handleEnable() {
    await subscribe()
    toggleNotifications(true)
    setDismissed(true)
  }

  return (
    <div
      role="complementary"
      aria-label="Notification prompt"
      className="bg-gaa-green text-white px-4 py-3 flex items-center justify-between gap-3"
    >
      <p className="text-sm font-medium">Get notified when full-time results come in — tap to enable</p>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={handleEnable}
          className="bg-white text-gaa-green text-sm font-bold px-3 py-1 rounded-lg min-h-[40px]"
        >
          Turn on
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-white text-sm font-bold px-2 py-1 min-h-[40px]"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
