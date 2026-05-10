import { useState, useEffect } from 'react'
import { useAuth }             from '@clerk/react'
import Spinner                 from '../components/ui/Spinner'

const PERIODS = ['Q1', 'HT', 'Q2', 'FT']

function ScoreInput({ label, goals, points, onGoals, onPoints }) {
  return (
    <div className="mb-4">
      <p className="font-bold text-sm text-gray-900 mb-2">{label}</p>
      <div className="flex items-center gap-3">
        <div>
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wide block mb-1">Goals</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={9}
            value={goals}
            onChange={(e) => onGoals(Math.max(0, Math.min(9, Number(e.target.value))))}
            className="w-16 text-center border-2 border-gray-300 rounded-xl text-xl font-black py-3 focus:outline-none focus:border-gaa-minor"
          />
        </div>
        <span className="text-xl font-black text-gray-300 mt-4">–</span>
        <div>
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wide block mb-1">Points</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={30}
            value={String(points).padStart(2, '0')}
            onChange={(e) => onPoints(Math.max(0, Math.min(30, Number(e.target.value))))}
            className="w-20 text-center border-2 border-gray-300 rounded-xl text-xl font-black py-3 focus:outline-none focus:border-gaa-minor"
          />
        </div>
      </div>
    </div>
  )
}

export default function Submit() {
  const { getToken } = useAuth()

  const [game, setGame]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [homeGoals, setHG]    = useState(0)
  const [homePoints, setHP]   = useState(0)
  const [awayGoals, setAG]    = useState(0)
  const [awayPoints, setAP]   = useState(0)
  const [period, setPeriod]   = useState('Q1')
  const [status, setStatus]   = useState(null)
  const [submitting, setSub]  = useState(false)
  const [lastSaved, setLast]  = useState(null)

  useEffect(() => {
    async function loadGame() {
      try {
        const token = await getToken()
        const today = new Date().toISOString().split('T')[0]
        const res   = await fetch(`/api/games?date=${today}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const games = await res.json()
        if (games.length) setGame(games[0])
      } catch (e) {
        setStatus('error')
      } finally {
        setLoading(false)
      }
    }
    loadGame()
  }, [getToken])

  async function handleSubmit() {
    if (!game) return
    setSub(true)
    setStatus(null)
    try {
      const token = await getToken()
      const res   = await fetch('/api/submit-score', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({
          gameId:    game.id,
          homeScore: `${homeGoals}-${String(homePoints).padStart(2, '0')}`,
          awayScore: `${awayGoals}-${String(awayPoints).padStart(2, '0')}`,
          period,
        }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setLast(new Date())
    } catch {
      setStatus('error')
    } finally {
      setSub(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-4 max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900">Minor Score Entry</h1>
          {game && <p className="text-xs text-gray-400 mt-0.5">{game.competition_short}</p>}
        </div>
        <a href="/" className="text-xs font-bold text-gaa-minor">← Back</a>
      </div>

      {loading && <Spinner label="Loading your game…" />}

      {!loading && !game && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          No game assigned for today. Contact the county board.
        </div>
      )}

      {!loading && game && (
        <>
          {/* Game info */}
          <div className="bg-gaa-minor-soft border border-purple-200 rounded-xl p-3 mb-5">
            <p className="text-xs font-bold text-gaa-minor">{game.competition_short}</p>
            <p className="text-sm font-black text-gray-900 mt-0.5">
              {game.home_team} vs {game.away_team}
            </p>
            {game.venue && <p className="text-xs text-gray-400 mt-0.5">{game.venue}</p>}
          </div>

          {/* Score inputs */}
          <ScoreInput
            label={game.home_team}
            goals={homeGoals} points={homePoints}
            onGoals={setHG}   onPoints={setHP}
          />
          <ScoreInput
            label={game.away_team}
            goals={awayGoals} points={awayPoints}
            onGoals={setAG}   onPoints={setAP}
          />

          {/* Period */}
          <div className="mb-6">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-2">Period</p>
            <div className="flex gap-2">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-black border-2 transition-colors ${
                    period === p
                      ? 'bg-gaa-minor text-white border-gaa-minor'
                      : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-gaa-minor text-white font-black text-base py-4 rounded-xl disabled:opacity-50 transition-opacity min-h-[56px]"
          >
            {submitting ? 'Saving…' : 'Submit Score'}
          </button>

          {status === 'success' && (
            <p className="text-center text-green-700 font-bold text-sm mt-3">
              Score saved ✓{lastSaved && ` · ${lastSaved.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })}`}
            </p>
          )}
          {status === 'error' && (
            <p className="text-center text-red-600 font-bold text-sm mt-3">Failed — try again</p>
          )}
          {lastSaved && status !== 'success' && (
            <p className="text-center text-xs text-gray-400 mt-2">
              Last saved: {period} · {lastSaved.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </>
      )}
    </div>
  )
}
