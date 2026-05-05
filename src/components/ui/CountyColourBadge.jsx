import { useState, useId } from 'react'
import { COUNTY_COLOURS, COUNTY_ABBREV, COUNTY_CRESTS, getTextColor } from '../../utils/countyColours'

export default function CountyColourBadge({ teamName }) {
  const [imgFailed, setImgFailed] = useState(false)
  const uid     = useId()
  const colours = COUNTY_COLOURS[teamName]

  if (!colours) return null

  const crestUrl = COUNTY_CRESTS[teamName]
  const abbrev   = COUNTY_ABBREV[teamName] ?? teamName.slice(0, 3).toUpperCase()
  const textCol  = getTextColor(colours.primary)
  const clipId   = `sc-${uid.replace(/:/g, '')}`

  if (crestUrl && !imgFailed) {
    return (
      <img
        src={crestUrl}
        alt={`${teamName} GAA crest`}
        width={22}
        height={26}
        className="shrink-0 object-contain"
        onError={() => setImgFailed(true)}
      />
    )
  }

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
        <clipPath id={clipId}>
          <path d="M2,2 L28,2 L28,21 Q28,31 15,34 Q2,31 2,21 Z" />
        </clipPath>
      </defs>
      <path
        d="M2,2 L28,2 L28,21 Q28,31 15,34 Q2,31 2,21 Z"
        fill={colours.primary}
      />
      <polygon
        points="28,2 28,23 2,2"
        fill={colours.secondary}
        opacity="0.6"
        clipPath={`url(#${clipId})`}
      />
      <path
        d="M2,2 L28,2 L28,21 Q28,31 15,34 Q2,31 2,21 Z"
        fill="none"
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="1.5"
      />
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
