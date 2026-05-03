import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout     from './components/layout/Layout'
import Home       from './pages/Home'
import LiveScores from './pages/LiveScores'
import Fixtures   from './pages/Fixtures'
import Results    from './pages/Results'
import Watch      from './pages/Watch'
import Settings   from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index            element={<Home />} />
          <Route path="live"      element={<LiveScores />} />
          <Route path="fixtures"  element={<Fixtures />} />
          <Route path="results"   element={<Results />} />
          <Route path="watch"     element={<Watch />} />
          <Route path="settings"  element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
