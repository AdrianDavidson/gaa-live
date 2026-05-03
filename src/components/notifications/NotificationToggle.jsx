import { usePushNotifications }   from '../../hooks/usePushNotifications'
import { useAppStore }            from '../../store/appStore'

export default function NotificationToggle() {
  const { permission, subscribe, loading } = usePushNotifications()
  const { notificationsEnabled, toggleNotifications } = useAppStore()

  const supported = 'Notification' in window && 'serviceWorker' in navigator

  if (!supported) {
    return (
      <p className="text-sm text-gray-400">
        Push notifications are not supported in this browser.
      </p>
    )
  }

  if (permission === 'denied') {
    return (
      <p className="text-sm text-gray-500">
        Notifications are blocked. Please enable them in your browser settings.
      </p>
    )
  }

  async function handleToggle() {
    if (!notificationsEnabled) {
      await subscribe()
      toggleNotifications(true)
    } else {
      toggleNotifications(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="flex items-center gap-3 min-h-[48px] text-base font-medium text-gray-800 disabled:opacity-50"
      aria-pressed={notificationsEnabled}
    >
      <span
        className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${
          notificationsEnabled ? 'bg-gaa-green' : 'bg-gray-300'
        }`}
        aria-hidden="true"
      >
        <span
          className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
            notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
      Get score alerts
    </button>
  )
}
