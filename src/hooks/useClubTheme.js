import { useAppStore } from '../store/appStore'
import { useClubs }    from './useClubs'

export function useClubTheme() {
  const homeClubId = useAppStore((s) => s.homeClubId)
  const { data: clubs } = useClubs()
  const club = clubs?.find((c) => c.id === homeClubId)
  return {
    primary:   club?.primary_colour   ?? '#006633',
    secondary: club?.secondary_colour ?? '#FFFFFF',
    crest:     club?.crest_url        ?? null,
    name:      club?.name             ?? null,
  }
}
