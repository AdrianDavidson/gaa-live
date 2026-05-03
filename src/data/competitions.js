// TheSportsDB free key is "3" — no registration needed.
// IDs confirmed via live API probe May 2026.
// Times from TheSportsDB are UTC — converted to IST (+01:00) at fetch time.

export const HURLING_COMPETITIONS = [
  {
    id:             'ai-shc',
    theSportsDbId:  5565,
    name:           'All-Ireland Senior Hurling Championship',
    short:          'AI SHC',
    group:          'senior',
  },
  {
    id:             'munster-shc',
    theSportsDbId:  5570,
    name:           'Munster Senior Hurling Championship',
    short:          'Munster SHC',
    group:          'senior',
  },
  {
    id:             'leinster-shc',
    theSportsDbId:  5571,
    name:           'Leinster Senior Hurling Championship',
    short:          'Leinster SHC',
    group:          'senior',
  },
  {
    id:             'mcdonagh-cup',
    theSportsDbId:  5572,
    name:           'Joe McDonagh Cup',
    short:          'McDonagh',
    group:          'senior',
  },
  {
    id:             'christy-ring',
    theSportsDbId:  5573,
    name:           'Christy Ring Cup',
    short:          'Christy Ring',
    group:          'senior',
  },
  // Foireann-sourced competitions (available once API key is configured)
  {
    id:             'allianz-hl',
    theSportsDbId:  null,
    foireannId:     null,  // set once Foireann key obtained
    name:           'Allianz Hurling League',
    short:          'NHL',
    group:          'senior',
  },
  {
    id:             'u20-shc',
    theSportsDbId:  null,
    foireannId:     null,
    name:           'All-Ireland Under-20 SHC',
    short:          'U20 SHC',
    group:          'under20',
  },
  {
    id:             'ai-camogie',
    theSportsDbId:  null,
    foireannId:     null,
    name:           'All-Ireland Camogie Championship',
    short:          'Camogie',
    group:          'camogie',
  },
  {
    id:             'ai-camogie-int',
    theSportsDbId:  null,
    foireannId:     null,
    name:           'All-Ireland Intermediate Camogie',
    short:          'Int. Camogie',
    group:          'camogie',
  },
]

export const COMPETITION_GROUPS = [
  { id: 'all',     label: 'All' },
  { id: 'senior',  label: 'Senior' },
  { id: 'under20', label: 'Under 20' },
  { id: 'camogie', label: 'Camogie' },
]

export function getCompetitionById(id) {
  return HURLING_COMPETITIONS.find((c) => c.id === id)
}

export const ACTIVE_TSDB_COMPETITIONS = HURLING_COMPETITIONS.filter(
  (c) => c.theSportsDbId !== null
)
