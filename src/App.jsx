import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SignIn, SignUp }               from '@clerk/react'
import Layout                           from './components/layout/Layout'
import { RequirePro, RequireAdmin }     from './components/auth/ProtectedRoute'

import Today    from './pages/Today'
import Fixtures from './pages/Fixtures'
import Results  from './pages/Results'
import Table    from './pages/Table'
import Settings from './pages/Settings'
import Senior   from './pages/Senior'
import Submit   from './pages/Submit'
import Admin    from './pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public fan pages */}
        <Route path="/" element={<Layout />}>
          <Route index            element={<Today />} />
          <Route path="fixtures"  element={<Fixtures />} />
          <Route path="results"   element={<Results />} />
          <Route path="table"     element={<Table />} />
          <Route path="settings"  element={<Settings />} />
          <Route path="senior"    element={<Senior />} />
        </Route>

        {/* Clerk auth pages (no Layout) */}
        <Route path="/login"  element={<SignIn routing="path" path="/login"  afterSignInUrl="/" />} />
        <Route path="/signup" element={<SignUp routing="path" path="/signup" afterSignUpUrl="/" />} />

        {/* Tool pages (no Layout) */}
        <Route path="/submit" element={<RequirePro><Submit /></RequirePro>} />
        <Route path="/admin"  element={<RequireAdmin><Admin /></RequireAdmin>} />
      </Routes>
    </BrowserRouter>
  )
}
