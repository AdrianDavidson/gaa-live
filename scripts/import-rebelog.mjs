// scripts/import-rebelog.mjs
// One-time import of Cork Fe18 (minor) hurling fixtures from rebelog.ie
//
// Before running:
//   1. Run supabase/seed_clubs.sql in Supabase SQL Editor (adds missing clubs)
//   2. Run supabase/seed_competitions.sql in Supabase SQL Editor
//
// Usage:
//   node scripts/import-rebelog.mjs            → dry run, shows what would be inserted
//   node scripts/import-rebelog.mjs --import   → inserts into Supabase

import { createClient } from '@supabase/supabase-js'
import { readFileSync }  from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import ws from 'ws'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DRY_RUN   = !process.argv.includes('--import')

// ── Load .env.local ────────────────────────────────────────────────────────────
function loadEnv() {
  try {
    const raw = readFileSync(resolve(__dirname, '../.env.local'), 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq  = trimmed.indexOf('=')
      if (eq < 0) continue
      const key = trimmed.slice(0, eq).trim()
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = val
    }
  } catch { /* env vars already set externally */ }
}
loadEnv()

// ── Rebel Óg name → DB club name ──────────────────────────────────────────────
const CLUB_NAME_MAP = {
  'Eire Og 2': 'Eire Og',   // second team → parent club record
  'Kiltha Og': 'Kiltha Óg', // accent missing on Rebel Óg
}

// ── Rebel Óg league page ID → DB competition short_name ───────────────────────
const COMP_SHORT_NAME = {
  213151: 'PMHL 2026', // Fe18 Premier 1       → Cork Premier Minor Hurling League
  213152: 'MAHL 2026', // Fe18 Premier 2 Sec 1 → Cork Minor A Hurling League
  213153: 'MAHL 2026', // Fe18 Premier 2 Sec 2 → Cork Minor A Hurling League
}

// ── Fixtures (sourced from rebelog.ie, May 2026) ───────────────────────────────
// All times are Irish Standard Time (IST = UTC+1). Converted to UTC on insert.
// Only upcoming fixtures are included. Past results can be added via /admin if needed.
const RAW_FIXTURES = [

  // ── Premier 1 (rebelog.ie/league/213151) ─────────────────────────────────
  { league: 213151, home: 'Carrigtwohill', away: 'Midleton',       date: '2026-05-13', time: '18:30', venue: 'Carrigtwohill' },
  { league: 213151, home: 'Glen Rovers',   away: 'Sarsfields',     date: '2026-05-13', time: '18:30', venue: 'Glen Field' },
  { league: 213151, home: 'Na Piarsaigh',  away: 'Carrigaline',    date: '2026-05-13', time: '19:00', venue: 'Na Piarsaigh' },
  { league: 213151, home: 'Ballincollig',  away: 'Blackrock',      date: '2026-05-14', time: '20:00', venue: 'Ballincollig' },
  { league: 213151, home: 'Midleton',      away: 'Ballincollig',   date: '2026-05-27', time: '19:45', venue: 'Midleton' },
  { league: 213151, home: 'Blackrock',     away: 'Glen Rovers',    date: '2026-06-24', time: '18:30', venue: 'Church Road' },
  { league: 213151, home: 'Carrigaline',   away: 'Midleton',       date: '2026-06-24', time: '18:30', venue: 'Carrigaline' },
  { league: 213151, home: 'Na Piarsaigh',  away: 'Carrigtwohill',  date: '2026-06-24', time: '18:30', venue: 'Na Piarsaigh' },
  { league: 213151, home: 'Sarsfields',    away: 'Ballincollig',   date: '2026-06-24', time: '18:30', venue: 'Riverstown' },
  { league: 213151, home: 'Ballincollig',  away: 'Glen Rovers',    date: '2026-07-08', time: '18:30', venue: 'Ballincollig' },
  { league: 213151, home: 'Carrigaline',   away: 'Blackrock',      date: '2026-07-08', time: '18:30', venue: 'Carrigaline' },
  { league: 213151, home: 'Carrigtwohill', away: 'Sarsfields',     date: '2026-07-08', time: '18:30', venue: 'Carrigtwohill' },
  { league: 213151, home: 'Midleton',      away: 'Na Piarsaigh',   date: '2026-07-08', time: '18:30', venue: 'Midleton' },

  // ── Premier 2 – Section 1 (rebelog.ie/league/213152) ─────────────────────
  { league: 213152, home: 'Shandrum',       away: 'St Colmans',     date: '2026-05-13', time: '19:00', venue: 'Shandrum' },
  { league: 213152, home: 'Kiltha Og',      away: 'Blarney',        date: '2026-05-13', time: '19:30', venue: 'Blarney' },
  { league: 213152, home: 'Killeagh',       away: 'Watergrasshill', date: '2026-05-17', time: '11:00', venue: 'Killeagh' },
  { league: 213152, home: 'Killeagh',       away: 'Blarney',        date: '2026-05-20', time: '19:30', venue: 'Killeagh' },
  { league: 213152, home: 'Watergrasshill', away: 'St Colmans',     date: '2026-05-22', time: '19:30', venue: 'Watergrasshill' },

  // ── Premier 2 – Section 2 (rebelog.ie/league/213153) ─────────────────────
  { league: 213153, home: 'Cloughduv',  away: 'Ibane Gaels', date: '2026-05-13', time: '18:30', venue: 'Cloughduv' },
  { league: 213153, home: 'Douglas',    away: 'St Finbarrs', date: '2026-05-13', time: '18:30', venue: 'Douglas' },
  { league: 213153, home: 'Eire Og 2', away: 'Erins Own',   date: '2026-05-13', time: '19:30', venue: 'Ovens' },

]

// IST (UTC+1 in summer) → UTC ISO string
function toUTC(date, time) {
  const [h, m] = time.split(':').map(Number)
  return new Date(
    `${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00+01:00`
  ).toISOString()
}

async function main() {
  console.log(DRY_RUN
    ? '--- DRY RUN — no data will be written ---'
    : '--- IMPORTING fixtures into Supabase ---'
  )
  console.log()

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { realtime: { transport: ws } }
  )

  const [{ data: clubs, error: clubErr }, { data: comps, error: compErr }] = await Promise.all([
    supabase.from('clubs').select('id, name'),
    supabase.from('competitions').select('id, short_name'),
  ])

  if (clubErr) { console.error('Could not fetch clubs:', clubErr.message); process.exit(1) }
  if (compErr) { console.error('Could not fetch competitions:', compErr.message); process.exit(1) }

  const clubByName  = Object.fromEntries(clubs.map(c => [c.name, c.id]))
  const compByShort = Object.fromEntries(comps.map(c => [c.short_name, c.id]))

  const toInsert = []
  const warnings = new Set()

  for (const f of RAW_FIXTURES) {
    const homeName = CLUB_NAME_MAP[f.home] ?? f.home
    const awayName = CLUB_NAME_MAP[f.away] ?? f.away
    const homeId   = clubByName[homeName]
    const awayId   = clubByName[awayName]
    const compId   = compByShort[COMP_SHORT_NAME[f.league]]

    if (!homeId) warnings.add(`Club not found: "${f.home}"${f.home !== homeName ? ` (mapped to "${homeName}")` : ''} — add to seed_clubs.sql and re-seed`)
    if (!awayId) warnings.add(`Club not found: "${f.away}"${f.away !== awayName ? ` (mapped to "${awayName}")` : ''} — add to seed_clubs.sql and re-seed`)
    if (!compId) warnings.add(`Competition not found: "${COMP_SHORT_NAME[f.league]}" — run seed_competitions.sql`)

    if (!homeId || !awayId || !compId) continue

    toInsert.push({
      home_club_id:   homeId,
      away_club_id:   awayId,
      competition_id: compId,
      venue:          f.venue,
      start_time:     toUTC(f.date, f.time),
    })
  }

  if (warnings.size) {
    console.log(`WARNINGS (${warnings.size}):`)
    for (const w of warnings) console.log(`  ! ${w}`)
    console.log()
  }

  const skipped = RAW_FIXTURES.length - toInsert.length
  console.log(`Fixtures ready: ${toInsert.length}  |  Skipped: ${skipped}`)
  console.log()

  for (const g of toInsert) {
    const home = clubs.find(c => c.id === g.home_club_id)?.name ?? '?'
    const away = clubs.find(c => c.id === g.away_club_id)?.name ?? '?'
    const comp = comps.find(c => c.id === g.competition_id)?.short_name ?? '?'
    const when = new Date(g.start_time).toLocaleString('en-IE', { timeZone: 'Europe/Dublin', dateStyle: 'short', timeStyle: 'short' })
    console.log(`  [${comp}] ${when}  ${home} v ${away}  @ ${g.venue}`)
  }

  if (DRY_RUN) {
    console.log()
    console.log('Run with --import to insert the above fixtures.')
    return
  }

  console.log()
  const { error: insertErr } = await supabase.from('games').insert(toInsert)
  if (insertErr) {
    console.error('Insert failed:', insertErr.message)
    process.exit(1)
  }
  console.log(`Done — ${toInsert.length} fixture(s) inserted.`)
}

main().catch(err => { console.error(err); process.exit(1) })
