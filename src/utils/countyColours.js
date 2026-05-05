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

const WP = 'https://en.wikipedia.org/wiki/Special:FilePath'
const WC = 'https://commons.wikimedia.org/wiki/Special:FilePath'

// GAA county colours strips from Wikimedia Commons (SVG stripe patterns)
export const COUNTY_FLAGS = {
  Antrim:    `${WC}/Colours_of_Antrim.svg`,
  Armagh:    `${WC}/Colours_of_Armagh.svg`,
  Carlow:    `${WC}/Colours_of_Carlow.svg`,
  Clare:     `${WC}/Colours_of_Clare.svg`,
  Cork:      `${WC}/Colours_of_Cork.svg`,
  Derry:     `${WC}/Colours_of_Derry.svg`,
  Donegal:   `${WC}/Colours_of_Donegal_GAA.svg`,
  Down:      `${WC}/Colours_of_Down.svg`,
  Dublin:    `${WC}/Colours_of_Dublin.svg`,
  Galway:    `${WC}/Colours_of_Galway.svg`,
  Kerry:     `${WC}/Colours_of_Kerry_GAA.svg`,
  Kildare:   `${WC}/Colours_of_Kildare.svg`,
  Kilkenny:  `${WC}/Colours_of_Kilkenny.svg`,
  Laois:     `${WC}/Colours_of_Laois.svg`,
  Leitrim:   `${WC}/Colours_of_Leitrim.svg`,
  Limerick:  `${WC}/Limerick_colours.PNG`,
  Longford:  `${WC}/Colours_of_Longford_GAA.svg`,
  Mayo:      `${WC}/Colours_of_Mayo.svg`,
  Meath:     `${WC}/Colours_of_Meath_GAA.svg`,
  Monaghan:  `${WC}/Colours_of_Monaghan.svg`,
  Offaly:    `${WC}/Colours_of_Offaly.svg`,
  Roscommon: `${WC}/Colours_of_Roscommon.svg`,
  Sligo:     `${WC}/Colours_of_Sligo.svg`,
  Tipperary: `${WC}/Colours_of_Tipperary.svg`,
  Tyrone:    `${WC}/Colours_of_Tyrone.svg`,
  Wexford:   `${WC}/Colours_of_Wexford.svg`,
  Wicklow:   `${WC}/Colours_of_Wicklow.svg`,
  // Cavan, Fermanagh, Louth, Waterford, Westmeath have no confirmed colours SVG on Commons
}

// Official GAA county crests from Wikipedia (fair-use logos)
export const COUNTY_CRESTS = {
  Antrim:    `${WP}/Antrim_GAA_crest.png`,
  Armagh:    `${WP}/Armagh_GAA_crest.png`,
  Carlow:    `${WP}/Carlow_GAA_crest.png`,
  Cavan:     `${WP}/Cavan_GAA_crest.png`,
  Clare:     `${WP}/Clare_GAA_crest.png`,
  Cork:      `${WP}/Cork_GAA_crest.svg`,
  Derry:     `${WP}/Derry_GAA_crest.jpg`,
  Donegal:   `${WP}/Donegal_GAA_crest.png`,
  Down:      `${WP}/Down_GAA_crest.png`,
  Dublin:    `${WP}/Dublin_GAA_crest.png`,
  Fermanagh: `${WP}/Fermanagh_GAA_crest.svg`,
  Galway:    `${WP}/Galway_GAA_crest_2013.jpg`,
  Kerry:     `${WP}/Kerry_gaa_crest.png`,
  Kildare:   `${WP}/Kildare_GAA_crest.png`,
  Kilkenny:  `${WP}/Kilkenny_GAA_Crest.jpeg`,
  Laois:     `${WP}/Laois_GAA_Crest_2005.jpeg`,
  Leitrim:   `${WP}/Leitrim_GAA_crest_2007.gif`,
  Limerick:  `${WP}/Limerick_GAA_crest.jpg`,
  Longford:  `${WP}/Longford-GAA.png`,
  Louth:     `${WP}/Louth_GAA_crest.jpg`,
  Mayo:      `${WP}/Mayo_GAA_crest.jpg`,
  Meath:     `${WP}/Meath_GAA_crest.svg`,
  Monaghan:  `${WP}/Monaghan_GAA_crest.jpg`,
  Offaly:    `${WP}/Offaly_GAA_crest.jpg`,
  Roscommon: `${WP}/Roscommon_GAA_crest.svg`,
  Sligo:     `${WP}/Sligo_GAA_crest.svg`,
  Tipperary: `${WP}/Tipperary_GAA_crest.svg`,
  Tyrone:    `${WP}/Tyrone_gaa_logo.png`,
  Waterford: `${WP}/Waterford_GAA_crest.svg`,
  Westmeath: `${WP}/Westmeath_GAA_crest.jpg`,
  Wexford:   `${WP}/Wexford_GAA_crest.svg`,
  Wicklow:   `${WP}/Wicklow_gaa_crest.png`,
}

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
