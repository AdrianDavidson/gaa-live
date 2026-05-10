import { supabase }    from '../_supabase.js'
import { requireAuth } from '../_auth.js'

export default async function handler(req, res) {
  const auth = await requireAuth(req, res, [])
  if (!auth) return

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('home_club_id')
      .eq('clerk_id', auth.userId)
      .single()

    // PGRST116 = no rows found — not an error, just a new user
    if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message })
    return res.json({ homeClubId: data?.home_club_id ?? null })
  }

  if (req.method === 'POST') {
    const { homeClubId } = req.body
    const { clerkUser }  = auth

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(
        {
          clerk_id:     auth.userId,
          email:        clerkUser.emailAddresses?.[0]?.emailAddress ?? '',
          home_club_id: homeClubId ?? null,
        },
        { onConflict: 'clerk_id' }
      )
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
