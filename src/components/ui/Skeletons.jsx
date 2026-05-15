// Skeleton components — each matches the exact layout of its real counterpart.
// All use dark-theme surfaces: bg-gaa-surface cards, bg-gaa-surface-raised bones.

function Bone({ w = '', h = '', extra = '' }) {
  return <div className={`rounded bg-gaa-surface-raised ${h} ${w} ${extra}`} aria-hidden="true" />
}

function SkeletonFilterPills({ count = 4 }) {
  const widths = ['w-16', 'w-14', 'w-24', 'w-20', 'w-16', 'w-20']
  return (
    <div className="flex gap-2 pb-2 -mx-4 px-4 mb-4 overflow-hidden" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`shrink-0 ${widths[i % widths.length]} h-9 bg-gaa-surface-raised rounded-full`} />
      ))}
    </div>
  )
}

function SkeletonDateHeader() {
  return (
    <div className="flex items-center gap-2 mb-2" aria-hidden="true">
      <div className="w-1 h-3 bg-gaa-surface-raised rounded-full" />
      <Bone h="h-3" w="w-28" />
    </div>
  )
}

function SkeletonSectionHeading() {
  return (
    <div className="flex items-center gap-2 mb-3" aria-hidden="true">
      <div className="w-2 h-2 bg-gaa-surface-raised rounded-full" />
      <Bone h="h-3.5" w="w-20" />
    </div>
  )
}

// ---- FixtureCard skeleton ---------------------------------------------------
export function SkeletonFixtureCard() {
  return (
    <div className="flex bg-gaa-surface border border-gaa-border rounded-2xl mb-2 overflow-hidden shadow-sm" aria-hidden="true">
      <div className="w-1.5 shrink-0 bg-gaa-surface-raised" />
      <div className="flex-1 p-3">
        <Bone h="h-3" w="w-16" extra="mb-2" />
        <div className="flex items-center justify-between gap-2">
          <Bone h="h-4" w="w-28" />
          <Bone h="h-3" w="w-4" />
          <Bone h="h-4" w="w-24" />
        </div>
        <div className="flex items-center gap-3 mt-2">
          <Bone h="h-3" w="w-28" />
          <Bone h="h-3" w="w-20" />
        </div>
      </div>
    </div>
  )
}

// ---- MinorGameCard skeleton -------------------------------------------------
export function SkeletonMinorGameCard() {
  return (
    <div
      className="flex rounded-2xl mb-2 overflow-hidden shadow-sm border border-gaa-border"
      style={{ backgroundColor: '#1a1a1a' }}
      aria-hidden="true"
    >
      <div className="w-1.5 shrink-0 bg-gaa-surface-raised" />
      <div className="flex-1 p-3">
        <div className="flex items-center justify-between mb-2">
          <Bone h="h-2.5" w="w-20" />
          <Bone h="h-2.5" w="w-12" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Bone h="h-4" w="w-28" />
            <Bone h="h-7" w="w-14" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Bone h="h-4" w="w-24" />
            <Bone h="h-7" w="w-14" />
          </div>
        </div>
        <Bone h="h-3" w="w-24" extra="mt-2" />
      </div>
    </div>
  )
}

// ---- ClubHeroCard skeleton --------------------------------------------------
export function SkeletonClubHeroCard() {
  return (
    <div className="rounded-2xl p-4 border border-gaa-border bg-gaa-surface" aria-hidden="true">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-gaa-surface-raised rounded-full shrink-0" />
        <div className="space-y-1.5">
          <Bone h="h-4"   w="w-28" />
          <Bone h="h-2.5" w="w-20" />
        </div>
      </div>
      <Bone h="h-3" w="w-20" extra="mb-3" />
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Bone h="h-4" w="w-20" extra="ml-auto" />
        <Bone h="h-3" w="w-28" extra="mx-2" />
        <Bone h="h-4" w="w-20" />
      </div>
      <Bone h="h-3" w="w-24" extra="mt-3 mx-auto" />
    </div>
  )
}

// ---- ResultCard skeleton ----------------------------------------------------
export function SkeletonResultCard() {
  return (
    <div
      className="flex rounded-2xl mb-2 overflow-hidden shadow-sm border border-gaa-border"
      style={{ backgroundColor: '#1a1a1a' }}
      aria-hidden="true"
    >
      <div className="w-1.5 shrink-0 bg-gaa-surface-raised" />
      <div className="flex-1 p-3">
        <div className="flex items-center justify-between mb-2">
          <Bone h="h-3" w="w-16" />
          <div className="h-5 w-8 bg-gaa-surface-raised rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Bone h="h-4" w="w-24" />
            <Bone h="h-7" w="w-16" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Bone h="h-4" w="w-20" />
            <Bone h="h-7" w="w-16" />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <Bone h="h-3" w="w-24" />
          <Bone h="h-3" w="w-20" />
        </div>
      </div>
    </div>
  )
}

// ---- StandingsTable skeleton ------------------------------------------------
export function SkeletonStandingsTable() {
  const clubWidths = ['w-20', 'w-24', 'w-16', 'w-28', 'w-20', 'w-16']
  return (
    <div className="overflow-x-auto rounded-xl border border-gaa-border" aria-hidden="true">
      <table className="w-full text-xs min-w-[360px]">
        <thead>
          <tr className="bg-gaa-surface-raised border-b border-gaa-border">
            <th className="px-3 py-2 text-left"><Bone h="h-3" w="w-8" /></th>
            {Array.from({ length: 7 }, (_, i) => (
              <th key={i} className="px-2 py-2"><Bone h="h-3" w="w-4" extra="mx-auto" /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clubWidths.map((w, i) => (
            <tr key={i} className="bg-gaa-surface border-b border-gaa-border last:border-0">
              <td className="px-3 py-2"><Bone h="h-3" w={w} /></td>
              {Array.from({ length: 7 }, (_, j) => (
                <td key={j} className="px-2 py-2"><Bone h="h-3" w="w-4" extra="mx-auto" /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---- Full-page skeletons ────────────────────────────────────────────────────

export function SkeletonTodayPage() {
  return (
    <div className="space-y-5 animate-pulse" aria-hidden="true" aria-label="Loading content">
      <SkeletonClubHeroCard />
      <section>
        <SkeletonSectionHeading />
        <SkeletonMinorGameCard />
      </section>
      <section>
        <SkeletonSectionHeading />
        <SkeletonFixtureCard />
        <SkeletonFixtureCard />
      </section>
      <section>
        <SkeletonSectionHeading />
        <SkeletonFixtureCard />
        <SkeletonFixtureCard />
        <SkeletonFixtureCard />
      </section>
    </div>
  )
}

export function SkeletonFixturesPage() {
  return (
    <div className="animate-pulse" aria-hidden="true" aria-label="Loading content">
      <SkeletonFilterPills count={5} />
      <section className="mb-5">
        <SkeletonDateHeader />
        <SkeletonFixtureCard />
        <SkeletonFixtureCard />
        <SkeletonFixtureCard />
      </section>
      <section className="mb-5">
        <SkeletonDateHeader />
        <SkeletonFixtureCard />
        <SkeletonFixtureCard />
      </section>
      <section className="mb-5">
        <SkeletonDateHeader />
        <SkeletonFixtureCard />
        <SkeletonFixtureCard />
      </section>
    </div>
  )
}

export function SkeletonResultsPage() {
  return (
    <div className="animate-pulse" aria-hidden="true" aria-label="Loading content">
      <SkeletonFilterPills count={5} />
      <section className="mb-5">
        <SkeletonDateHeader />
        <SkeletonResultCard />
        <SkeletonResultCard />
        <SkeletonResultCard />
      </section>
      <section className="mb-5">
        <SkeletonDateHeader />
        <SkeletonResultCard />
        <SkeletonResultCard />
      </section>
    </div>
  )
}

export function SkeletonTablePage() {
  return (
    <div className="animate-pulse" aria-hidden="true" aria-label="Loading content">
      <SkeletonFilterPills count={3} />
      <Bone h="h-5" w="w-56" extra="mb-3" />
      <SkeletonStandingsTable />
    </div>
  )
}
