import { Check }             from 'lucide-react'
import PageWrapper            from '../components/layout/PageWrapper'
import NotificationToggle     from '../components/notifications/NotificationToggle'
import { useAppStore }        from '../store/appStore'
import { ALL_COUNTIES, COUNTY_COLOURS } from '../utils/countyColours'

const FONT_SIZES = [
  { value: 'medium', label: 'Medium' },
  { value: 'large',  label: 'Large'  },
  { value: 'xl',     label: 'Extra Large' },
]

function ThemeSwatch({ primary, secondary, size = 28 }) {
  return (
    <span
      className="rounded-full inline-block shrink-0"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${primary} 50%, ${secondary} 50%)`,
        border: '2px solid rgba(0,0,0,0.12)',
      }}
      aria-hidden="true"
    />
  )
}

function ThemeCard({ id, name, description, primary, secondary, active, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-center transition-all min-h-[100px] ${
        active
          ? 'border-gaa-green bg-white shadow-sm'
          : disabled
          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      {active && (
        <span className="absolute top-2 right-2 w-5 h-5 bg-gaa-green rounded-full flex items-center justify-center">
          <Check size={12} strokeWidth={3} className="text-white" />
        </span>
      )}
      <ThemeSwatch primary={primary} secondary={secondary} size={32} />
      <div>
        <p className="text-xs font-bold text-gray-800 leading-tight">{name}</p>
        <p className="text-xs text-gray-500 leading-tight mt-0.5">{description}</p>
      </div>
    </button>
  )
}

export default function Settings() {
  const {
    favouriteCounty, setFavouriteCounty,
    fontSize,        setFontSize,
    darkMode,        toggleDarkMode,
    theme,           setTheme,
    notificationsEnabled,
  } = useAppStore()

  const countyColours = favouriteCounty ? COUNTY_COLOURS[favouriteCounty] : null

  const THEMES = [
    {
      id:          'default',
      name:        'Default',
      description: 'Classic GAA',
      primary:     '#006633',
      secondary:   '#FFD700',
      disabled:    false,
    },
    {
      id:          'county',
      name:        'County',
      description: favouriteCounty ?? 'Set county first',
      primary:     countyColours?.primary   ?? '#aaaaaa',
      secondary:   countyColours?.secondary ?? '#cccccc',
      disabled:    !favouriteCounty,
    },
    {
      id:          'professional',
      name:        'Pro',
      description: 'Refined gold',
      primary:     '#005C2E',
      secondary:   '#C9A84C',
      disabled:    false,
    },
  ]

  function handleSetTheme(id) {
    if (id === 'county' && !favouriteCounty) return
    setTheme(id)
  }

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

      {/* Appearance — theme + dark mode */}
      <section className="mb-6" aria-labelledby="appearance-heading">
        <h2 id="appearance-heading" className="text-base font-bold text-gray-700 mb-3">
          Appearance
        </h2>

        {/* Theme picker */}
        <p className="text-xs text-gray-500 mb-2">Colour theme</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {THEMES.map((t) => (
            <ThemeCard
              key={t.id}
              id={t.id}
              name={t.name}
              description={t.description}
              primary={t.primary}
              secondary={t.secondary}
              active={theme === t.id}
              disabled={t.disabled}
              onClick={() => handleSetTheme(t.id)}
            />
          ))}
        </div>

        {theme === 'county' && !favouriteCounty && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
            Select a favourite county above to use county colours.
          </p>
        )}

        {/* Dark mode toggle */}
        <p className="text-xs text-gray-500 mb-2">Mode</p>
        <button
          onClick={toggleDarkMode}
          aria-pressed={darkMode}
          className="flex items-center gap-3 min-h-[48px] text-base font-medium text-gray-800 w-full"
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

      {/* Foireann API */}
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
              <li>You need to be a <strong>Club Administrator</strong> on Foireann</li>
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
            <strong className="text-gray-800">Live news</strong> — RTÉ Sport, BBC Sport, and
            Hoganstand RSS feeds are checked every 2 minutes during match windows.
          </p>
          <p className="text-xs text-gray-400 pt-2 border-t border-gray-200">
            GAA Live does not host video. All streams link to public YouTube content.
            Fixture data: TheSportsDB (CC). Results may lag by up to 10 minutes post-game.
          </p>
        </div>
      </section>

    </PageWrapper>
  )
}
