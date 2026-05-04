import { createContext, useContext, useState } from 'react'

const STORAGE_KEY  = 'gaa.codeFilter'
const VALID_VALUES = ['all', 'football', 'hurling']

const CodeFilterContext = createContext({ filter: 'all', setFilter: () => {} })

function readStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return VALID_VALUES.includes(saved) ? saved : 'all'
  } catch {
    return 'all'
  }
}

export function CodeFilterProvider({ children }) {
  const [filter, setFilterState] = useState(readStorage)

  function setFilter(value) {
    if (!VALID_VALUES.includes(value)) return
    setFilterState(value)
    try { localStorage.setItem(STORAGE_KEY, value) } catch {}
  }

  return (
    <CodeFilterContext.Provider value={{ filter, setFilter }}>
      {children}
    </CodeFilterContext.Provider>
  )
}

export function useCodeFilter() {
  return useContext(CodeFilterContext)
}
