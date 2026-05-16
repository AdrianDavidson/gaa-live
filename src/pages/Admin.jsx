import { useState, useEffect }  from 'react'
import { useAuth }              from '@clerk/react'
import { X, ChevronDown }       from 'lucide-react'
import { supabase }             from '../lib/supabase'
import { compPillLabel }        from '../utils/formatters'

// ─── Reusable searchable bottom-sheet picker ─────────────────────────────────

function SearchModal({ title, items, onSelect, onClose }) {
  const [q, setQ] = useState('')
  const filtered  = items.filter((item) =>
    item.name.toLowerCase().includes(q.toLowerCase())
  )
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-gaa-surface w-full max-w-lg rounded-t-2xl p-4 pb-10 border-t border-gaa-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-gaa-text">{title}</h2>
          <button onClick={onClose} className="text-gaa-text-muted min-h-[44px] px-2">
            <X size={20} />
          </button>
        </div>
        <input
          autoFocus
          type="search"
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full bg-gaa-surface-raised border border-gaa-border rounded-xl px-3 py-2.5 text-sm text-gaa-text placeholder:text-gaa-text-muted mb-3 focus:outline-none focus:ring-2 focus:ring-gaa-minor"
        />
        <ul className="max-h-72 overflow-y-auto divide-y divide-gaa-border">
          {filtered.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => { onSelect(item); onClose() }}
                className="w-full text-left py-3 px-2 min-h-[48px] text-gaa-text font-semibold text-sm hover:text-gaa-amber transition-colors"
              >
                {item.name}
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="py-6 text-center text-gaa-text-muted text-sm">Nothing found</li>
          )}
        </ul>
      </div>
    </div>
  )
}

// ─── Tap-to-open field (replaces dropdowns) ───────────────────────────────────

function PickerField({ placeholder, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between bg-gaa-surface-raised border border-gaa-border rounded-xl px-4 py-3 text-left min-h-[52px] transition-colors hover:border-gaa-text-muted"
    >
      <span className={`text-sm truncate ${value ? 'text-gaa-text font-semibold' : 'text-gaa-text-muted'}`}>
        {value || placeholder}
      </span>
      <ChevronDown size={16} className="text-gaa-text-muted shrink-0 ml-2" />
    </button>
  )
}

// ─── Two-tap delete button ────────────────────────────────────────────────────

function DeleteBtn({ onConfirm }) {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const t = setTimeout(() => setArmed(false), 3000)
    return () => clearTimeout(t)
  }, [armed])
  return armed ? (
    <div className="flex items-center gap-1">
      <button
        onClick={() => { onConfirm(); setArmed(false) }}
        className="text-red-400 font-black text-xs min-h-[36px] px-2"
      >
        Confirm
      </button>
      <button onClick={() => setArmed(false)} className="text-gaa-text-muted text-xs min-h-[36px] px-1">
        ✕
      </button>
    </div>
  ) : (
    <button onClick={() => setArmed(true)} className="text-gaa-text-muted font-bold text-xs min-h-[36px] px-2">
      Delete
    </button>
  )
}

// ─── CSV import ───────────────────────────────────────────────────────────────

function CsvImportSection({ clubs, comps, getToken, onDone }) {
  const [csv,       setCsv]       = useState('')
  const [rows,      setRows]      = useState(null)
  const [importing, setImporting] = useState(false)
  const [result,    setResult]    = useState(null)

  function parse() {
    const lines = csv.trim().split('\n').map(l => l.replace(/\r$/, '').trim()).filter(Boolean)
    if (lines.length < 2) { setRows([]); setResult(null); return }
    const hdr    = lines[0].split(',').map(h => h.trim().toLowerCase())
    const parsed = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim())
      const raw  = Object.fromEntries(hdr.map((h, i) => [h, vals[i] ?? '']))
      const homeClub = clubs.find(c => c.name.toLowerCase() === (raw.home_club ?? '').toLowerCase())
      const awayClub = clubs.find(c => c.name.toLowerCase() === (raw.away_club ?? '').toLowerCase())
      const comp     = comps.find(c =>
        c.name.toLowerCase()        === (raw.competition_name  ?? '').toLowerCase() ||
        c.short_name?.toLowerCase() === (raw.competition_short ?? '').toLowerCase()
      )
      const issues = [
        !raw.date       && 'Missing date',
        !raw.start_time && 'Missing start_time',
        !homeClub && `Club not found: "${raw.home_club}"`,
        !awayClub && `Club not found: "${raw.away_club}"`,
        !comp     && `Competition not found: "${raw.competition_name || raw.competition_short}"`,
      ].filter(Boolean)
      return { raw, homeClub, awayClub, comp, issues }
    })
    setRows(parsed)
    setResult(null)
  }

  async function importAll() {
    const valid = (rows ?? []).filter(r => r.issues.length === 0)
    if (!valid.length || importing) return
    setImporting(true)
    const token = await getToken()
    let ok = 0, fail = 0
    for (const r of valid) {
      const res = await fetch('/api/admin/games', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          homeClubId:    r.homeClub.id,
          awayClubId:    r.awayClub.id,
          competitionId: r.comp.id,
          venue:         r.raw.venue ?? '',
          startTime:     `${r.raw.date}T${r.raw.start_time}:00`,
          assignedProId: '',
        }),
      })
      res.ok ? ok++ : fail++
    }
    setImporting(false)
    setResult({ ok, fail })
    if (ok > 0) { setCsv(''); setRows(null); onDone?.() }
  }

  const validCount = (rows ?? []).filter(r => r.issues.length === 0).length
  const badCount   = (rows ?? []).filter(r => r.issues.length  > 0).length

  return (
    <div className="bg-gaa-surface border border-gaa-border rounded-2xl p-4 mb-5">
      <h3 className="font-barlow text-lg font-black text-gaa-text mb-1">Import CSV</h3>
      <p className="text-[10px] font-mono text-gaa-text-muted mb-3 break-all leading-relaxed">
        date, start_time, home_club, away_club, competition_name, competition_short, venue
      </p>
      <textarea
        value={csv}
        onChange={e => { setCsv(e.target.value); setRows(null); setResult(null) }}
        placeholder="Paste CSV rows here…"
        rows={5}
        className="w-full bg-gaa-surface-raised border border-gaa-border rounded-xl px-3 py-2.5 text-xs text-gaa-text placeholder:text-gaa-text-muted font-mono focus:outline-none focus:ring-2 focus:ring-gaa-minor mb-2 resize-none"
      />
      <button
        onClick={parse}
        disabled={!csv.trim()}
        className="w-full py-2.5 rounded-xl bg-gaa-surface-raised border border-gaa-border text-sm font-bold text-gaa-text disabled:opacity-30 mb-3"
      >
        Preview
      </button>

      {rows !== null && rows.length === 0 && (
        <p className="text-xs text-gaa-text-muted text-center py-2">No data rows found — check the header row is included.</p>
      )}

      {rows !== null && rows.length > 0 && (
        <div className="space-y-2 mb-3">
          {rows.map((r, i) => (
            <div key={i} className={`rounded-xl p-3 border text-xs ${
              r.issues.length
                ? 'border-red-700/50 bg-red-900/10'
                : 'border-emerald-700/50 bg-emerald-900/10'
            }`}>
              <p className="font-bold text-gaa-text mb-0.5">
                {r.raw.home_club || '?'} vs {r.raw.away_club || '?'}
                <span className="font-normal text-gaa-text-muted ml-1">
                  · {r.raw.date} {r.raw.start_time}
                </span>
              </p>
              {r.issues.length > 0
                ? r.issues.map((e, j) => <p key={j} className="text-red-400">{e}</p>)
                : <p className="text-emerald-400">{r.comp.name}</p>
              }
            </div>
          ))}

          {validCount > 0 && (
            <button
              onClick={importAll}
              disabled={importing}
              className="w-full py-3 rounded-xl bg-gaa-minor text-white font-black text-sm disabled:opacity-50"
            >
              {importing
                ? 'Importing…'
                : `Import ${validCount} fixture${validCount !== 1 ? 's' : ''}${badCount > 0 ? ` (${badCount} skipped)` : ''}`
              }
            </button>
          )}
        </div>
      )}

      {result && (
        <p className={`text-sm text-center font-bold ${result.ok > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {result.ok > 0 && `✓ Imported ${result.ok} fixture${result.ok !== 1 ? 's' : ''}`}
          {result.fail > 0 && ` · ${result.fail} failed`}
        </p>
      )}
    </div>
  )
}

// ─── Games tab ────────────────────────────────────────────────────────────────

const BLANK_GAME = { homeClub: null, awayClub: null, competition: null, venue: '', startTime: '', pro: null }

function GamesTab() {
  const { getToken } = useAuth()

  const [clubs, setClubs]       = useState([])
  const [comps, setComps]       = useState([])
  const [pros, setPros]         = useState([])
  const [games, setGames]       = useState([])
  const [form, setForm]         = useState(BLANK_GAME)
  const [picker, setPicker]     = useState(null) // 'home'|'away'|'comp'|'pro'
  const [msg, setMsg]           = useState(null)

  function flash(text) { setMsg(text); setTimeout(() => setMsg(null), 4000) }

  function loadGames() {
    const from = new Date().toISOString().split('T')[0]
    const to   = new Date(Date.now() + 30 * 86_400_000).toISOString().split('T')[0]
    fetch(`/api/games?date=${from}&dateTo=${to}`)
      .then((r) => r.json())
      .then((d) => setGames(Array.isArray(d) ? d : []))
  }

  useEffect(() => {
    supabase.from('clubs').select('id, name').order('name').then(({ data }) => setClubs(data ?? []))
    supabase.from('competitions').select('id, name, short_name').order('name').then(({ data }) => setComps(data ?? []))
    supabase.from('pros').select('id, name').order('name').then(({ data }) => setPros(data ?? []))
    loadGames()
  }, [])

  async function addGame(e) {
    e.preventDefault()
    if (!form.homeClub || !form.awayClub || !form.competition || !form.startTime) {
      flash('Please fill all required fields')
      return
    }
    const token = await getToken()
    const res   = await fetch('/api/admin/games', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        homeClubId:    form.homeClub.id,
        awayClubId:    form.awayClub.id,
        competitionId: form.competition.id,
        venue:         form.venue,
        startTime:     form.startTime,
        assignedProId: form.pro?.id ?? '',
      }),
    })
    if (res.ok) {
      flash('✓ Fixture added')
      setForm(BLANK_GAME)
      loadGames()
    } else {
      const err = await res.json().catch(() => ({}))
      flash(`Error: ${err.error ?? 'check fields'}`)
    }
  }

  async function deleteGame(id) {
    const token = await getToken()
    await fetch(`/api/admin/games?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    setGames((prev) => prev.filter((g) => g.id !== id))
  }

  function fmtDate(ts) {
    if (!ts) return ''
    const d = new Date(ts)
    return d.toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short' }) +
      ' · ' + d.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })
  }

  // Competition items with readable labels for the picker
  const compPickerItems = comps.map((c) => ({ ...c, name: compPillLabel(c.name, c.short_name) }))

  return (
    <div>
      {/* Add fixture form */}
      <form onSubmit={addGame} className="bg-gaa-surface border border-gaa-border rounded-2xl p-4 mb-5 space-y-2.5">
        <h3 className="font-barlow text-lg font-black text-gaa-text mb-1">Add Fixture</h3>

        <PickerField placeholder="Home Club *" value={form.homeClub?.name}    onClick={() => setPicker('home')} />
        <PickerField placeholder="Away Club *" value={form.awayClub?.name}    onClick={() => setPicker('away')} />
        <PickerField
          placeholder="Competition *"
          value={form.competition ? compPillLabel(form.competition.name, form.competition.short_name) : null}
          onClick={() => setPicker('comp')}
        />

        <input
          type="datetime-local"
          value={form.startTime}
          onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
          className="w-full bg-gaa-surface-raised border border-gaa-border rounded-xl px-4 py-3 text-sm text-gaa-text focus:outline-none focus:ring-2 focus:ring-gaa-minor min-h-[52px]"
          required
        />
        <input
          type="text"
          placeholder="Venue (optional)"
          value={form.venue}
          onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
          className="w-full bg-gaa-surface-raised border border-gaa-border rounded-xl px-4 py-3 text-sm text-gaa-text placeholder:text-gaa-text-muted focus:outline-none focus:ring-2 focus:ring-gaa-minor min-h-[52px]"
        />
        <PickerField placeholder="Assign PRO (optional)" value={form.pro?.name} onClick={() => setPicker('pro')} />

        <button type="submit" className="w-full bg-gaa-minor text-white font-black py-3.5 rounded-xl text-sm">
          Add Fixture
        </button>
        {msg && (
          <p className={`text-sm text-center font-bold ${msg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>
            {msg}
          </p>
        )}
      </form>

      <CsvImportSection clubs={clubs} comps={comps} getToken={getToken} onDone={loadGames} />

      {/* Upcoming list */}
      <h3 className="font-barlow text-base font-black text-gaa-text mb-2">
        Upcoming Fixtures <span className="text-gaa-text-muted font-sans text-xs font-normal">(next 30 days)</span>
      </h3>
      {games.length === 0 && (
        <p className="text-gaa-text-muted text-sm text-center py-6">No upcoming fixtures.</p>
      )}
      {games.map((g) => (
        <div key={g.id} className="bg-gaa-surface border border-gaa-border rounded-xl p-3 mb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-gaa-minor mb-0.5">
                {compPillLabel(g.competition_name, g.competition_short)}
              </p>
              <p className="text-sm font-bold text-gaa-text">
                {g.home_team} <span className="text-gaa-text-muted font-normal">vs</span> {g.away_team}
              </p>
              <p className="text-[10px] text-gaa-text-muted mt-0.5">
                {fmtDate(g.start_time)}{g.venue ? ` · ${g.venue}` : ''}
              </p>
            </div>
            <DeleteBtn onConfirm={() => deleteGame(g.id)} />
          </div>
        </div>
      ))}

      {/* Pickers */}
      {picker === 'home' && (
        <SearchModal title="Home Club" items={clubs}
          onSelect={(c) => setForm((f) => ({ ...f, homeClub: c }))}
          onClose={() => setPicker(null)} />
      )}
      {picker === 'away' && (
        <SearchModal title="Away Club" items={clubs}
          onSelect={(c) => setForm((f) => ({ ...f, awayClub: c }))}
          onClose={() => setPicker(null)} />
      )}
      {picker === 'comp' && (
        <SearchModal title="Competition" items={compPickerItems}
          onSelect={(item) => setForm((f) => ({ ...f, competition: comps.find((c) => c.id === item.id) }))}
          onClose={() => setPicker(null)} />
      )}
      {picker === 'pro' && (
        <SearchModal
          title="Assign PRO"
          items={[{ id: '', name: 'No PRO assigned' }, ...pros]}
          onSelect={(p) => setForm((f) => ({ ...f, pro: p.id ? p : null }))}
          onClose={() => setPicker(null)} />
      )}
    </div>
  )
}

// ─── PROs tab ─────────────────────────────────────────────────────────────────

function PROsTab() {
  const { getToken }        = useAuth()
  const [pros, setPros]     = useState([])
  const [clubs, setClubs]   = useState([])
  const [form, setForm]     = useState({ clerkId: '', name: '', email: '', clubId: '' })
  const [msg, setMsg]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [picker, setPicker] = useState(false)

  function flash(text) { setMsg(text); setTimeout(() => setMsg(null), 3000) }

  useEffect(() => {
    async function load() {
      const token = await getToken()
      await Promise.all([
        supabase.from('clubs').select('id, name').order('name').then(({ data }) => setClubs(data ?? [])),
        fetch('/api/admin/pros', { headers: { Authorization: `Bearer ${token}` } })
          .then((r) => r.ok ? r.json() : []).then(setPros).catch(() => []),
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
    if (res.ok) {
      const p = await res.json()
      setPros((prev) => [...prev, p])
      flash('✓ PRO added')
      setForm({ clerkId: '', name: '', email: '', clubId: '' })
    } else {
      flash('Error — check fields')
    }
  }

  async function deletePro(id) {
    const token = await getToken()
    await fetch(`/api/admin/pros?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    setPros((prev) => prev.filter((p) => p.id !== id))
  }

  const selectedClub = clubs.find((c) => c.id === form.clubId)

  const inputCls = 'w-full bg-gaa-surface-raised border border-gaa-border rounded-xl px-4 py-3 text-sm text-gaa-text placeholder:text-gaa-text-muted focus:outline-none focus:ring-2 focus:ring-gaa-minor min-h-[52px]'

  return (
    <div>
      <div className="bg-gaa-surface border border-gaa-border rounded-xl p-3 mb-4 text-xs text-gaa-text-muted leading-relaxed">
        First create the user's account in the <span className="text-gaa-text font-semibold">Clerk Dashboard</span>, then paste their User ID below.
      </div>

      <form onSubmit={addPro} className="bg-gaa-surface border border-gaa-border rounded-2xl p-4 mb-5 space-y-2.5">
        <h3 className="font-barlow text-lg font-black text-gaa-text mb-1">Add PRO</h3>
        <input type="text"  placeholder="Full name"  value={form.name}    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}    className={inputCls} required />
        <input type="email" placeholder="Email"      value={form.email}   onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}   className={inputCls} required />
        <input type="text"  placeholder="Clerk User ID  (user_…)" value={form.clerkId} onChange={(e) => setForm((f) => ({ ...f, clerkId: e.target.value }))} className={`${inputCls} font-mono`} required />
        <PickerField placeholder="Club (optional)" value={selectedClub?.name} onClick={() => setPicker(true)} />
        <button type="submit" className="w-full bg-gaa-minor text-white font-black py-3.5 rounded-xl text-sm">
          Add PRO
        </button>
        {msg && (
          <p className={`text-sm text-center font-bold ${msg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>{msg}</p>
        )}
      </form>

      {loading && <p className="text-gaa-text-muted text-sm text-center py-4">Loading…</p>}
      {!loading && pros.length === 0 && (
        <p className="text-gaa-text-muted text-sm text-center py-4">No PROs added yet.</p>
      )}
      {!loading && pros.map((p) => (
        <div key={p.id} className="bg-gaa-surface border border-gaa-border rounded-xl p-3 mb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="font-bold text-sm text-gaa-text">{p.name}</p>
              <p className="text-xs text-gaa-text-muted">{p.email}</p>
              <p className="text-xs text-gaa-text-muted">{p.club?.name ?? 'No club assigned'}</p>
            </div>
            <DeleteBtn onConfirm={() => deletePro(p.id)} />
          </div>
        </div>
      ))}

      {picker && (
        <SearchModal
          title="Club"
          items={[{ id: '', name: 'No club' }, ...clubs]}
          onSelect={(c) => { setForm((f) => ({ ...f, clubId: c.id })) }}
          onClose={() => setPicker(false)}
        />
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS = ['Fixtures', 'PROs']

export default function Admin() {
  const [activeTab, setActiveTab] = useState('Fixtures')

  return (
    <div className="min-h-screen bg-gaa-bg p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-barlow text-2xl font-black text-gaa-text">Admin</h1>
        <a href="/" className="text-xs font-bold text-gaa-text-muted hover:text-gaa-text transition-colors">
          ← Back
        </a>
      </div>

      <div className="flex bg-gaa-surface border border-gaa-border rounded-xl mb-5 p-1 gap-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${
              activeTab === t ? 'bg-gaa-minor text-white' : 'text-gaa-text-muted hover:text-gaa-text'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'Fixtures' && <GamesTab />}
      {activeTab === 'PROs'     && <PROsTab />}
    </div>
  )
}
