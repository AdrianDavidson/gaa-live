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

      {/* Foireann API — unlock full data */}
      <section className="mb-6" aria-labelledby="foireann-heading">
        <h2 id="foireann-heading" className="text-base font-bold text-gray-700 mb-3">
          Unlock Full Hurling Data
        </h2>
        <div className="bg-green-50 border border-gaa-green rounded-xl p-4 space-y-3 text-sm text-gray-700">
          <p>
            <strong>Currently showing:</strong> All-Ireland SHC, Munster SHC, Leinster SHC,
            Joe McDonagh Cup, Christy Ring Cup — sourced free from TheSportsDB.
          </p>
          <p>
            <strong>To unlock:</strong> Under-20, Camogie, Allianz Hurling League, club
            championships and all county competitions — apply for the <strong>Foireann Open Data API</strong>.
          </p>
          <div className="bg-white border border-green-200 rounded-lg p-3 text-xs text-gray-600">
            <p className="font-bold text-gray-800 mb-1">How to apply (free)</p>
            <ol className="space-y-1 list-decimal list-inside">
              <li>You need to be a <strong>Club Administrator</strong> on Foireann (the GAA's club management system)</li>
              <li>Go to <strong>gmssupport.zendesk.com</strong> and search "Open Data API Getting Started"</li>
              <li>Submit a request — you'll receive 2 API keys by email</li>
              <li>Add <code className="bg-gray-100 px-1 rounded">FOIREANN_API_KEY</code> to your Vercel environment variables</li>
            </ol>
          </div>
          <p className="text-xs text-gray-500">
            If you're not a club admin, ask your club secretary or county board — they can apply on your behalf.
          </p>
        </div>
      </section>

      {/* About our data */}
      <section aria-labelledby="about-heading">
        <h2 id="about-heading" className="text-base font-bold text-gray-700 mb-3">
          About Our Data
        </h2>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3 text-sm text-gray-600">
          <p>
            <strong className="text-gray-800">Fixtures &amp; Results</strong> — Sourced from
            TheSportsDB (free, no key needed) for 5 senior hurling competitions.
          </p>
          <p>
            <strong className="text-gray-800">Scores in G-P format</strong> — e.g. 1-18 means
            1 goal (3 pts) + 18 points = 21 total. The winning score is shown in green.
          </p>
          <p>
            <strong className="text-gray-800">🟢 Free Stream</strong> — When a live YouTube
            stream is found for a match, tap Watch Free to view it in the app.
          </p>
          <p>
            <strong className="text-gray-800">🟡 ~10 Min Updates</strong> — RTÉ Sport, BBC Sport,
            and HoganStand RSS feeds are checked every 10 minutes.
          </p>
          <p className="text-xs text-gray-400 pt-2 border-t border-gray-200">
            GAA Live does not host video. All streams link to public YouTube content.
            Fixture data: TheSportsDB (CC). Results may lag by up to 15 minutes post-game.
          </p>
        </div>
      </section>

    </PageWrapper>
  )
}
