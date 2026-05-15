import { useState }              from 'react'
import { Link }                  from 'react-router-dom'
import { useAuth, UserButton, SignInButton, SignUpButton } from '@clerk/react'
import { X, Plus, ChevronRight, CloudUpload } from 'lucide-react'
import PageWrapper                from '../components/layout/PageWrapper'
import NotificationToggle         from '../components/notifications/NotificationToggle'
import { useAppStore }            from '../store/appStore'
import { useClubs }               from '../hooks/useClubs'
import { useClubTheme }           from '../hooks/useClubTheme'
import { useClubNotifications }   from '../hooks/useClubNotifications'

// ─── Club picker modal ────────────────────────────────────────────────────────

function ClubPickerModal({ clubs, onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const filtered = clubs.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Pick your club"
    >
      <div className="bg-gaa-surface w-full max-w-lg rounded-t-2xl p-4 pb-8 border-t border-gaa-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-gaa-text">Pick your club</h2>
          <button onClick={onClose} className="text-gaa-text-muted min-h-[44px] px-2">
            <X size={20} />
          </button>
        </div>
        <input
          type="search"
          placeholder="Search clubs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gaa-border rounded-lg px-3 py-2 text-base mb-3 bg-gaa-surface-raised text-gaa-text focus:outline-none focus:ring-2 focus:ring-gaa-minor"
          autoFocus
        />
        <ul className="max-h-64 overflow-y-auto divide-y divide-gaa-border">
          {filtered.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => { onSelect(c); onClose() }}
                className="w-full text-left flex items-center gap-3 py-3 px-1 min-h-[48px]"
              >
                {c.crest_url && (
                  <img src={c.crest_url} alt="" className="w-6 h-6 object-contain rounded-sm" aria-hidden="true" />
                )}
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ background: `linear-gradient(135deg, ${c.primary_colour} 50%, ${c.secondary_colour ?? '#888'} 50%)` }}
                  aria-hidden="true"
                />
                <span className="font-semibold text-sm text-gaa-text">{c.name}</span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="py-6 text-center text-gaa-text-muted text-sm">No clubs found</li>
          )}
        </ul>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Settings() {
  const [showClubPicker, setShowClubPicker]       = useState(false)
  const [showFollowPicker, setShowFollowPicker]   = useState(false)

  const { isSignedIn, getToken } = useAuth()
  const { setHomeClub }          = useAppStore()
  const { data: clubs = [] }     = useClubs()
  const theme                    = useClubTheme()
  const { followedClubs, followClub, unfollowClub } = useClubNotifications()

  async function saveHomeClub(club) {
    setHomeClub(club.id)
    if (isSignedIn) {
      const token = await getToken()
      await fetch('/api/user/profile', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ homeClubId: club.id }),
      })
    }
  }

  return (
    <PageWrapper title="Settings">

      {/* ── Club identity ───────────────────────────────────────────────── */}
      <section className="mb-6" aria-labelledby="club-heading">
        <h2 id="club-heading" className="text-base font-bold text-gray-700 mb-3">Your Club</h2>

        <div
          className="flex items-center gap-3 p-3 rounded-xl border"
          style={theme.name
            ? { background: `${theme.primary}11`, borderColor: `${theme.primary}33` }
            : { background: '#f9fafb', borderColor: '#e5e7eb' }
          }
        >
          {theme.crest && (
            <img src={theme.crest} alt="" className="w-10 h-10 object-contain rounded-full" aria-hidden="true" />
          )}
          {!theme.crest && (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
              <span className="text-gray-400 text-xs">?</span>
            </div>
          )}
          <div className="flex-1">
            <p className="font-bold text-sm text-gray-900">{theme.name ?? 'No club selected'}</p>
            <p className="text-xs text-gray-500">Cork Minor Hurling Fan</p>
          </div>
          <button
            onClick={() => setShowClubPicker(true)}
            className="text-xs font-bold text-gaa-minor border border-gaa-minor rounded-lg px-3 py-2 min-h-[40px]"
          >
            {theme.name ? 'Change' : 'Choose club'}
          </button>
        </div>

        {isSignedIn
          ? <div className="mt-3 flex items-center gap-2"><UserButton /><span className="text-sm text-gray-500">Account</span></div>
          : (
            <div className="mt-4 rounded-xl bg-blue-50 border border-blue-100 p-4 flex gap-3 items-start">
              <CloudUpload size={20} className="text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-bold text-blue-800 mb-0.5">Save your club across devices</p>
                <p className="text-xs text-blue-500 mb-3">Create a free account and your club selection syncs everywhere you use the app.</p>
                <div className="flex gap-2">
                  <SignUpButton mode="modal">
                    <button className="bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-lg min-h-[36px]">
                      Create account
                    </button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <button className="text-blue-600 text-xs font-bold px-3 py-2 rounded-lg border border-blue-200 min-h-[36px]">
                      Sign in
                    </button>
                  </SignInButton>
                </div>
              </div>
            </div>
          )
        }
      </section>

      {/* ── Club notifications ───────────────────────────────────────────── */}
      <section className="mb-6" aria-labelledby="club-notif-heading">
        <h2 id="club-notif-heading" className="text-base font-bold text-gray-700 mb-1">Club Notifications</h2>
        <p className="text-xs text-gray-400 mb-3">Get notified on every score update</p>

        {followedClubs.length > 0 && (
          <ul className="space-y-2 mb-3">
            {followedClubs.map((club) => (
              <li key={club} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <span className="text-sm font-semibold text-gray-900">{club}</span>
                <button
                  onClick={() => unfollowClub(club)}
                  className="text-gray-400 hover:text-red-500 min-h-[36px] px-1"
                  aria-label={`Unfollow ${club}`}
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={() => setShowFollowPicker(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-gaa-minor min-h-[44px]"
        >
          <Plus size={14} />
          Follow another club
        </button>
      </section>

      {/* ── Push notifications (existing) ───────────────────────────────── */}
      <section className="mb-6" aria-labelledby="notif-heading">
        <h2 id="notif-heading" className="text-base font-bold text-gray-700 mb-2">
          Senior Match Alerts
        </h2>
        <NotificationToggle />
      </section>

      {/* ── Senior results link ──────────────────────────────────────────── */}
      <section className="mb-6">
        <Link
          to="/senior"
          className="flex items-center justify-between text-sm text-gray-500 hover:text-gray-700 min-h-[44px]"
        >
          Senior county results
          <ChevronRight size={16} className="text-gray-400" />
        </Link>
      </section>

      {/* Modals */}
      {showClubPicker && (
        <ClubPickerModal
          clubs={clubs}
          onSelect={(c) => saveHomeClub(c)}
          onClose={() => setShowClubPicker(false)}
        />
      )}
      {showFollowPicker && (
        <ClubPickerModal
          clubs={clubs.filter((c) => !followedClubs.includes(c.name))}
          onSelect={(c) => followClub(c.name)}
          onClose={() => setShowFollowPicker(false)}
        />
      )}

    </PageWrapper>
  )
}
