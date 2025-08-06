import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { type CreateCandidateData } from '@/types/recruitment'

export function useCreateCandidate() {
  const { user } = useApp()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCandidateData & { skills?: string[], languages?: string[], cv_file_path?: string, availability_date?: string }) => {
      if (!user?.org_id || !user?.id) {
        throw new Error('Usuario no autenticado')
      }

      console.log('🚀 [useCreateCandidate] Creating candidate with data:', data)

      const { error } = await supabase
        .from('candidates')
        .insert({
          ...data,
          org_id: user.org_id,
          created_by: user.id,
          status: 'new'
        })

      if (error) {
        console.error('❌ [useCreateCandidate] Error:', error)
        throw error
      }

      console.log('✅ [useCreateCandidate] Candidate created successfully')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['recruitment-stats'] })
      toast.success('Candidato creado correctamente')
    },
    onError: (error) => {
      console.error('❌ [useCreateCandidate] Mutation error:', error)
      toast.error('Error al crear el candidato')
    }
  })
}

export function useUpdateCandidate() {
  const { user } = useApp()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { 
      id: string, 
      data: Partial<CreateCandidateData> & { skills?: string[], languages?: string[], cv_file_path?: string, availability_date?: string }
    }) => {
      if (!user?.org_id) {
        throw new Error('Usuario no autenticado')
      }

      console.log('🚀 [useUpdateCandidate] Updating candidate:', id, 'with data:', data)

      const { error } = await supabase
        .from('candidates')
        .update(data)
        .eq('id', id)
        .eq('org_id', user.org_id)

      if (error) {
        console.error('❌ [useUpdateCandidate] Error:', error)
        throw error
      }

      console.log('✅ [useUpdateCandidate] Candidate updated successfully')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['recruitment-stats'] })
      toast.success('Candidato actualizado correctamente')
    },
    onError: (error) => {
      console.error('❌ [useUpdateCandidate] Mutation error:', error)
      toast.error('Error al actualizar el candidato')
    }
  })
}

export function useCandidates() {
  const { user } = useApp()

  return useQuery({
    queryKey: ['candidates', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) {
        throw new Error('Usuario no autenticado')
      }

      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [useCandidates] Error:', error)
        throw error
      }

      return data || []
    },
    enabled: !!user?.org_id
  })
}

export function useCandidate(id: string) {
  const { user } = useApp()

  return useQuery({
    queryKey: ['candidate', id],
    queryFn: async () => {
      if (!user?.org_id || !id) {
        throw new Error('Parámetros faltantes')
      }

      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', id)
        .eq('org_id', user.org_id)
        .single()

      if (error) {
        console.error('❌ [useCandidate] Error:', error)
        throw error
      }

      return data
    },
    enabled: !!user?.org_id && !!id
  })
}