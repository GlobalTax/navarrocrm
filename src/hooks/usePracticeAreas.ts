
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export interface PracticeArea {
  id: string
  name: string
  description: string | null
  org_id: string
  created_at: string
  updated_at: string
}

export const usePracticeAreas = () => {
  const { user } = useAuth()

  const { data: practiceAreas = [], isLoading, error } = useQuery({
    queryKey: ['practice-areas', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      
      const { data, error } = await supabase
        .from('practice_areas')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    },
    enabled: !!user?.org_id,
  })

  return {
    practiceAreas,
    isLoading,
    error,
  }
}
