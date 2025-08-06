import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { type CreateInterviewData } from '@/types/recruitment'

export function useCreateInterview() {
  const { user } = useApp()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateInterviewData) => {
      if (!user?.org_id || !user?.id) {
        throw new Error('Usuario no autenticado')
      }

      console.log('🚀 [useCreateInterview] Creating interview with data:', data)

      const { error } = await supabase
        .from('interviews')
        .insert({
          ...data,
          org_id: user.org_id,
          created_by: user.id,
          status: 'scheduled'
        })

      if (error) {
        console.error('❌ [useCreateInterview] Error:', error)
        throw error
      }

      console.log('✅ [useCreateInterview] Interview created successfully')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      queryClient.invalidateQueries({ queryKey: ['upcoming-interviews'] })
      queryClient.invalidateQueries({ queryKey: ['recruitment-stats'] })
      toast.success('Entrevista programada correctamente')
    },
    onError: (error) => {
      console.error('❌ [useCreateInterview] Mutation error:', error)
      toast.error('Error al programar la entrevista')
    }
  })
}

export function useInterviews() {
  const { user } = useApp()

  return useQuery({
    queryKey: ['interviews', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) {
        throw new Error('Usuario no autenticado')
      }

      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          candidate:candidates(id, first_name, last_name, email)
        `)
        .eq('org_id', user.org_id)
        .order('scheduled_at', { ascending: true })

      if (error) {
        console.error('❌ [useInterviews] Error:', error)
        throw error
      }

      return data || []
    },
    enabled: !!user?.org_id
  })
}

export function useUpcomingInterviews() {
  const { user } = useApp()

  return useQuery({
    queryKey: ['upcoming-interviews', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) {
        throw new Error('Usuario no autenticado')
      }

      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          candidate:candidates(id, first_name, last_name, email)
        `)
        .eq('org_id', user.org_id)
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(10)

      if (error) {
        console.error('❌ [useUpcomingInterviews] Error:', error)
        throw error
      }

      return data || []
    },
    enabled: !!user?.org_id
  })
}