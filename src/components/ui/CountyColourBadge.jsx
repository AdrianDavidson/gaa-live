import { useId } from 'react'
import { COUNTY_COLOURS, COUNTY_ABBREV, getTextColor } from '../../utils/countyColours'

export default function CountyColourBadge({ teamName }) {
  const colours = COUNTY_COLOURS[teamName]
  const uid     = useId()
  if (!colours) return null

  const abbrev  = COUNTY_ABBREV[teamName] ?? teamName.slice(0, 3).toUpperCase()
  const textCol = getTextColor(colours.primary)
  const clipId  = `sc-${uid.replace(/:/g, '')}`

  return (
    <svg
      width="22"
      height="26"
      viewBox="0 0 30 35"
      role="img"
      aria-label={`${teamName} county badge`}
      className="shrink-0"
    >
      <defs>
        {/* Shield silhouette used as a clip path for the diagonal fill */}
        <clipPath id={clipId}>
          <path d="M2,2 L28,2 L28,21 Q28,31 15,34 Q2,31 2,21 Z" />
        </clipPath>
      </defs>

      {/* Shield body — primary county colour */}
      <path
        d="M2,2 L28,2 L28,21 Q28,31 15,34 Q2,31 2,21 Z"
        fill={colours.primary}
      />

      {/* Diagonal secondary fill — top-right triangle, clipped to shield */}
      <polygon
        points="28,2 28,23 2,2"
        fill={colours.secondary}
        opacity="0.6"
        clipPath={`url(#${clipId})`}
      />

      {/* Thin outline for definition */}
      <path
        d="M2,2 L28,2 L28,21 Q28,31 15,34 Q2,31 2,21 Z"
        fill="none"
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="1.5"
      />

      {/* County abbreviation — centred in the lower body of the shield */}
      <text
        x="15"
        y="21"
        textAnchor="middle"
        fill={textCol}
        fontSize="7.5"
        fontWeight="800"
        fontFamily="system-ui,-apple-system,Arial,sans-serif"
        letterSpacing="0.4"
      >
        {abbrev}
      </text>
    </svg>
  )
}
