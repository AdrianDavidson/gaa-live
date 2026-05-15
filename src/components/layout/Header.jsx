import { useAuth, UserButton, SignInButton } from '@clerk/react'
import { useClubTheme } from '../../hooks/useClubTheme'

export default function Header() {
  const { isSignedIn } = useAuth()
  const theme = useClubTheme()

  return (
    <header
      className="bg-gaa-surface text-gaa-text px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b border-gaa-border"
      style={theme.primary ? { borderBottomColor: theme.primary } : undefined}
    >
      <div className="flex items-center gap-2">
        {theme.crest && (
          <img
            src={theme.crest}
            alt=""
            className="w-7 h-7 object-contain rounded-full bg-white/10 p-0.5"
            aria-hidden="true"
          />
        )}
        <span className="font-barlow text-2xl font-black tracking-tight text-gaa-text">Cork Minor</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-gaa-text-muted">Hurling</span>
        {isSignedIn
          ? <UserButton afterSignOutUrl="/" />
          : <SignInButton mode="modal">
              <button className="text-xs font-bold bg-gaa-surface-raised text-gaa-text rounded-lg px-3 py-1.5 border border-gaa-border hover:border-gaa-minor transition-colors">
                Sign in
              </button>
            </SignInButton>
        }
      </div>
    </header>
  )
}
