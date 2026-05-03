import { useYouTubeStream } from '../../hooks/useYouTubeStream'
import EmbedPlayer from './EmbedPlayer'
import Spinner from '../ui/Spinner'

export default function StreamFinder({ fixture }) {
  const searchTerm = `${fixture.homeTeam} ${fixture.awayTeam} GAA`
  const { data: stream, isLoading } = useYouTubeStream(searchTerm)

  if (isLoading) return <Spinner label="Looking for streams…" />
  if (!stream)   return null

  return <EmbedPlayer stream={stream} />
}
