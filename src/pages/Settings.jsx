import { useState, useEffect }  from 'react'
import { Link }                  from 'react-router-dom'
import { useAuth, UserButton, SignInButton, SignUpButton } from '@clerk/react'
import { X, Plus, ChevronRight, Download, Bell, BellOff } from 'lucide-react'
import PageWrapper                from '../components/layout/PageWrapper'
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-label="Pick your club"
      onClick={onClose}
    >
      <div
        className="bg-gaa-surface w-full max-w-lg rounded-t-2xl p-4 pb-10 border-t border-gaa-border"
        onClick={(e) => e.stopPropagation()}
      >
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
          className="w-full border border-gaa-border rounded-xl px-3 py-2.5 text-sm mb-3 bg-gaa-surface-raised text-gaa-text placeholder:text-gaa-text-muted focus:outline-none focus:ring-2 focus:ring-gaa-minor"
          autoFocus
        />
        <ul className="max-h-64 overflow-y-auto divide-y divide-gaa-border">
          {filtered.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => { onSelect(c); onClose() }}
                className="w-full text-left flex items-center gap-3 py-3 px-1 min-h-[48px]"
              >
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
  const [showClubPicker,   setShowClubPicker]   = useState(false)
  const [showFollowPicker, setShowFollowPicker] = useState(false)
  const [installPrompt,    setInstallPrompt]    = useState(null)
  const [isInstalled,      setIsInstalled]      = useState(false)

  const { isSignedIn, getToken } = useAuth()
  const { setHomeClub }          = useAppStore()
  const { data: clubs = [] }     = useClubs()
  const theme                    = useClubTheme()
  const { followedClubs, followClub, unfollowClub } = useClubNotifications()

  // PWA install prompt
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function installApp() {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstallPrompt(null)
  }

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

  // Map club name → full club object for swatches
  const clubByName = Object.fromEntries(clubs.map((c) => [c.name, c]))

  const Row = ({ children }) => (
    <div className="bg-gaa-surface border border-gaa-border rounded-2xl overflow-hidden mb-4">
      {children}
    </div>
  )

  const SectionLabel = ({ children }) => (
    <p className="text-[11px] font-bold text-gaa-text-muted uppercase tracking-wider mb-2 px-1">{children}</p>
  )

  return (
    <PageWrapper title="Settings">

      {/* ── Your Club ───────────────────────────────────────────────────── */}
      <SectionLabel>Your Club</SectionLabel>
      <Row>
        <div className="flex items-center gap-3 p-4">
          <div
            className="w-10 h-10 rounded-full shrink-0 border-2"
            style={theme.primary
              ? { background: `linear-gradient(135deg, ${theme.primary} 50%, ${theme.secondary ?? '#888'} 50%)`, borderColor: `${theme.primary}55` }
              : { background: '#333', borderColor: '#444' }
            }
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-gaa-text truncate">{theme.name ?? 'No club selected'}</p>
            <p className="text-xs text-gaa-text-muted">Cork Minor Hurling</p>
          </div>
          <button
            onClick={() => setShowClubPicker(true)}
            className="text-xs font-bold text-gaa-minor border border-gaa-minor rounded-lg px-3 py-2 min-h-[40px] shrink-0"
          >
            {theme.name ? 'Change' : 'Choose'}
          </button>
        </div>
      </Row>

      {/* ── Account ─────────────────────────────────────────────────────── */}
      <SectionLabel>Account</SectionLabel>
      <Row>
        {isSignedIn ? (
          <div className="flex items-center gap-3 p-4">
            <UserButton />
            <div>
              <p className="text-sm font-semibold text-gaa-text">Signed in</p>
              <p className="text-xs text-gaa-text-muted">Your club syncs across devices</p>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <p className="text-sm font-bold text-gaa-text mb-1">Save your club across devices</p>
            <p className="text-xs text-gaa-text-muted mb-4">Create a free account and your club selection syncs everywhere you use the app.</p>
            <div className="flex gap-2">
              <SignUpButton mode="modal">
                <button className="bg-gaa-minor text-white text-xs font-bold px-4 py-2.5 rounded-xl min-h-[40px]">
                  Create account
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="text-gaa-text text-xs font-bold px-4 py-2.5 rounded-xl border border-gaa-border min-h-[40px]">
                  Sign in
                </button>
              </SignInButton>
            </div>
          </div>
        )}
      </Row>

      {/* ── Club Notifications ───────────────────────────────────────────── */}
      <SectionLabel>Club Notifications</SectionLabel>
      <Row>
        <div className="p-4">
          <p className="text-xs text-gaa-text-muted mb-3">Get a push notification on every score update for the clubs you follow.</p>

          {followedClubs.length > 0 && (
            <ul className="space-y-2 mb-3">
              {followedClubs.map((clubName) => {
                const club = clubByName[clubName]
                return (
                  <li key={clubName} className="flex items-center gap-3 bg-gaa-surface-raised border border-gaa-border rounded-xl px-3 py-2.5">
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={club
                        ? { background: `linear-gradient(135deg, ${club.primary_colour} 50%, ${club.secondary_colour ?? '#888'} 50%)` }
                        : { background: '#555' }
                      }
                      aria-hidden="true"
                    />
                    <span className="text-sm font-semibold text-gaa-text flex-1">{clubName}</span>
                    <button
                      onClick={() => unfollowClub(clubName)}
                      className="text-gaa-text-muted hover:text-red-400 min-h-[36px] px-1 transition-colors"
                      aria-label={`Unfollow ${clubName}`}
                    >
                      <X size={15} />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {followedClubs.length === 0 && (
            <p className="text-xs text-gaa-text-muted italic mb-3">No clubs followed yet.</p>
          )}

          <button
            onClick={() => setShowFollowPicker(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-gaa-minor min-h-[44px]"
          >
            <Plus size={14} />
            Follow a club
          </button>
        </div>
      </Row>

      {/* ── Install App ─────────────────────────────────────────────────── */}
      {!isInstalled && installPrompt && (
        <>
          <SectionLabel>App</SectionLabel>
          <Row>
            <button
              onClick={installApp}
              className="w-full flex items-center gap-3 p-4 text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-gaa-minor flex items-center justify-center shrink-0">
                <Download size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gaa-text">Add to Home Screen</p>
                <p className="text-xs text-gaa-text-muted">Install for quick access, works offline</p>
              </div>
              <ChevronRight size={16} className="text-gaa-text-muted shrink-0" />
            </button>
          </Row>
        </>
      )}

      {/* ── More ────────────────────────────────────────────────────────── */}
      <SectionLabel>More</SectionLabel>
      <Row>
        <Link
          to="/senior"
          className="flex items-center justify-between p-4 text-sm text-gaa-text min-h-[52px]"
        >
          <span className="font-semibold">Senior county results</span>
          <ChevronRight size={16} className="text-gaa-text-muted" />
        </Link>
      </Row>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <p className="text-center text-[11px] text-gaa-text-muted mt-6 mb-2 opacity-50">
        Cork Minor Hurling · Built for the fans
      </p>

      {/* Modals */}
      {showClubPicker && (
        <ClubPickerModal
          clubs={clubs}
          onSelect={saveHomeClub}
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
