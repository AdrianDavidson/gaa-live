import PageWrapper          from '../components/layout/PageWrapper'
import NotificationToggle   from '../components/notifications/NotificationToggle'
import { useAppStore }      from '../store/appStore'
import { ALL_COUNTIES }     from '../utils/countyColours'

const FONT_SIZES = [
  { value: 'medium', label: 'Medium' },
  { value: 'large',  label: 'Large'  },
  { value: 'xl',     label: 'Extra Large' },
]

export default function Settings() {
  const {
    favouriteCounty, setFavouriteCounty,
    fontSize,        setFontSize,
    darkMode,        toggleDarkMode,
    notificationsEnabled,
  } = useAppStore()

  return (
    <PageWrapper title="Settings">

      {/* Favourite county */}
      <section className="mb-6" aria-labelledby="county-heading">
        <h2 id="county-heading" className="text-base font-bold text-gray-700 mb-2">
          Favourite County
        </h2>
        <select
          value={favouriteCounty ?? ''}
          onChange={(e) => setFavouriteCounty(e.target.value || null)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base min-h-[48px] focus:outline-none focus:ring-2 focus:ring-gaa-green"
          aria-label="Select your favourite county"
        >
          <option value="">— None selected —</option>
          {ALL_COUNTIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </section>

      {/* Text size */}
      <section className="mb-6" aria-labelledby="fontsize-heading">
        <h2 id="fontsize-heading" className="text-base font-bold text-gray-700 mb-2">
          Text Size
        </h2>
        <div className="flex gap-2" role="group" aria-labelledby="fontsize-heading">
          {FONT_SIZES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFontSize(value)}
              aria-pressed={fontSize === value}
              className={`flex-1 py-2 rounded-lg text-sm font-bold min-h-[48px] border transition-colors ${
                fontSize === value
                  ? 'bg-gaa-green text-white border-gaa-green'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section className="mb-6" aria-labelledby="notif-heading">
        <h2 id="notif-heading" className="text-base font-bold text-gray-700 mb-2">
          Notifications
        </h2>
        <NotificationToggle />
      </section>

      {/* Dark mode */}
      <section className="mb-6" aria-labelledby="dark-heading">
        <h2 id="dark-heading" className="text-base font-bold text-gray-700 mb-2">
          Appearance
        </h2>
        <button
          onClick={toggleDarkMode}
          aria-pressed={darkMode}
          className={`flex items-center gap-3 min-h-[48px] text-base font-medium text-gray-800`}
        >
          <span
            className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${
              darkMode ? 'bg-gaa-green' : 'bg-gray-300'
            }`}
            aria-hidden="true"
          >
            <span
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                darkMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </span>
          Dark mode
        </button>
      </section>

      {/* About our data */}
      <section aria-labelledby="about-heading">
        <h2 id="about-heading" className="text-base font-bold text-gray-700 mb-3">
          About Our Data
        </h2>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3 text-sm text-gray-600">
          <p>
            <strong className="text-gray-800">🟢 Free Stream</strong> — When a live YouTube
            stream is found for a match, we show it right here in the app, free of charge.
          </p>
          <p>
            <strong className="text-gray-800">🟡 ~10 Min Updates</strong> — When no stream is
            available, we check RTÉ Sport, BBC Sport, and HoganStand every 10 minutes for the
            latest score. These are public RSS feeds designed for sharing.
          </p>
          <p>
            <strong className="text-gray-800">⚫ No Live Data</strong> — Sometimes a result
            simply isn't published yet. We'll keep checking and update as soon as it is.
          </p>
          <p className="text-xs text-gray-400 pt-2 border-t border-gray-200">
            GAA Live does not host video content. All streams are publicly available on YouTube.
            Score data is sourced from public RSS feeds.
          </p>
        </div>
      </section>

    </PageWrapper>
  )
}
