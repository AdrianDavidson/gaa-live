export const COUNTY_COLOURS = {
  Antrim:      { primary: '#FFD700', secondary: '#FFFFFF' },
  Armagh:      { primary: '#FF6600', secondary: '#FFFFFF' },
  Carlow:      { primary: '#CC0000', secondary: '#FFD700' },
  Cavan:       { primary: '#003DA5', secondary: '#FFFFFF' },
  Clare:       { primary: '#FFD700', secondary: '#003DA5' },
  Cork:        { primary: '#CC0000', secondary: '#FFFFFF' },
  Derry:       { primary: '#CC0000', secondary: '#FFFFFF' },
  Donegal:     { primary: '#FFD700', secondary: '#006633' },
  Down:        { primary: '#CC0000', secondary: '#FFFF00' },
  Dublin:      { primary: '#003DA5', secondary: '#FFFFFF' },
  Fermanagh:   { primary: '#006633', secondary: '#FFFFFF' },
  Galway:      { primary: '#8B0000', secondary: '#FFFFFF' },
  Kerry:       { primary: '#006633', secondary: '#FFD700' },
  Kildare:     { primary: '#FFFFFF', secondary: '#CC0000' },
  Kilkenny:    { primary: '#000000', secondary: '#FFD700' },
  Laois:       { primary: '#003DA5', secondary: '#FFFFFF' },
  Leitrim:     { primary: '#006633', secondary: '#FFD700' },
  Limerick:    { primary: '#006633', secondary: '#FFFFFF' },
  Longford:    { primary: '#003DA5', secondary: '#FFD700' },
  Louth:       { primary: '#CC0000', secondary: '#FFFFFF' },
  Mayo:        { primary: '#006633', secondary: '#CC0000' },
  Meath:       { primary: '#006633', secondary: '#FFD700' },
  Monaghan:    { primary: '#FFFFFF', secondary: '#003DA5' },
  Offaly:      { primary: '#006633', secondary: '#FFD700' },
  Roscommon:   { primary: '#FFD700', secondary: '#003DA5' },
  Sligo:       { primary: '#000000', secondary: '#FFFFFF' },
  Tipperary:   { primary: '#003DA5', secondary: '#FFD700' },
  Tyrone:      { primary: '#FFFFFF', secondary: '#CC0000' },
  Waterford:   { primary: '#003DA5', secondary: '#FFFFFF' },
  Westmeath:   { primary: '#8B0000', secondary: '#FFFFFF' },
  Wexford:     { primary: '#8B0000', secondary: '#FFD700' },
  Wicklow:     { primary: '#003DA5', secondary: '#FFD700' },
}

// Official 3-letter county codes used in GAA scorecards
export const COUNTY_ABBREV = {
  Antrim:    'ANT', Armagh:    'ARM', Carlow:    'CAR',
  Cavan:     'CAV', Clare:     'CLA', Cork:      'COR',
  Derry:     'DER', Donegal:   'DON', Down:      'DOW',
  Dublin:    'DUB', Fermanagh: 'FER', Galway:    'GAL',
  Kerry:     'KER', Kildare:   'KLD', Kilkenny:  'KLK',
  Laois:     'LAO', Leitrim:   'LET', Limerick:  'LIM',
  Longford:  'LFD', Louth:     'LOU', Mayo:      'MAY',
  Meath:     'MEA', Monaghan:  'MON', Offaly:    'OFF',
  Roscommon: 'ROS', Sligo:     'SLI', Tipperary: 'TIP',
  Tyrone:    'TYR', Waterford: 'WAT', Westmeath: 'WMH',
  Wexford:   'WEX', Wicklow:   'WIC',
}

// Returns '#ffffff' or '#1a1a1a' depending on whether the hex colour is dark or light
export function getTextColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) > 140 ? '#1a1a1a' : '#ffffff'
}

export const ALL_COUNTIES = Object.keys(COUNTY_COLOURS).sort()

// Returns a CSS gradient string for a result card background.
// Solid county colours sit in the bottom corner of the winning side — no opacity.
// Home win → bottom-left corner. Away win → bottom-right corner.
// Use as backgroundImage so dark-mode background-color shows through underneath.
export function winnerGradient(homeTeam, awayTeam, homeWin, awayWin) {
  const winner = homeWin ? homeTeam : awayWin ? awayTeam : null
  if (!winner) return null
  const col = COUNTY_COLOURS[winner]
  if (!col) return null

  // 1px anti-alias gap at each boundary eliminates pixelated diagonal edges
  const dir = homeWin ? 'to top right' : 'to top left'
  return `linear-gradient(${dir}, ${col.primary} calc(12% - 1px), ${col.secondary} calc(12% + 1px), ${col.secondary} calc(22% - 1px), transparent calc(22% + 1px))`
}
