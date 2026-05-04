import { COUNTY_COLOURS } from '../../utils/countyColours'

export default function CountyColourBadge({ teamName }) {
  const colours = COUNTY_COLOURS[teamName]
  if (!colours) return null
  return (
    <span
      className="inline-block w-4 h-4 rounded-full shrink-0"
      style={{
        background: `linear-gradient(to right, ${colours.primary} 50%, ${colours.secondary} 50%)`,
        border: '1px solid rgba(0,0,0,0.15)',
      }}
      aria-hidden="true"
    />
  )
}
