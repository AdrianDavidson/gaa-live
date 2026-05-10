import { useQuery }  from '@tanstack/react-query'
import { supabase }  from '../lib/supabase'

async function fetchCompetitions() {
  const { data, error } = await supabase
    .from('competitions')
    .select('id, name, short_name, county, grade, code, season, format')
    .order('name')
  if (error) throw error
  return data
}

export function useCompetitions() {
  return useQuery({
    queryKey: ['competitions'],
    queryFn:  fetchCompetitions,
    staleTime: 10 * 60 * 1000,
  })
}
