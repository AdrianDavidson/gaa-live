import { useCodeFilter } from '../../contexts/CodeFilterContext'
import CodeIcon          from './CodeIcon'

const OPTIONS = [
  { value: 'all',      label: 'All',      icon: null },
  { value: 'football', label: 'Football', icon: 'football' },
  { value: 'hurling',  label: 'Hurling',  icon: 'hurling'  },
]

export default function CodeToggle() {
  const { filter, setFilter } = useCodeFilter()

  return (
    <fieldset className="w-full sm:max-w-[240px] border-0 p-0 m-0">
      <legend className="sr-only">Filter by code</legend>
      <div className="flex rounded-lg border border-gray-300 overflow-hidden" role="group">
        {OPTIONS.map(({ value, label, icon }) => {
          const active = filter === value
          return (
            <label
              key={value}
              className={`flex-1 relative cursor-pointer select-none
                ${active
                  ? 'bg-gaa-green text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                }
                focus-within:ring-2 focus-within:ring-inset focus-within:ring-gaa-green
                transition-colors
              `}
            >
              <input
                type="radio"
                name="code-filter"
                value={value}
                checked={active}
                onChange={() => setFilter(value)}
                className="sr-only"
              />
              <span className="flex items-center justify-center gap-1.5 min-h-[44px] text-sm font-bold px-2">
                {icon && (
                  <CodeIcon
                    code={icon}
                    size={14}
                    className={active ? 'text-white' : 'text-gray-500'}
                  />
                )}
                {label}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
