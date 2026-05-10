# Cork Minor Hurling App — Full Spec

> **For the implementing agent:** Read this entire document before writing a single
> line of code. Section 1 describes the existing codebase in full. Sections 2–18
> describe the full pivot. Follow the implementation order in Section 18 exactly.

---

## 1. Existing Codebase Context

### Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (JSX), Vite, Tailwind CSS, React Router v6 |
| Hosting | Vercel Hobby plan |
| Backend | Vercel Serverless Functions (`/api/*.js`) |
| Cache | Upstash Redis (`@upstash/redis`) — `Redis.fromEnv()` pattern |
| Current data | TheSportsDB free API (key `3`) — being replaced |
| Push | `web-push` library + VAPID keys |
| PWA | `vite-plugin-pwa` |
| State | Zustand (`useAppStore`) + React Query (`@tanstack/react-query`) |

### Current file structure (files that will be modified or replaced)

```
/
├── api/
│   ├── fixtures.js          # TheSportsDB senior data — keep but move to secondary
│   ├── poll-scores.js       # RSS polling + push notifications — keep for senior section
│   ├── scores.js            # RSS read — keep for senior section
│   └── subscribe.js         # Push subscriptions — extend, do not replace
│
├── src/
│   ├── main.jsx             # Add ClerkProvider here
│   ├── App.jsx              # Replace route definitions entirely
│   ├── store/appStore.js    # Add homeClub + followedClubs fields
│   │
│   ├── pages/
│   │   ├── Home.jsx         # Replace with Today.jsx
│   │   ├── LiveScores.jsx   # Remove — live scores merge into Today
│   │   ├── Results.jsx      # Move to secondary "Senior" section
│   │   ├── Fixtures.jsx     # Replace with new minor Fixtures.jsx
│   │   ├── Watch.jsx        # Remove
│   │   └── Settings.jsx     # Extend — add home club picker + club follows
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── BottomNav.jsx    # Replace nav items entirely
│   │   │   └── Header.jsx       # Add Clerk UserButton + club colours
│   │   └── ui/
│   │       └── CodeSidebar.jsx  # Repurpose for minor sport type
│   │
│   └── utils/
│       └── countyColours.js     # Keep — extend with club colours map
```

### Patterns to preserve in all new code

- Serverless functions: `export default async function handler(req, res)`
- Redis: `import { Redis } from '@upstash/redis'` / `const redis = Redis.fromEnv()`
- React Query hooks in `src/hooks/`, one hook per data concern
- Tailwind custom tokens under `theme.extend.colors.gaa` in `tailwind.config.js`
- No commits or pushes without explicit user confirmation

### Existing environment variables (keep all)

```
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VITE_USE_DIRECT_API
```

---

## 2. What the App Becomes

A PWA built specifically for Cork minor hurling. Public users open it to
follow live scores across all clubs. Club PROs submit scores from the
sideline. County board admins manage fixtures and accounts.

**Three audiences, one app:**

| Who | What they do |
|-----|-------------|
| **Public fans** | Browse live scores, fixtures, standings — no account needed |
| **Club PROs** | Sign in, submit live score updates during matches |
| **County board admin** | Sign in, manage game fixtures and PRO accounts |

**Scope now:** Cork minor hurling only.
**Scaling later:** Add counties and grades by adding rows to the database — the
data model and UI are county/grade-aware from day one.

---

## 3. Navigation — Four Tabs

Replace the existing BottomNav completely.

| Tab | Icon | Page | Purpose |
|-----|------|------|---------|
| **Today** | Calendar | `Today.jsx` | Live scores + today's fixtures |
| **Fixtures** | List | `Fixtures.jsx` | Upcoming minor fixtures |
| **Table** | Trophy | `Table.jsx` | League standings |
| **Settings** | Person | `Settings.jsx` | Club identity + notifications |

The existing Live, Results, Watch pages are removed from the nav.
Senior results survive as a collapsible section inside a new `Senior.jsx`
page, accessible via a text link in Settings — not a nav tab.

---

## 4. New Dependencies

```bash
npm install @clerk/clerk-react @clerk/backend @supabase/supabase-js
```

Remove from `package.json` (no longer needed as primary data sources):
- Nothing needs removing yet — TheSportsDB calls are kept for the senior section.

---

## 5. New Environment Variables

Add to `.env.local` and Vercel project settings:

```
# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 6. Supabase Database Schema

Run in the Supabase SQL editor (Database → SQL Editor → New query).

```sql
-- ─── Clubs ──────────────────────────────────────────────────────────────────
-- One row per GAA club. county + grade fields make this scalable.
create table public.clubs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  county      text not null default 'Cork',
  primary_colour   text not null default '#006633',   -- hex
  secondary_colour text not null default '#FFFFFF',   -- hex
  crest_url   text,          -- external image URL (Wikipedia or club site)
  created_at  timestamptz default now(),
  unique(name, county)
);

-- ─── Competitions ────────────────────────────────────────────────────────────
-- e.g. "Cork Minor Hurling Championship 2026", "Cork Minor Hurling League 2026"
create table public.competitions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  short_name  text not null,           -- e.g. "CMHC 2026"
  county      text not null default 'Cork',
  grade       text not null default 'minor',    -- minor | u16 | u14 | senior
  code        text not null default 'hurling',  -- hurling | football
  season      int  not null default 2026,
  format      text not null default 'league',   -- league | championship | cup
  created_at  timestamptz default now()
);

-- ─── Games ───────────────────────────────────────────────────────────────────
create table public.games (
  id              uuid primary key default gen_random_uuid(),
  competition_id  uuid references public.competitions(id) on delete cascade not null,
  home_club_id    uuid references public.clubs(id) on delete cascade not null,
  away_club_id    uuid references public.clubs(id) on delete cascade not null,
  venue           text,
  start_time      timestamptz not null,
  assigned_pro_id uuid references public.pros(id) on delete set null,
  created_at      timestamptz default now()
);

-- ─── PRO accounts ────────────────────────────────────────────────────────────
create table public.pros (
  id          uuid primary key default gen_random_uuid(),
  clerk_id    text unique not null,
  name        text not null,
  email       text not null,
  club_id     uuid references public.clubs(id) on delete set null,
  created_at  timestamptz default now()
);

-- ─── Score updates ───────────────────────────────────────────────────────────
-- Every submission from a PRO. Latest period=FT row per game = final result.
create table public.score_updates (
  id            uuid primary key default gen_random_uuid(),
  game_id       uuid references public.games(id) on delete cascade not null,
  home_score    text not null,   -- e.g. "1-08"
  away_score    text not null,   -- e.g. "0-12"
  period        text not null check (period in ('Q1','HT','Q2','FT')),
  submitted_by  uuid references public.pros(id) on delete set null,
  created_at    timestamptz default now()
);

-- ─── User profiles ───────────────────────────────────────────────────────────
create table public.user_profiles (
  id            uuid primary key default gen_random_uuid(),
  clerk_id      text unique not null,
  email         text not null,
  home_club_id  uuid references public.clubs(id) on delete set null,
  created_at    timestamptz default now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
create index on public.games (start_time);
create index on public.games (competition_id);
create index on public.score_updates (game_id, created_at desc);
create index on public.clubs (county);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table public.clubs          enable row level security;
alter table public.competitions   enable row level security;
alter table public.games          enable row level security;
alter table public.pros           enable row level security;
alter table public.score_updates  enable row level security;
alter table public.user_profiles  enable row level security;

-- Public read access (all game data is public)
create policy "Public read clubs"        on public.clubs        for select using (true);
create policy "Public read competitions" on public.competitions  for select using (true);
create policy "Public read games"        on public.games        for select using (true);
create policy "Public read scores"       on public.score_updates for select using (true);
```

### Scalability note

Adding a new county = insert rows into `clubs` and `competitions` with
`county = 'Tipperary'` etc. Adding a new grade = insert competitions with
`grade = 'u16'`. No schema changes ever needed.

---

## 7. Shared API Helpers

Create these three files. Every protected serverless function imports from them.

**`api/_supabase.js`**
```js
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY   // bypasses RLS
)
```

**`api/_clerk.js`**
```js
import { createClerkClient } from '@clerk/backend'
export const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
```

**`api/_auth.js`**
```js
import { clerk } from './_clerk.js'

export async function requireAuth(req, res, allowedRoles = []) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) { res.status(401).json({ error: 'Unauthorized' }); return null }
  try {
    const payload = await clerk.verifyToken(token)
    const user    = await clerk.users.getUser(payload.sub)
    const role    = user.publicMetadata?.role ?? 'user'
    if (allowedRoles.length && !allowedRoles.includes(role)) {
      res.status(403).json({ error: 'Forbidden' }); return null
    }
    return { userId: payload.sub, role, clerkUser: user }
  } catch {
    res.status(401).json({ error: 'Invalid token' }); return null
  }
}
```

**`src/lib/supabase.js`** (frontend — anon key)
```js
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

---

## 8. Clerk Setup

1. Create app at clerk.com. Enable Email/Password only.
2. Add `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to env.
3. Roles are set in Clerk Dashboard → Users → Metadata → Public:
   - Default fans: no metadata needed (`role` defaults to `'user'`)
   - PROs: `{ "role": "pro" }`
   - Admin: `{ "role": "admin" }`

Wrap the app in `src/main.jsx`:
```jsx
import { ClerkProvider } from '@clerk/clerk-react'
// wrap existing providers:
<ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
  {/* QueryClientProvider, BrowserRouter, etc. */}
</ClerkProvider>
```

---

## 9. Auth — Protected Routes

**`src/components/auth/ProtectedRoute.jsx`**
```jsx
import { useAuth, useUser } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'
import Spinner from '../ui/Spinner'

function ProtectedRoute({ children, requiredRole }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  if (!isLoaded) return <Spinner label="Loading…" />
  if (!isSignedIn) return <Navigate to="/login" replace />
  const role = user?.publicMetadata?.role ?? 'user'
  if (requiredRole === 'pro'   && !['pro','admin'].includes(role)) return <Navigate to="/" replace />
  if (requiredRole === 'admin' && role !== 'admin') return <Navigate to="/" replace />
  return children
}

export const RequirePro   = ({ children }) => <ProtectedRoute requiredRole="pro">{children}</ProtectedRoute>
export const RequireAdmin = ({ children }) => <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
```

**`src/App.jsx` routes:**
```jsx
import { SignIn, SignUp } from '@clerk/clerk-react'

// Public pages (inside Layout with BottomNav):
<Route path="/"          element={<Today />} />
<Route path="/fixtures"  element={<Fixtures />} />
<Route path="/table"     element={<Table />} />
<Route path="/settings"  element={<Settings />} />
<Route path="/senior"    element={<Senior />} />

// Auth pages (outside Layout — Clerk provides full UI):
<Route path="/login"  element={<SignIn routing="path" path="/login"  afterSignInUrl="/"  />} />
<Route path="/signup" element={<SignUp routing="path" path="/signup" afterSignUpUrl="/"  />} />

// Tool pages (outside Layout):
<Route path="/submit" element={<RequirePro><Submit /></RequirePro>} />
<Route path="/admin"  element={<RequireAdmin><Admin /></RequireAdmin>} />
```

---

## 10. Club Identity & Personalisation

This is the core of the fan experience. Every user picks a "home club"
in Settings. The app personalises around it throughout.

### What changes when a user picks their club

1. **Hero card on Today** — their club's next game is shown first, with the
   club's colours as the card background tint and their crest in the corner.

2. **Accent colour** — the header bar and hero card use the club's
   `primary_colour` from Supabase as a subtle tint. Computed in a
   `useClubTheme()` hook and applied via inline style, not Tailwind tokens
   (since the colour is dynamic per user).

3. **Table** — their club's row is highlighted with a left border in their
   primary colour and slightly bolder text.

4. **Settings page identity line:**
   ```
   ┌──────────────────────────────┐
   │  [Crest]  Barryroe           │
   │           Cork Minor Hurling │
   │           Fan                │
   └──────────────────────────────┘
   ```

5. **Push notifications** — their home club is auto-followed for push alerts
   when they enable notifications. They can follow additional clubs too.

6. **Anonymous users** — the club picker is shown on first open (before any
   sign-up prompt). Preference stored in Zustand + localStorage exactly as
   the existing `favouriteCounty` works today. Signed-in users sync to
   Supabase `user_profiles.home_club_id`.

### `useClubTheme()` hook

```js
// src/hooks/useClubTheme.js
import { useAppStore } from '../store/appStore'
import { useClubData } from './useClubData'

export function useClubTheme() {
  const { homeClubId } = useAppStore()
  const { data: clubs } = useClubData()
  const club = clubs?.find((c) => c.id === homeClubId)
  return {
    primary:   club?.primary_colour   ?? '#006633',
    secondary: club?.secondary_colour ?? '#FFFFFF',
    crest:     club?.crest_url        ?? null,
    name:      club?.name             ?? null,
  }
}
```

Use `theme.primary` as `style={{ borderColor: theme.primary }}` etc.
Never hardcode these colours into Tailwind classes — they are runtime values.

---

## 11. Serverless Functions

### `GET /api/games` — public

Returns games for a given date and optional filters.

**Query params:**
- `date` — ISO date string, defaults to today
- `county` — defaults to `'Cork'`
- `grade` — defaults to `'minor'`
- `code` — defaults to `'hurling'`

**Logic:**
1. Check Redis key `games:cache:{county}:{date}` — return if hit (TTL 2 min).
2. Query Supabase:
```sql
SELECT g.*, c.short_name as competition_short, c.name as competition_name,
       c.format as competition_format,
       hc.name as home_team, hc.primary_colour as home_colour,
       hc.secondary_colour as home_secondary, hc.crest_url as home_crest,
       ac.name as away_team, ac.primary_colour as away_colour,
       ac.secondary_colour as away_secondary, ac.crest_url as away_crest,
       su.home_score, su.away_score, su.period,
       su.created_at as updated_at
FROM games g
JOIN competitions c    ON c.id = g.competition_id
JOIN clubs hc          ON hc.id = g.home_club_id
JOIN clubs ac          ON ac.id = g.away_club_id
LEFT JOIN LATERAL (
  SELECT * FROM score_updates
  WHERE game_id = g.id ORDER BY created_at DESC LIMIT 1
) su ON true
WHERE date(g.start_time AT TIME ZONE 'Europe/Dublin') = '{date}'
  AND c.county = '{county}'
  AND c.grade  = '{grade}'
  AND c.code   = '{code}'
ORDER BY g.start_time ASC
```
3. Store in Redis with 120s TTL. Return array.

---

### `GET /api/standings` — public

Returns league standings for a competition.

**Query params:** `competitionId` (required)

**Logic:**
1. Check Redis `standings:cache:{competitionId}` (TTL 5 min).
2. Pull all games for the competition where a `period = 'FT'` score_update
   exists (using the latest FT submission per game as the final result).
3. Calculate standings:

```js
function calculateStandings(games) {
  const table = {}
  for (const game of games) {
    // Parse "G-PP" format into total points
    const homeTotal = parseGAA(game.home_score)
    const awayTotal = parseGAA(game.away_score)
    const homeWin   = homeTotal > awayTotal
    const awayWin   = awayTotal > homeTotal
    const draw      = homeTotal === awayTotal

    ensure(table, game.home_team)
    ensure(table, game.away_team)

    table[game.home_team].played++
    table[game.away_team].played++
    table[game.home_team].for     += homeTotal
    table[game.home_team].against += awayTotal
    table[game.away_team].for     += awayTotal
    table[game.away_team].against += homeTotal

    if (homeWin) {
      table[game.home_team].won++;  table[game.home_team].pts += 2
      table[game.away_team].lost++
    } else if (awayWin) {
      table[game.away_team].won++;  table[game.away_team].pts += 2
      table[game.home_team].lost++
    } else {
      table[game.home_team].drawn++; table[game.home_team].pts++
      table[game.away_team].drawn++; table[game.away_team].pts++
    }
  }
  return Object.values(table).sort((a, b) =>
    b.pts - a.pts || (b.for - b.against) - (a.for - a.against)
  )
}

function parseGAA(score) {
  // "1-08" → 1*3 + 8 = 11
  if (!score) return 0
  const [g, p] = score.split('-').map(Number)
  return g * 3 + (p || 0)
}
```

Return sorted array. Cache in Redis for 5 minutes.

---

### `POST /api/submit-score` — protected (pro, admin)

**Request body:** `{ gameId, homeScore, awayScore, period }`

**Logic:**
1. `requireAuth(req, res, ['pro', 'admin'])`
2. Look up PRO in Supabase by `clerk_id`. Check `games.assigned_pro_id === pro.id`
   (admin role skips this check).
3. `INSERT` into `score_updates`.
4. Bust Redis caches: `games:cache:*` for today's date, `standings:cache:{competitionId}`.
5. Call `notifyClubFollowers(homeTeam, awayTeam, homeScore, awayScore, period)`.
6. Return `{ ok: true }`.

**Push notifications** (see Section 12 for full detail):
```js
async function notifyClubFollowers(homeClub, awayClub, homeScore, awayScore, period) {
  webpush.setVapidDetails('mailto:admin@gaaapp.ie',
    process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY)

  const [homeSubs, awaySubs] = await Promise.all([
    redis.get(`minor:push:club:${homeClub}`) ?? [],
    redis.get(`minor:push:club:${awayClub}`) ?? [],
  ])
  const seen = new Set()
  const subs = [...homeSubs, ...awaySubs].filter((s) => {
    if (seen.has(s.endpoint)) return false
    seen.add(s.endpoint); return true
  })
  const payload = JSON.stringify({
    title: `Minor · ${period}`,
    body:  `${homeClub} ${homeScore}  –  ${awayClub} ${awayScore}`,
    url:   '/',
  })
  for (const sub of subs) {
    try { await webpush.sendNotification(sub, payload) } catch (_) {}
  }
}
```

---

### `POST /api/subscribe-minor` — public

Stores a fan's push subscription tagged to their followed clubs.

**Request body:**
```json
{
  "subscription": { "endpoint": "...", "keys": { "p256dh": "...", "auth": "..." } },
  "clubs": ["Barryroe", "Kilmacud Crokes"]
}
```

**Logic:**
1. Remove this subscription's endpoint from **all** existing `minor:push:club:*` keys
   (handles unfollowing cleanly).
2. For each club in the new list, read `minor:push:club:{club}`, append
   subscription, write back. No TTL.
3. Return `{ ok: true }`.

The existing `api/subscribe.js` and `gaa:push:subscriptions` key are untouched —
they continue to handle senior RSS push notifications separately.

---

### `POST /api/admin/games` — admin only

Create, update, or delete a game fixture.

- `POST` with body → INSERT into `games`
- `PATCH` with `?id=` → UPDATE
- `DELETE` with `?id=` → DELETE (cascades to `score_updates`)

After any write, bust `games:cache:*` for the affected date.

---

### `POST /api/admin/clubs` — admin only

Create or update a club entry (name, colours, crest URL).

---

### `POST /api/admin/pros` — admin only

Register a PRO. The Clerk user must already exist (admin creates via Clerk
dashboard first, copies their Clerk User ID).

**Body:** `{ clerkId, name, email, clubId }`

---

### `POST /api/user/profile` — any signed-in user

Upserts `user_profiles` by `clerk_id`. Accepts `{ homeClubId }`.

---

## 12. Pages to Build

### `src/pages/Today.jsx` — replaces Home.jsx

The main screen. On match days it is the live scoreboard.
On quiet days it shows upcoming fixtures.

**Section order:**

```
1. My Club hero card          (always shown if home club is set)
2. Live Now                   (only if games currently in Q1/HT/Q2)
3. Later Today                (upcoming games today not yet started)
4. Tomorrow                   (first few games tomorrow)
```

**My Club hero card:**

Shows the user's home club's next game. Uses club colours as background
tint (via `useClubTheme()`). If no game today or tomorrow, shows their
current league position instead.

```
┌──────────────────────────────────────┐
│ [Crest]  Barryroe                    │
│          Next Game                   │
│          CMHC · Round 3              │
│                                      │
│  Barryroe        vs       Midleton   │
│  Sat 17 May · 3:00pm                 │
│  Caheragh GAA                        │
└──────────────────────────────────────┘
```

If no home club set:
```
┌──────────────────────────────────────┐
│  Pick your club                      │
│  Get your next game right here →     │
│  [ Choose club ]                     │
└──────────────────────────────────────┘
```

**Live Now section:**

Shows `MinorGameCard` for each game currently in progress. Same purple
visual language as specified in the visual distinction section below.
Shows the pulsing `● LIVE` badge, current score, and period.

**Later Today / Tomorrow:**

Shows `FixtureCard` — simpler card showing teams, time, venue.
Tapping a fixture card opens a detail view (modal or route) with
competition name, venue, and a countdown.

---

### `src/pages/Fixtures.jsx` — replaces current Fixtures.jsx

Full upcoming fixture list. Filterable.

**Filters (pill row at top):**
- **All** | **My Clubs** (games involving clubs the user follows)
- Competition dropdown (shows all active competitions)

**Layout:** grouped by date, same `formatDateGroup` utility already in the app.
Each row: competition badge · home team · time · away team · venue.

No senior data appears here.

---

### `src/pages/Table.jsx` — new

League standings. Multiple competitions means multiple tables.

**Competition selector** — horizontal scrollable pill row at the top
showing all active competitions (e.g. "CMHC 2026", "CML 2026").

**Table layout per competition:**

```
┌─────────────────────────────────────────────────────┐
│  Cork Minor Hurling Championship 2026                │
├──────────────────┬─────┬───┬───┬───┬────┬────┬─────┤
│  Club            │  P  │ W │ D │ L │ F  │ A  │ Pts │
├──────────────────┼─────┼───┼───┼───┼────┼────┼─────┤
│  Blackrock       │  4  │ 3 │ 1 │ 0 │ 67 │ 41 │  7  │
│  ▶ Barryroe      │  4  │ 3 │ 0 │ 1 │ 59 │ 48 │  6  │  ← user's club highlighted
│  Midleton        │  3  │ 2 │ 0 │ 1 │ 44 │ 32 │  4  │
│  ...             │     │   │   │   │    │    │     │
└──────────────────┴─────┴───┴───┴───┴────┴────┴─────┘
```

The user's home club row gets a left border in their club's primary colour
and slightly bolder text. No other visual change.

For championship (knockout) format: show a bracket view instead of a table.
This is a future enhancement — for now show results only with a note
"Knockout competition — no standings table."

**Data source:** `GET /api/standings?competitionId=xxx` — auto-calculated
from all FT `score_updates` in Supabase. Updates whenever a PRO submits FT.

---

### `src/pages/Settings.jsx` — extends existing

Keep all existing functionality. Add:

**Club identity section (new, at the top):**
```
┌──────────────────────────────────────┐
│ [Crest]  Barryroe                    │
│          Cork Minor Hurling Fan      │
│          [ Change club ]             │
└──────────────────────────────────────┘
```

If signed in, show `<UserButton />` from Clerk (avatar, email, sign-out).
If not signed in, show "Sign in to sync your preferences" with a sign-in link.

**Club notifications section:**
```
┌──────────────────────────────────────┐
│  Club Notifications                  │
│  Get notified on every score update  │
│                                      │
│  [Barryroe              ×]           │
│  [Midleton              ×]           │
│  + Follow another club               │
└──────────────────────────────────────┘
```

"+ Follow another club" opens a searchable list of Cork clubs with PROs
registered. Selecting a club calls `POST /api/subscribe-minor`.

**Senior results link:**
```
  Senior county results →   (text link to /senior)
```

---

### `src/pages/Senior.jsx` — new, secondary

A simple page showing senior county hurling fixtures and results pulled from
the existing TheSportsDB/`api/fixtures` endpoint. No changes to that API.

Presented as "Senior County Hurling — Powered by TheSportsDB" with a clear
label so users understand it is supplementary data, not the main feature.

Uses the existing `MiniResultCard` and `MiniFixtureCard` components.
Accessible from the Settings page — not in BottomNav.

---

### `src/pages/Submit.jsx` — PRO score entry tool

Standalone page (no Header/BottomNav). PROs bookmark and add to home screen.

```
┌─────────────────────────────────┐
│  Minor Score Entry              │
│  CMHC · Round 3                 │
│  Caheragh · 3:00pm              │
├─────────────────────────────────┤
│  Barryroe                       │
│  Goals [1]   Points [08]        │
│                                 │
│  Midleton                       │
│  Goals [0]   Points [12]        │
│                                 │
│  Period: [Q1] [HT] [Q2] [FT]   │
│                                 │
│     [ Submit Score ]            │
│  Last saved: HT · 3:03pm       │
└─────────────────────────────────┘
```

Score input: separate Goals (0–9, 1 char) and Points (0–30, 2 chars) fields.
`inputMode="numeric"`. Pre-fills from last submission.
Period: four pill buttons, one active.
Submit: POST to `/api/submit-score` with Clerk Bearer token (`getToken()`).
Success: green "Score saved ✓" toast. Error: red "Failed — try again".
Sign out link in top-right corner.

If no game assigned today: "No game assigned for today. Contact the county board."

---

### `src/pages/Admin.jsx` — county board admin panel

Standalone page. Three tabs: **Live** (default), **Games**, **PROs**.

#### Live tab

Real-time scoreboard of all today's games. Uses Supabase Realtime:

```js
supabase.channel('score-updates')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'score_updates' },
    (payload) => { /* update relevant game in local state */ }
  ).subscribe()
```

PRO status per game:
- 🟢 Active — submitted within last 20 min
- 🟡 Quiet — 20–45 min since last update
- 🔴 Silent — 45+ min (possible issue)

#### Games tab

List of all games, grouped by date. Add/edit/delete form for creating fixtures.
Fields: Home club (dropdown from `clubs`), Away club, Competition (dropdown),
Venue, Date+time (`datetime-local`), Assign PRO (dropdown from `pros`).

#### PROs tab

List of registered PROs (name, club, email).
Add PRO form: Name, Email, Club (dropdown), Clerk User ID (copy from Clerk dashboard).
Remove button per row.
Instructions: "First create the user's account in the Clerk dashboard, then add their Clerk User ID here."

---

## 13. Key Components to Build

### `MinorGameCard` — live game card

Replaces `MiniResultCard` for minor games. Purple left bar, pale purple
background, pulsing `MINOR · LIVE` badge, club crests if available,
period label between scores.

```jsx
<article className="flex rounded-2xl mb-2 overflow-hidden shadow-sm border border-purple-200"
  style={{ backgroundColor: '#F3EFFE' }}>
  <div className="w-2 shrink-0 bg-gaa-minor" />
  <div className="flex-1 p-3">
    <LiveBadge period={game.period} />
    <p className="text-[11px] font-bold text-gaa-minor mb-2">{game.competition_short}</p>
    <ScoreRow game={game} />
  </div>
</article>
```

### `FixtureCard` — upcoming game card

Simpler card. No score. Shows teams, time, venue.

### `ClubHeroCard` — Today page hero

Accepts `club`, `nextGame` props. Uses `useClubTheme()` for dynamic colours.

### `StandingsTable` — league table component

Accepts `rows` array. Highlights the user's home club row.

### `LiveBadge` — reusable live/period indicator

```jsx
function LiveBadge({ period }) {
  const isLive = period && period !== 'FT'
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-gaa-minor">
      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-gaa-minor animate-pulse" />}
      {isLive ? `Minor · ${period}` : 'Minor · FT'}
    </span>
  )
}
```

---

## 14. Hooks to Build

| Hook | File | Purpose |
|------|------|---------|
| `useGames(date, filters)` | `src/hooks/useGames.js` | Fetches `/api/games`, refetches every 2 min |
| `useStandings(competitionId)` | `src/hooks/useStandings.js` | Fetches `/api/standings` |
| `useClubs()` | `src/hooks/useClubs.js` | Fetches all clubs from Supabase anon key |
| `useCompetitions()` | `src/hooks/useCompetitions.js` | Fetches active competitions |
| `useClubTheme()` | `src/hooks/useClubTheme.js` | Returns dynamic colour + crest for home club |
| `useClubNotifications()` | `src/hooks/useClubNotifications.js` | Manages club follow list + push subscription |

`useGames` mirrors the existing `useLiveRss` polling pattern exactly:
`refetchInterval: 2 * 60 * 1000, refetchIntervalInBackground: false`.

---

## 15. Zustand Store Changes

Extend `src/store/appStore.js`. Keep existing fields, add:

```js
homeClubId:    null,          // uuid — user's home club (replaces favouriteCounty)
followedClubs: [],            // string[] — club names followed for push notifications
setHomeClub:   (id) => ...,
setFollowedClubs: (clubs) => ...,
```

Keep `favouriteCounty` for now — the senior section still uses it.
Both are persisted to localStorage via Zustand persist middleware (already set up).

---

## 16. Tailwind Config Changes

In `tailwind.config.js`, inside `theme.extend.colors.gaa`, add:
```js
minor:        '#7C3AED',   // purple — minor accent colour
'minor-soft': '#F3EFFE',   // pale purple card background
```

---

## 17. Visual Distinction — Minor vs Senior

| Signal | Minor game card | Senior card (secondary) |
|--------|----------------|------------------------|
| Left sidebar | Solid purple `#7C3AED` | Hurling amber |
| Card background | Pale purple `#F3EFFE` | White |
| Badge | `MINOR · LIVE` purple pulse pill | None |
| Score colour (live) | Purple | Dark grey |
| Period label | Shown (Q1/HT/Q2/FT) | FT only |
| Section header dot | Purple pulse | Red pulse |
| Nav tab | Primary — **Today** | Hidden (Settings → Senior link) |

---

## 18. Implementation Order

### Phase 1 — Foundation (no visible UI changes)
1. Add all env vars to `.env.local` and Vercel dashboard.
2. Run Supabase SQL schema from Section 6.
3. Create `api/_supabase.js`, `api/_clerk.js`, `api/_auth.js`, `src/lib/supabase.js`.
4. Add `gaa-minor` + `gaa-minor-soft` to `tailwind.config.js`.
5. Extend Zustand store with `homeClubId` and `followedClubs`.

### Phase 2 — Auth
6. Wrap `src/main.jsx` with `ClerkProvider`.
7. Add `/login` and `/signup` routes (Clerk components).
8. Build `ProtectedRoute` component.
9. Add `<UserButton />` / `<SignInButton />` to `Header.jsx`.

### Phase 3 — Core API
10. `GET /api/games` — public games endpoint.
11. `GET /api/standings` — standings calculation.
12. `POST /api/submit-score` — with push notification call.
13. `POST /api/subscribe-minor` — per-club push.
14. `POST /api/admin/games`, `POST /api/admin/clubs`, `POST /api/admin/pros`.
15. `POST /api/user/profile`.

### Phase 4 — PRO tool (build before first match day)
16. `src/pages/Submit.jsx` — test end-to-end with a real game in Supabase.

### Phase 5 — Admin panel
17. `src/pages/Admin.jsx` — Live tab first (Supabase Realtime), then Games, then PROs.

### Phase 6 — Fan-facing pages
18. Build hooks: `useGames`, `useStandings`, `useClubs`, `useCompetitions`, `useClubTheme`, `useClubNotifications`.
19. Build components: `MinorGameCard`, `FixtureCard`, `ClubHeroCard`, `StandingsTable`, `LiveBadge`.
20. Replace BottomNav with four-tab version.
21. `src/pages/Today.jsx` — club hero card, live section, later today, tomorrow.
22. `src/pages/Fixtures.jsx` — grouped upcoming fixtures with filters.
23. `src/pages/Table.jsx` — competition selector + standings table.
24. `src/pages/Settings.jsx` — add club identity, club notifications, senior link.
25. `src/pages/Senior.jsx` — secondary senior results using existing API + components.

---

## 19. Notes

- **Public access is fully preserved.** Every fan-facing page (Today, Fixtures,
  Table) works without any account. Auth is only required for PRO score entry
  and the admin panel.
- **Cork-first, world-ready.** Every query filters by `county`, `grade`, and
  `code`. Adding Tipperary minor hurling = insert clubs and competitions with
  `county = 'Tipperary'`. Zero code changes.
- **Senior data untouched.** `api/fixtures.js`, `api/poll-scores.js`,
  `api/scores.js` and their Redis keys are not modified. They power the
  secondary `/senior` page exactly as before.
- **Foireann future integration.** When a county board API key is available,
  `api/admin/games` can be extended to auto-import from Foireann. The
  Supabase schema requires no changes — Foireann fixture IDs can be stored
  in an optional `external_id` column added later.
- **Standings for championship (knockout).** The `competitions.format` field
  distinguishes `league` from `championship`. The Table page shows the bracket
  placeholder for championship format — actual bracket view is a future enhancement.
- **Club colours.** The `clubs` table stores `primary_colour` and
  `secondary_colour` as hex strings. Seed these when adding Cork clubs.
  The existing `COUNTY_COLOURS` map in `countyColours.js` is used only by
  the senior section — club colours come from Supabase.
