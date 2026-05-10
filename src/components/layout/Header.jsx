import { useAuth, UserButton, SignInButton } from '@clerk/react'
import { useClubTheme } from '../../hooks/useClubTheme'

export default function Header() {
  const { isSignedIn } = useAuth()
  const theme = useClubTheme()

  return (
    <header
      className="text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10"
      style={{ backgroundColor: theme.primary }}
    >
      <div className="flex items-center gap-2">
        {theme.crest && (
          <img
            src={theme.crest}
            alt=""
            className="w-7 h-7 object-contain rounded-full bg-white/20 p-0.5"
            aria-hidden="true"
          />
        )}
        <span className="text-2xl font-black tracking-tight">Cork Minor</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium opacity-80">Hurling</span>
        {isSignedIn
          ? <UserButton afterSignOutUrl="/" />
          : <SignInButton mode="modal">
              <button className="text-xs font-bold bg-white/20 rounded-lg px-3 py-1.5 hover:bg-white/30 transition-colors">
                Sign in
              </button>
            </SignInButton>
        }
      </div>
    </header>
  )
}
