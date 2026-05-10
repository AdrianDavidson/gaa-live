import { NavLink }                                    from 'react-router-dom'
import { CalendarDays, List, Trophy, UserCircle }     from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',          label: 'Today',    Icon: CalendarDays },
  { to: '/fixtures',  label: 'Fixtures', Icon: List         },
  { to: '/table',     label: 'Table',    Icon: Trophy       },
  { to: '/settings',  label: 'Settings', Icon: UserCircle   },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10"
      aria-label="Main navigation"
    >
      <ul className="flex" role="list">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] w-full text-xs font-semibold transition-colors ${
                  isActive
                    ? 'text-gaa-minor'
                    : 'text-gray-400 hover:text-gray-600 active:text-gaa-minor'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="absolute top-0 left-2 right-2 h-0.5 bg-gaa-minor rounded-b-full"
                      aria-hidden="true"
                    />
                  )}
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.75}
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
