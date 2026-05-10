import { supabase }    from '../_supabase.js'
import { requireAuth } from '../_auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = await requireAuth(req, res, [])
  if (!auth) return

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
