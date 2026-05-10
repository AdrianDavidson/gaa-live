import { createClient } from '@supabase/supabase-js'

const url  = import.meta.env.VITE_SUPABASE_URL
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY

// Falls back to a dummy client when env vars aren't set yet (local dev without Supabase).
// All queries will fail gracefully — React Query will return isError:true.
export const supabase = createClient(
  url  ?? 'https://placeholder.supabase.co',
  key  ?? 'placeholder'
)
