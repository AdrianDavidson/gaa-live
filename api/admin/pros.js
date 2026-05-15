import { supabase }    from '../_supabase.js'
import { requireAuth } from '../_auth.js'

export default async function handler(req, res) {
  const auth = await requireAuth(req, res, ['admin'])
  if (!auth) return

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('pros')
      .select('id, name, email, clerk_id, club:clubs!club_id(id, name)')
      .order('name')
    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }

  if (req.method === 'POST') {
    const { clerkId, name, email, clubId } = req.body
    if (!clerkId || !name || !email) {
      return res.status(400).json({ error: 'clerkId, name, email required' })
    }
    const { data, error } = await supabase
      .from('pros')
      .insert({ clerk_id: clerkId, name, email, club_id: clubId || null })
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    const { error } = await supabase.from('pros').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
