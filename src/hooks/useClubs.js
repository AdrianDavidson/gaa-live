import { useQuery }  from '@tanstack/react-query'
import { supabase }  from '../lib/supabase'

async function fetchClubs() {
  const { data, error } = await supabase
    .from('clubs')
    .select('id, name, county, primary_colour, secondary_colour, crest_url')
    .order('name')
  if (error) throw error
  return data
}

export function useClubs() {
  return useQuery({
    queryKey: ['clubs'],
    queryFn:  fetchClubs,
    staleTime: 10 * 60 * 1000,
  })
}
