import { DATA_TIERS } from '../../services/dataTierResolver'

const TIER_CONFIG = {
  [DATA_TIERS.STREAM]: {
    label:     'LIVE ▶',
    className: 'bg-gaa-green text-white',
    pulse:     true,
    title:     'Free live stream available — tap to watch',
  },
  [DATA_TIERS.LIVE]: {
    label:     'LIVE SCORE',
    className: 'bg-gaa-live text-white',
    pulse:     true,
    title:     'Live score updates',
  },
  [DATA_TIERS.POLLED]: {
    label:     'NEWS UPDATE',
    className: 'bg-amber-100 text-amber-800',
    pulse:     false,
    title:     'Latest headlines from RTÉ Sport, BBC Sport & Hoganstand — checked every 2 minutes',
  },
  [DATA_TIERS.NONE]: {
    label:     'AFTER FULL TIME',
    className: 'bg-gray-100 text-gray-500',
    pulse:     false,
    title:     'Score will appear here shortly after the match ends',
  },
}

export default function TierBadge({ tier }) {
  const config = TIER_CONFIG[tier] ?? TIER_CONFIG[DATA_TIERS.NONE]
  return (
    <span
      className={`${config.className} text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1`}
      title={config.title}
      aria-label={config.title}
    >
      {config.pulse && (
        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" aria-hidden="true" />
      )}
      {config.label}
    </span>
  )
}
