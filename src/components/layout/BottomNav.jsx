import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/',         label: 'Home',     icon: '🏠' },
  { to: '/live',     label: 'Live',     icon: '🟢' },
  { to: '/fixtures', label: 'Fixtures', icon: '📅' },
  { to: '/results',  label: 'Results',  icon: '📊' },
  { to: '/settings', label: 'Settings', icon: '⚙️'  },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10"
      aria-label="Main navigation"
    >
      <ul className="flex" role="list">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] w-full text-xs font-medium transition-colors ${
                  isActive ? 'text-gaa-green' : 'text-gray-500 hover:text-gray-700'
                }`
              }
            >
              <span className="text-xl" aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
