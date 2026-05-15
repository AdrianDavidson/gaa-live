import { useState, useEffect, useRef } from 'react'
import { useAuth }                      from '@clerk/react'
import { Undo2 }                        from 'lucide-react'

const PERIODS = ['Q1', 'HT', 'Q2', 'FT']

function Toast({ toast }) {
  if (!toast) return null
  const isSuccess = toast.type === 'success'
  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg pointer-events-none ${
        isSuccess
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
        <p className="text-xs font-bold text-gaa-text-muted uppercase tracking-wider">{label}</p>
        <span className="font-barlow text-3xl font-black text-gaa-text tabular-nums">
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

export default function Submit() {
  const { getToken } = useAuth()

  const [game, setGame]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [score, setScore]         = useState({ hg: 0, hp: 0, ag: 0, ap: 0 })
  const [history, setHistory]     = useState([])
  const [period, setPeriod]       = useState('Q1')
  const [ftConfirm, setFtConfirm] = useState(false)
  const [toast, setToast]         = useState(null)
  const [saving, setSaving]       = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  // Refs so async callbacks always read the latest values
  const scoreRef        = useRef(score)
  const periodRef       = useRef('Q1')
  const gameRef         = useRef(null)
  const doSubmitRef     = useRef(null)
  const submitTimer     = useRef(null)
  const ftConfirmTimer  = useRef(null)
  const toastTimer      = useRef(null)

  useEffect(() => { scoreRef.current = score },  [score])
  useEffect(() => { periodRef.current = period }, [period])
  useEffect(() => { gameRef.current = game },     [game])

  useEffect(() => {
    async function loadGame() {
      try {
        const token = await getToken()
        const today = new Date().toISOString().split('T')[0]
        const res   = await fetch(`/api/games?date=${today}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const games = await res.json()
        if (Array.isArray(games) && games.length) setGame(games[0])
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
  }, [getToken])

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
      const s = scoreRef.current
      const res = await fetch('/api/submit-score', {
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
      showToast('Saved ✓', 'success')
    } catch {
      showToast('Failed to save — try again', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Keep the ref pointing to the latest doSubmit so the debounce timer
  // always calls the current function (avoids stale closure)
  doSubmitRef.current = doSubmit

  function scheduleSubmit(delay = 1200) {
    clearTimeout(submitTimer.current)
    submitTimer.current = setTimeout(() => doSubmitRef.current?.(), delay)
  }

  function pushScore(updater) {
    setHistory((h) => [...h.slice(-4), scoreRef.current])
    setScore(updater)
    scheduleSubmit()
  }

  function undo() {
    if (!history.length) return
    const prev = history[history.length - 1]
    setHistory((h) => h.slice(0, -1))
    setScore(prev)
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

  function addGoal(team) {
    pushScore((s) => team === 'home' ? { ...s, hg: s.hg + 1 } : { ...s, ag: s.ag + 1 })
  }

  function addPoint(team) {
    pushScore((s) => team === 'home' ? { ...s, hp: s.hp + 1 } : { ...s, ap: s.ap + 1 })
  }

  function minus(team) {
    pushScore((s) => {
      const c = { ...s }
      if (team === 'home') {
        if (c.hp > 0) c.hp--; else if (c.hg > 0) c.hg--
      } else {
        if (c.ap > 0) c.ap--; else if (c.ag > 0) c.ag--
      }
      return c
    })
  }

  const fmtTime = (d) => d?.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-screen bg-gaa-bg p-4 max-w-sm mx-auto">
      <Toast toast={toast} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-barlow text-2xl font-black text-gaa-text">Score Entry</h1>
          {game && <p className="text-xs text-gaa-text-muted mt-0.5">{game.competition_short}</p>}
        </div>
        <div className="flex items-center gap-3">
          {saving && (
            <span className="text-[10px] text-gaa-amber animate-pulse font-bold">Saving…</span>
          )}
          {lastSaved && !saving && (
            <span className="text-[10px] text-gaa-text-muted">
              Saved {fmtTime(lastSaved)}
            </span>
          )}
          <a href="/" className="text-xs font-bold text-gaa-text-muted hover:text-gaa-text transition-colors">
            ← Back
          </a>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-16 bg-gaa-surface rounded-xl" />
          <div className="h-14 bg-gaa-surface rounded-xl" />
          <div className="h-14 bg-gaa-surface rounded-xl" />
        </div>
      )}

      {/* No game */}
      {!loading && !game && (
        <div className="bg-gaa-surface border border-gaa-border rounded-xl p-4 text-sm text-gaa-text-muted">
          No game assigned for today. Contact the county board.
        </div>
      )}

      {/* Main form */}
      {!loading && game && (
        <>
          {/* Game info */}
          <div className="bg-gaa-surface border border-gaa-border rounded-xl p-3 mb-5">
            <p className="text-[11px] font-bold text-gaa-minor mb-0.5">{game.competition_short}</p>
            <p className="text-sm font-bold text-gaa-text">{game.home_team} vs {game.away_team}</p>
            {game.venue && <p className="text-xs text-gaa-text-muted mt-0.5">{game.venue}</p>}
          </div>

          <ScoreButtons
            label={game.home_team}
            goals={score.hg} points={score.hp}
            onGoal={() => addGoal('home')}
            onPoint={() => addPoint('home')}
            onMinus={() => minus('home')}
          />

          <div className="border-t border-gaa-border my-4" />

          <ScoreButtons
            label={game.away_team}
            goals={score.ag} points={score.ap}
            onGoal={() => addGoal('away')}
            onPoint={() => addPoint('away')}
            onMinus={() => minus('away')}
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
              <p className="text-[10px] text-gaa-text-muted text-center mt-1.5">
                Tap FT again to confirm full time
              </p>
            )}
          </div>

          {/* Undo */}
          <button
            onClick={undo}
            disabled={!history.length}
            className="flex items-center gap-1.5 text-xs font-bold text-gaa-text-muted disabled:opacity-30 min-h-[44px] transition-opacity"
            aria-label="Undo last score change"
          >
            <Undo2 size={14} aria-hidden="true" />
            Undo last change
            {history.length > 0 && (
              <span className="opacity-50">({history.length})</span>
            )}
          </button>
        </>
      )}
    </div>
  )
}
