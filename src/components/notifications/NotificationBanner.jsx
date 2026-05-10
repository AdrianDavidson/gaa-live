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
      className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex items-center justify-between gap-3"
    >
      <p className="text-sm font-medium text-blue-800">Get notified when full-time results come in — tap to enable</p>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={handleEnable}
          className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-lg min-h-[40px]"
        >
          Turn on
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-blue-400 text-sm font-bold px-2 py-1 min-h-[40px]"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
