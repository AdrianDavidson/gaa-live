# GAA Live Hurling Scores — Project Context & Rules

## What This App Does

A Progressive Web App (PWA) for following live GAA hurling fixtures, results, and live scores.
Users can install it to their home screen, receive push notifications for new results, and check
scores on match day. The target audience is hurling fans — the UX should be clear, fast, and
mobile-first.

---

## Tech Stack

| Layer       | Technology                                     |
|-------------|------------------------------------------------|
| Frontend    | React (JSX), Vite, Tailwind CSS                |
| Hosting     | Vercel (Hobby plan)                            |
| API         | Vercel Serverless Functions (`/api/*.js`)      |
| Cache       | Upstash Redis (REST API via `@upstash/redis`)  |
| Data source | TheSportsDB free API (key `3`, no auth needed) |
| Push notifs | Web Push (`web-push` library) + VAPID keys     |
| PWA         | `vite-plugin-pwa`, manifest in `public/`       |

---

## Project Structure

```
/
├── api/
│   ├── fixtures.js      # Aggregates TheSportsDB results+fixtures, caches 5 min in Redis
│   ├── poll-scores.js   # Polls RSS feeds (RTE/BBC/Hoganstand), min 2-min refresh gate
│   ├── scores.js        # Reads latest RSS data from Redis (read-only)
│   └── subscribe.js     # Saves web push subscriptions to Redis
│
├── src/
│   ├── pages/
│   │   ├── Home.jsx         # Landing / summary view
│   │   ├── LiveScores.jsx   # Live match window + RSS news feed
│   │   ├── Results.jsx      # Past results with W/L colour coding
│   │   ├── Fixtures.jsx     # Upcoming fixtures
│   │   ├── Watch.jsx        # YouTube stream finder
│   │   └── Settings.jsx     # Notifications, preferences
│   │
│   ├── components/
│   │   ├── layout/          # Header, BottomNav, Layout, PageWrapper
│   │   ├── scores/          # GAAScore, MatchList, ScoreCard
│   │   ├── ui/              # Button, Card, Spinner, CountyColourBadge
│   │   ├── data-tier/       # TierBadge, DataSourceNotice, UnavailableNotice
│   │   ├── notifications/   # NotificationBanner, NotificationToggle
│   │   └── streams/         # EmbedPlayer, StreamFinder
│   │
│   ├── hooks/
│   │   ├── useFixtures.js       # React Query wrapper for /api/fixtures
│   │   ├── useLiveRss.js        # Polls /api/poll-scores during live windows
│   │   ├── useMatchData.js      # Per-match tier resolver
│   │   ├── usePushNotifications.js
│   │   └── useYouTubeStream.js
│   │
│   ├── services/
│   │   ├── fixturesService.js   # Fetch from /api/fixtures (prod) or TSDB direct (dev)
│   │   ├── theSportsDbService.js
│   │   ├── dataTierResolver.js  # Tier 1/2/3 logic (stream > live > polled > none)
│   │   ├── rssService.js
│   │   ├── pushService.js
│   │   └── youtubeService.js
│   │
│   ├── data/
│   │   ├── competitions.js      # Competition IDs, groups, TheSportsDB IDs
│   │   └── mockFixtures.js
│   │
│   └── utils/
│       ├── countyColours.js     # { primary, secondary } hex for all 32 counties
│       ├── matchStatus.js       # isMatchWindow, getElapsedMinutes, formatTimeAgo
│       └── formatters.js        # formatMatchDate, formatDateGroup (date-fns)
```

---

## Data Flow

### Fixtures & Results
```
Browser → /api/fixtures (Vercel fn)
        → Redis cache hit? → return cached (TTL 5 min)
        → Cache miss → TheSportsDB (eventspastleague + eventsnextleague for 5 competitions)
                     → normalise → cache in Redis → return
```

### Live RSS News
```
Browser (match window only) → /api/poll-scores every 2 min
        → Check gaa:rss:updatedAt age in Redis
        → < 2 min old → return cached items immediately (no RSS fetch)
        → ≥ 2 min old → fetch RTE/BBC/Hoganstand RSS → store in Redis → return items
```

### Push Notifications
```
/api/poll-scores → if RSS changed → compare titles → send webpush to all subscribers
```

---

## Key Constraints

- **Vercel Hobby plan**: 1 cron job per day max. Cron is `0 8 * * *` (08:00 UTC daily).
  Client-side polling of `/api/poll-scores` is how we get more-frequent updates during live windows.
- **TheSportsDB free tier**: key `3`, no registration. Rate limits apply but 10 requests per
  cache refresh cycle (5 competitions × 2 endpoints) is well within limits.
- **No real-time score API**: TheSportsDB publishes final scores typically within minutes of
  full time. True in-game scores would require the Foireann/Score Beo partnership API (not yet
  integrated).
- **RSS as live fallback**: RTE Sport, BBC Sport, Hoganstand RSS feeds publish headlines during
  and after matches. These are filtered by team name and shown in the live card.

---

## Competition Data

Five hurling competitions from TheSportsDB:

| ID             | TheSportsDB ID | Short name    |
|----------------|----------------|---------------|
| ai-shc         | 5565           | AI SHC        |
| munster-shc    | 5570           | Munster SHC   |
| leinster-shc   | 5571           | Leinster SHC  |
| mcdonagh-cup   | 5572           | McDonagh      |
| christy-ring   | 5573           | Christy Ring  |

Additional competitions (Allianz League, U20, Camogie) need the Foireann API to activate.

---

## Score Format

GAA scores are in the form `Goals-Points (Total)`. TheSportsDB stores them in `strResult`
as e.g. `"1-18 (21) 3-25 (34)"`. We parse this into `{ gp: "1-18", total: 21 }` objects.
Display as `1-18 (21)` — goals-points with the total in parentheses.

---

## County Colours

`src/utils/countyColours.js` has `{ primary, secondary }` hex colours for all 32 counties.
`src/components/ui/CountyColourBadge.jsx` renders a small circle split left/right between
the two colours, shown inline next to team names on all match cards.

---

## Environment Variables

| Variable                   | Used by                    | Notes                           |
|----------------------------|----------------------------|---------------------------------|
| `UPSTASH_REDIS_REST_URL`   | All `/api/*.js` functions  | Upstash Redis REST endpoint     |
| `UPSTASH_REDIS_REST_TOKEN` | All `/api/*.js` functions  | Upstash auth token              |
| `VAPID_PUBLIC_KEY`         | `api/poll-scores.js`       | Web Push VAPID public key       |
| `VAPID_PRIVATE_KEY`        | `api/poll-scores.js`       | Web Push VAPID private key      |
| `VITE_USE_DIRECT_API`      | `fixturesService.js`       | Set `true` in dev to bypass API |

---

## Local Development

```bash
npm run dev        # Vite dev server (frontend only)
vercel dev         # Full stack with serverless functions (needs Vercel CLI)
```

In `dev` mode with `VITE_USE_DIRECT_API=true`, the browser calls TheSportsDB directly —
no Redis needed. RSS polling (`useLiveRss`) calls `/api/poll-scores` so `vercel dev` is
needed to test that path end-to-end.

---

## Rules

These rules apply to every interaction in this project. Add new rules here as instructed.

### 1 — Test before commit
Always tell me when changes are complete and allow me to test locally before committing
anything to git. Never commit or push without explicit confirmation.

### 2 — Token limit warning
When the current agent session is approaching 30,000 tokens, warn me with:
> "Token limit approaching — please start a new agent session."

### 3 — User-friendly first
Always develop with the final output being as user-friendly as possible. Prioritise:
- Clear, plain-English labels and empty states
- Mobile-first layout and tap target sizes
- Accessible markup (aria labels, roles, live regions)
- Fast perceived performance (skeletons, optimistic UI)
