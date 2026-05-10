import { supabase }    from '../_supabase.js'
import { requireAuth } from '../_auth.js'

export default async function handler(req, res) {
  const auth = await requireAuth(req, res, ['admin'])
  if (!auth) return

  if (req.method === 'POST') {
    const { name, county = 'Cork', primaryColour, secondaryColour, crestUrl } = req.body
    const { data, error } = await supabase
      .from('clubs')
      .insert({ name, county, primary_colour: primaryColour, secondary_colour: secondaryColour, crest_url: crestUrl ?? null })
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }

  if (req.method === 'PATCH') {
    const { id } = req.query
    const { name, primaryColour, secondaryColour, crestUrl } = req.body
    const { data, error } = await supabase
      .from('clubs')
      .update({ name, primary_colour: primaryColour, secondary_colour: secondaryColour, crest_url: crestUrl ?? null })
      .eq('id', id)
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
