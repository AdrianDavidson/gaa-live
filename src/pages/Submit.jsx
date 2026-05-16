import { useState, useEffect, useRef } from 'react'
import { useAuth }                      from '@clerk/react'
import { Link }                         from 'react-router-dom'
import { Undo2 }                        from 'lucide-react'
import { useAppStore }                  from '../store/appStore'

const PERIODS = ['Q1', 'HT', 'Q2', 'FT']

function parseScore(str) {
  if (!str) return { g: 0, p: 0 }
  const [g = 0, p = 0] = str.split('-').map(Number)
  return { g: Number(g) || 0, p: Number(p) || 0 }
}

function Toast({ toast }) {
  if (!toast) return null
  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg pointer-events-none ${
        toast.type === 'success'
          ? 'bg-emerald-900 text-emerald-200 border border-emerald-700'
          : 'bg-red-900 text-red-200 border border-red-700'
      }`}
      role="status"
      aria-live="polite"
    >
      {toast.msg}
    </div>
  )
}

function ScoreButtons({ label, goals, points, onGoal, onPoint, onMinus }) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-gaa-text-muted uppercase tracking-wider truncate mr-2">{label}</p>
        <span className="font-barlow text-3xl font-black text-gaa-text tabular-nums shrink-0">
          {goals}-{String(points).padStart(2, '0')}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onGoal}
          className="flex-1 h-14 rounded-xl font-black text-white flex flex-col items-center justify-center gap-0.5 transition-opacity active:opacity-70"
          style={{ backgroundColor: '#e8a020' }}
          aria-label={`Goal for ${label}`}
        >
          <span className="text-[10px] opacity-75 font-bold uppercase">Goal</span>
          <span className="text-base leading-none">+3</span>
        </button>
        <button
          onClick={onPoint}
          className="flex-1 h-14 rounded-xl bg-gaa-minor font-black text-white flex flex-col items-center justify-center gap-0.5 transition-opacity active:opacity-70"
          aria-label={`Point for ${label}`}
        >
          <span className="text-[10px] opacity-75 font-bold uppercase">Point</span>
          <span className="text-base leading-none">+1</span>
        </button>
        <button
          onClick={onMinus}
          className="w-14 h-14 rounded-xl bg-gaa-surface-raised text-gaa-text-muted text-2xl font-black border border-gaa-border transition-opacity active:opacity-70"
          aria-label={`Decrease ${label} score`}
        >
          −
        </button>
      </div>
    </div>
  )
}

function CardButtons({ label, yellow, red, onYellow, onRed }) {
  return (
    <div className="mb-1">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-gaa-text-muted uppercase tracking-wider truncate">{label}</p>
        <div className="flex gap-2 text-xs">
          {yellow > 0 && <span className="font-bold text-yellow-400">🟨 ×{yellow}</span>}
          {red > 0 && <span className="font-bold text-red-400">🟥 ×{red}</span>}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onYellow}
          className="flex-1 h-12 rounded-xl font-black text-gray-900 text-sm flex items-center justify-center gap-1.5 transition-opacity active:opacity-70"
          style={{ backgroundColor: '#fde047' }}
          aria-label={`Yellow card for ${label}`}
        >
          + Yellow
        </button>
        <button
          onClick={onRed}
          className="flex-1 h-12 rounded-xl bg-red-700 font-black text-white text-sm flex items-center justify-center gap-1.5 transition-opacity active:opacity-70"
          aria-label={`Red card for ${label}`}
        >
          + Red
        </button>
      </div>
    </div>
  )
}

export default function Submit() {
  const { getToken }   = useAuth()
  const homeClubId     = useAppStore((s) => s.homeClubId)

  const [game,      setGame]      = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [score,     setScore]     = useState({ hg: 0, hp: 0, ag: 0, ap: 0 })
  const [cards,     setCards]     = useState({ home: { yellow: 0, red: 0 }, away: { yellow: 0, red: 0 } })
  const [history,   setHistory]   = useState([])
  const [period,    setPeriod]    = useState('Q1')
  const [ftConfirm, setFtConfirm] = useState(false)
  const [toast,     setToast]     = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  const scoreRef       = useRef(score)
  const cardsRef       = useRef(cards)
  const periodRef      = useRef('Q1')
  const gameRef        = useRef(null)
  const doSubmitRef    = useRef(null)
  const submitTimer    = useRef(null)
  const ftConfirmTimer = useRef(null)
  const toastTimer     = useRef(null)

  useEffect(() => { scoreRef.current = score },  [score])
  useEffect(() => { cardsRef.current = cards },  [cards])
  useEffect(() => { periodRef.current = period }, [period])
  useEffect(() => { gameRef.current = game },    [game])

  useEffect(() => {
    if (!homeClubId) { setLoading(false); return }

    async function loadGame() {
      try {
        const today = new Date().toISOString().split('T')[0]
        const res   = await fetch(`/api/games?date=${today}`)
        const games = await res.json()
        const match = Array.isArray(games)
          ? games.find((g) => g.home_club?.id === homeClubId || g.away_club?.id === homeClubId)
          : null

        if (match) {
          setGame(match)
          const hs  = parseScore(match.home_score)
          const as_ = parseScore(match.away_score)
          setScore({ hg: hs.g, hp: hs.p, ag: as_.g, ap: as_.p })
          if (match.period) setPeriod(match.period)
        }
      } catch {
        showToast('Could not load your game', 'error')
      } finally {
        setLoading(false)
      }
    }

    loadGame()
    return () => {
      clearTimeout(submitTimer.current)
      clearTimeout(ftConfirmTimer.current)
      clearTimeout(toastTimer.current)
    }
  }, [homeClubId])

  function showToast(msg, type = 'success') {
    clearTimeout(toastTimer.current)
    setToast({ msg, type })
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }

  async function doSubmit() {
    const g = gameRef.current
    if (!g) return
    setSaving(true)
    try {
      const token = await getToken()
      const s     = scoreRef.current
      const res   = await fetch('/api/submit-score', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          gameId:    g.id,
          homeScore: `${s.hg}-${String(s.hp).padStart(2, '0')}`,
          awayScore: `${s.ag}-${String(s.ap).padStart(2, '0')}`,
          period:    periodRef.current,
        }),
      })
      if (!res.ok) throw new Error()
      setLastSaved(new Date())
      showToast('Saved ✓')
    } catch {
      showToast('Failed to save — try again', 'error')
    } finally {
      setSaving(false)
    }
  }

  doSubmitRef.current = doSubmit

  function scheduleSubmit(delay = 1200) {
    clearTimeout(submitTimer.current)
    submitTimer.current = setTimeout(() => doSubmitRef.current?.(), delay)
  }

  // Score change — snapshots current state to history and schedules a save
  function pushScore(updater) {
    setHistory((h) => [...h.slice(-9), { score: scoreRef.current, cards: cardsRef.current }])
    setScore(updater)
    scheduleSubmit()
  }

  // Card change — snapshots to history but does NOT trigger a save (cards are local-only for now)
  function pushCard(updater) {
    setHistory((h) => [...h.slice(-9), { score: scoreRef.current, cards: cardsRef.current }])
    setCards(updater)
  }

  function undo() {
    if (!history.length) return
    const prev = history[history.length - 1]
    setHistory((h) => h.slice(0, -1))
    setScore(prev.score)
    setCards(prev.cards)
    scheduleSubmit()
  }

  function handlePeriod(p) {
    if (p === 'FT' && !ftConfirm) {
      setFtConfirm(true)
      clearTimeout(ftConfirmTimer.current)
      ftConfirmTimer.current = setTimeout(() => setFtConfirm(false), 3000)
      return
    }
    setFtConfirm(false)
    clearTimeout(ftConfirmTimer.current)
    setPeriod(p)
    scheduleSubmit(300)
  }

  const fmtTime = (d) => d?.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })

  if (loading) {
    return (
      <div className="min-h-screen bg-gaa-bg p-4 max-w-sm mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-gaa-surface rounded-xl w-40" />
        <div className="h-16 bg-gaa-surface rounded-xl" />
        <div className="h-14 bg-gaa-surface rounded-xl" />
        <div className="h-14 bg-gaa-surface rounded-xl" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gaa-bg p-4 max-w-sm mx-auto pb-10">
      <Toast toast={toast} />

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-barlow text-2xl font-black text-gaa-text">Score Entry</h1>
          {game && <p className="text-xs text-gaa-text-muted mt-0.5">{game.competition_short}</p>}
        </div>
        <div className="flex items-center gap-3">
          {saving && <span className="text-[10px] text-gaa-amber animate-pulse font-bold">Saving…</span>}
          {lastSaved && !saving && (
            <span className="text-[10px] text-gaa-text-muted">Saved {fmtTime(lastSaved)}</span>
          )}
          <Link to="/" className="text-xs font-bold text-gaa-text-muted hover:text-gaa-text transition-colors">
            ← Back
          </Link>
        </div>
      </div>

      {/* No home club selected */}
      {!homeClubId && (
        <div className="bg-gaa-surface border border-gaa-border rounded-xl p-4 text-sm text-gaa-text-muted">
          Set your home club in{' '}
          <Link to="/settings" className="text-gaa-minor font-bold">Settings</Link>
          {' '}first, then come back here.
        </div>
      )}

      {/* Home club set but no game today */}
      {homeClubId && !game && (
        <div className="bg-gaa-surface border border-gaa-border rounded-xl p-4 text-sm text-gaa-text-muted">
          No game scheduled today for your club. Contact the county board if this is unexpected.
        </div>
      )}

      {/* Main score entry */}
      {game && (
        <>
          {/* Game info */}
          <div className="bg-gaa-surface border border-gaa-border rounded-xl p-3 mb-5">
            <p className="text-[11px] font-bold text-gaa-minor mb-0.5">{game.competition_short}</p>
            <p className="text-sm font-bold text-gaa-text">{game.home_team} vs {game.away_team}</p>
            {game.venue && <p className="text-xs text-gaa-text-muted mt-0.5">{game.venue}</p>}
          </div>

          {/* Score buttons — both teams */}
          {/* TODO: Remove away-team entry once per-game PRO assignment is enforced for all fixtures. */}
          <ScoreButtons
            label={game.home_team}
            goals={score.hg} points={score.hp}
            onGoal={() => pushScore((s) => ({ ...s, hg: s.hg + 1 }))}
            onPoint={() => pushScore((s) => ({ ...s, hp: s.hp + 1 }))}
            onMinus={() => pushScore((s) => {
              if (s.hp > 0) return { ...s, hp: s.hp - 1 }
              if (s.hg > 0) return { ...s, hg: s.hg - 1 }
              return s
            })}
          />

          <div className="border-t border-gaa-border my-4" />

          <ScoreButtons
            label={game.away_team}
            goals={score.ag} points={score.ap}
            onGoal={() => pushScore((s) => ({ ...s, ag: s.ag + 1 }))}
            onPoint={() => pushScore((s) => ({ ...s, ap: s.ap + 1 }))}
            onMinus={() => pushScore((s) => {
              if (s.ap > 0) return { ...s, ap: s.ap - 1 }
              if (s.ag > 0) return { ...s, ag: s.ag - 1 }
              return s
            })}
          />

          {/* Period */}
          <div className="mb-5">
            <p className="text-xs font-bold text-gaa-text-muted uppercase tracking-wider mb-2">Period</p>
            <div className="flex gap-2">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => handlePeriod(p)}
                  className={`flex-1 py-3 rounded-xl text-sm font-black border transition-colors ${
                    period === p
                      ? 'bg-gaa-minor text-white border-gaa-minor'
                      : p === 'FT' && ftConfirm
                        ? 'bg-red-900 text-red-200 border-red-700 animate-pulse'
                        : 'bg-gaa-surface text-gaa-text-muted border-gaa-border hover:border-gaa-text-muted'
                  }`}
                >
                  {p === 'FT' && ftConfirm ? 'Confirm?' : p}
                </button>
              ))}
            </div>
            {ftConfirm && (
              <p className="text-[10px] text-gaa-text-muted text-center mt-1.5">Tap FT again to confirm full time</p>
            )}
          </div>

          {/* Cards */}
          <div className="mb-5">
            <p className="text-xs font-bold text-gaa-text-muted uppercase tracking-wider mb-3">Cards</p>
            <CardButtons
              label={game.home_team}
              yellow={cards.home.yellow}
              red={cards.home.red}
              onYellow={() => pushCard((c) => ({ ...c, home: { ...c.home, yellow: c.home.yellow + 1 } }))}
              onRed={() => pushCard((c) => ({ ...c, home: { ...c.home, red: c.home.red + 1 } }))}
            />
            <div className="mt-3" />
            <CardButtons
              label={game.away_team}
              yellow={cards.away.yellow}
              red={cards.away.red}
              onYellow={() => pushCard((c) => ({ ...c, away: { ...c.away, yellow: c.away.yellow + 1 } }))}
              onRed={() => pushCard((c) => ({ ...c, away: { ...c.away, red: c.away.red + 1 } }))}
            />
          </div>

          {/* Undo — covers both score and card changes */}
          <button
            onClick={undo}
            disabled={!history.length}
            className="flex items-center gap-1.5 text-xs font-bold text-gaa-text-muted disabled:opacity-30 min-h-[44px] transition-opacity mb-6"
            aria-label="Undo last change"
          >
            <Undo2 size={14} aria-hidden="true" />
            Undo last change
            {history.length > 0 && <span className="opacity-50">({history.length})</span>}
          </button>

          {/* Live scorecard */}
          <div className="bg-gaa-surface border border-gaa-minor/30 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-gaa-minor uppercase tracking-wider mb-3">Live Scorecard</p>
            <div className="flex items-center gap-3">
              {/* Home */}
              <div className="flex-1 text-center">
                <p className="text-[11px] font-bold text-gaa-text truncate mb-1">{game.home_team}</p>
                <p className="font-barlow text-4xl font-black text-gaa-text tabular-nums leading-none">
                  {score.hg}-{String(score.hp).padStart(2, '0')}
                </p>
                {(cards.home.yellow > 0 || cards.home.red > 0) && (
                  <div className="flex justify-center items-center gap-2 mt-2 text-xs font-bold">
                    {cards.home.yellow > 0 && <span className="text-yellow-400">🟨 {cards.home.yellow}</span>}
                    {cards.home.red > 0 && <span className="text-red-400">🟥 {cards.home.red}</span>}
                  </div>
                )}
              </div>

              {/* Period pill */}
              <div className="shrink-0 text-center">
                <span className="text-[11px] font-black text-gaa-minor bg-gaa-minor/10 rounded-lg px-2.5 py-1 block">
                  {period}
                </span>
              </div>

              {/* Away */}
              <div className="flex-1 text-center">
                <p className="text-[11px] font-bold text-gaa-text truncate mb-1">{game.away_team}</p>
                <p className="font-barlow text-4xl font-black text-gaa-text tabular-nums leading-none">
                  {score.ag}-{String(score.ap).padStart(2, '0')}
                </p>
                {(cards.away.yellow > 0 || cards.away.red > 0) && (
                  <div className="flex justify-center items-center gap-2 mt-2 text-xs font-bold">
                    {cards.away.yellow > 0 && <span className="text-yellow-400">🟨 {cards.away.yellow}</span>}
                    {cards.away.red > 0 && <span className="text-red-400">🟥 {cards.away.red}</span>}
                  </div>
                )}
              </div>
            </div>

            {lastSaved && (
              <p className="text-[10px] text-gaa-text-muted text-center mt-3">
                Last submitted {fmtTime(lastSaved)}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
