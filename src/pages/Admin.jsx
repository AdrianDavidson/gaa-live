import { useState, useEffect } from 'react'
import { useAuth }             from '@clerk/react'
import { supabase }            from '../lib/supabase'
import Spinner                 from '../components/ui/Spinner'

// ─── Status helpers ───────────────────────────────────────────────────────────

function proStatus(updatedAt) {
  if (!updatedAt) return { label: 'No update', colour: 'text-gray-400' }
  const mins = (Date.now() - new Date(updatedAt)) / 60_000
  if (mins < 20)  return { label: 'Active',  colour: 'text-green-600' }
  if (mins < 45)  return { label: 'Quiet',   colour: 'text-amber-500' }
  return           { label: 'Silent',  colour: 'text-red-500' }
}

function formatTime(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })
}

// ─── Live tab ─────────────────────────────────────────────────────────────────

function LiveTab() {
  const [games, setGames] = useState([])

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    fetch(`/api/games?date=${today}`).then((r) => r.json()).then(setGames)

    const ch = supabase
      .channel('admin-score-updates')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'score_updates' },
        () => {
          fetch(`/api/games?date=${today}`).then((r) => r.json()).then(setGames)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [])

  if (!games.length) return <p className="text-gray-400 text-sm text-center py-10">No games today.</p>

  return (
    <ul className="space-y-3">
      {games.map((g) => {
        const st = proStatus(g.updated_at)
        return (
          <li key={g.id} className="bg-white border border-gray-200 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-gaa-minor">{g.competition_short}</span>
              <span className={`text-xs font-bold ${st.colour}`}>● {st.label}</span>
            </div>
            <div className="flex items-center justify-between font-bold text-sm">
              <span>{g.home_team}</span>
              <span className="text-base tabular-nums text-gaa-minor">
                {g.home_score ?? '–'} – {g.away_score ?? '–'}
              </span>
              <span>{g.away_team}</span>
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>{g.period ?? 'Not started'}</span>
              <span>Updated {formatTime(g.updated_at)}</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

// ─── Games tab ────────────────────────────────────────────────────────────────

function GamesTab() {
  const { getToken }                = useAuth()
  const [clubs, setClubs]           = useState([])
  const [competitions, setComps]    = useState([])
  const [pros, setPros]             = useState([])
  const [games, setGames]           = useState([])
  const [form, setForm]             = useState({ homeClubId: '', awayClubId: '', competitionId: '', venue: '', startTime: '', assignedProId: '' })
  const [msg, setMsg]               = useState(null)

  useEffect(() => {
    supabase.from('clubs').select('id, name').order('name').then(({ data }) => setClubs(data ?? []))
    supabase.from('competitions').select('id, short_name').order('short_name').then(({ data }) => setComps(data ?? []))
    supabase.from('pros').select('id, name').order('name').then(({ data }) => setPros(data ?? []))
    const today = new Date().toISOString().split('T')[0]
    fetch(`/api/games?date=${today}`).then((r) => r.json()).then(setGames)
  }, [])

  async function submit(e) {
    e.preventDefault()
    const token = await getToken()
    const res   = await fetch('/api/admin/games', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify(form),
    })
    if (res.ok) { setMsg('Game added'); const today = new Date().toISOString().split('T')[0]; fetch(`/api/games?date=${today}`).then((r) => r.json()).then(setGames) }
    else setMsg('Error — check fields')
  }

  async function deleteGame(id, startTime) {
    const token = await getToken()
    await fetch(`/api/admin/games?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    setGames((prev) => prev.filter((g) => g.id !== id))
  }

  return (
    <div>
      <form onSubmit={submit} className="space-y-3 mb-6">
        <h3 className="font-black text-gray-900">Add Game</h3>
        <select value={form.homeClubId} onChange={(e) => setForm((f) => ({ ...f, homeClubId: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
          <option value="">Home Club</option>
          {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={form.awayClubId} onChange={(e) => setForm((f) => ({ ...f, awayClubId: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
          <option value="">Away Club</option>
          {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={form.competitionId} onChange={(e) => setForm((f) => ({ ...f, competitionId: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
          <option value="">Competition</option>
          {competitions.map((c) => <option key={c.id} value={c.id}>{c.short_name}</option>)}
        </select>
        <input type="text" placeholder="Venue" value={form.venue} onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <input type="datetime-local" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
        <select value={form.assignedProId} onChange={(e) => setForm((f) => ({ ...f, assignedProId: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Assign PRO (optional)</option>
          {pros.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button type="submit" className="w-full bg-gaa-minor text-white font-bold py-2.5 rounded-xl">Add Game</button>
        {msg && <p className="text-sm text-center text-gray-500">{msg}</p>}
      </form>

      <h3 className="font-black text-gray-900 mb-2">Today's Games</h3>
      {games.map((g) => (
        <div key={g.id} className="flex items-center justify-between border border-gray-200 rounded-xl p-3 mb-2 text-sm">
          <span className="font-semibold">{g.home_team} vs {g.away_team}</span>
          <button onClick={() => deleteGame(g.id, g.start_time)} className="text-red-500 font-bold text-xs min-h-[36px] px-2">Delete</button>
        </div>
      ))}
    </div>
  )
}

// ─── PROs tab ─────────────────────────────────────────────────────────────────

function PROsTab() {
  const { getToken }              = useAuth()
  const [pros, setPros]           = useState([])
  const [clubs, setClubs]         = useState([])
  const [form, setForm]           = useState({ clerkId: '', name: '', email: '', clubId: '' })
  const [msg, setMsg]             = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    async function load() {
      const token = await getToken()
      await Promise.all([
        supabase.from('clubs').select('id, name').order('name').then(({ data }) => setClubs(data ?? [])),
        fetch('/api/admin/pros', { headers: { Authorization: `Bearer ${token}` } })
          .then((r) => r.ok ? r.json() : [])
          .then(setPros)
          .catch(() => []),
      ])
      setLoading(false)
    }
    load()
  }, [getToken])

  async function addPro(e) {
    e.preventDefault()
    const token = await getToken()
    const res   = await fetch('/api/admin/pros', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify(form),
    })
    if (res.ok) { const p = await res.json(); setPros((prev) => [...prev, p]); setMsg('PRO added'); setForm({ clerkId: '', name: '', email: '', clubId: '' }) }
    else setMsg('Error — check fields')
  }

  async function deletePro(id) {
    const token = await getToken()
    await fetch(`/api/admin/pros?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    setPros((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-5 text-xs text-blue-800">
        First create the user's account in the Clerk dashboard, then add their Clerk User ID here.
      </div>

      <form onSubmit={addPro} className="space-y-3 mb-6">
        <h3 className="font-black text-gray-900">Add PRO</h3>
        <input type="text"  placeholder="Name"        value={form.name}    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
        <input type="email" placeholder="Email"       value={form.email}   onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}   className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
        <input type="text"  placeholder="Clerk User ID" value={form.clerkId} onChange={(e) => setForm((f) => ({ ...f, clerkId: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono text-xs" required />
        <select value={form.clubId} onChange={(e) => setForm((f) => ({ ...f, clubId: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Club (optional)</option>
          {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="submit" className="w-full bg-gaa-minor text-white font-bold py-2.5 rounded-xl">Add PRO</button>
        {msg && <p className="text-sm text-center text-gray-500">{msg}</p>}
      </form>

      {loading && <Spinner label="Loading PROs…" />}
      {!loading && pros.map((p) => (
        <div key={p.id} className="flex items-center justify-between border border-gray-200 rounded-xl p-3 mb-2">
          <div>
            <p className="font-semibold text-sm">{p.name}</p>
            <p className="text-xs text-gray-400">{p.email} · {p.club?.name ?? 'No club'}</p>
          </div>
          <button onClick={() => deletePro(p.id)} className="text-red-500 font-bold text-xs min-h-[36px] px-2">Remove</button>
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS = ['Live', 'Games', 'PROs']

export default function Admin() {
  const [activeTab, setActiveTab] = useState('Live')

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-black text-gray-900">Admin</h1>
        <a href="/" className="text-xs font-bold text-gaa-minor">← Back</a>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border border-gray-200 rounded-xl mb-5 p-1 gap-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
              activeTab === t ? 'bg-gaa-minor text-white' : 'text-gray-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'Live'  && <LiveTab />}
      {activeTab === 'Games' && <GamesTab />}
      {activeTab === 'PROs'  && <PROsTab />}
    </div>
  )
}
