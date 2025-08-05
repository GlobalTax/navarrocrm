import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { type Candidate, type CreateCandidateData } from '@/types/recruitment'

export const useCandidates = () => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['candidates', user?.org_id],
    queryFn: async () => {
      console.log('🔍 [useCandidates] Fetching candidates for org:', user?.org_id)
      
      if (!user?.org_id) {
        console.warn('⚠️ [useCandidates] No org_id available')
        return []
      }

      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [useCandidates] Error fetching candidates:', error)
        throw error
      }

      console.log('✅ [useCandidates] Candidates fetched:', data?.length || 0)
      return data as Candidate[]
    },
    enabled: !!user?.org_id,
  })
}

export const useCreateCandidate = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCandidateData & { skills?: string[], languages?: string[] }) => {
      console.log('🆕 [useCreateCandidate] Creating candidate with data:', data)
      console.log('👤 [useCreateCandidate] User context:', { 
        userId: user?.id, 
        orgId: user?.org_id,
        userEmail: user?.email 
      })

      if (!user?.org_id || !user?.id) {
        console.error('❌ [useCreateCandidate] Missing user context:', { 
          org_id: user?.org_id, 
          user_id: user?.id 
        })
        throw new Error('Usuario no autenticado o sin organización')
      }

      const candidateData = {
        ...data,
        org_id: user.org_id,
        created_by: user.id,
        status: 'new' as const,
      }

      console.log('📝 [useCreateCandidate] Final candidate data to insert:', candidateData)

      const { data: result, error } = await supabase
        .from('candidates')
        .insert(candidateData)
        .select()
        .single()

      if (error) {
        console.error('❌ [useCreateCandidate] Supabase error:', error)
        throw error
      }

      console.log('✅ [useCreateCandidate] Candidate created successfully:', result)
      return result
    },
    onSuccess: (data) => {
      console.log('🎉 [useCreateCandidate] Success callback triggered')
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['recruitment-stats'] })
      toast.success('Candidato creado correctamente')
    },
    onError: (error: any) => {
      console.error('💥 [useCreateCandidate] Error callback triggered:', error)
      
      let errorMessage = 'No se pudo crear el candidato'
      
      if (error.message) {
        if (error.message.includes('row-level security')) {
          errorMessage = 'Sin permisos para crear candidatos'
        } else if (error.message.includes('unique')) {
          errorMessage = 'Ya existe un candidato con ese email'
        } else if (error.message.includes('not-null')) {
          errorMessage = 'Faltan campos obligatorios'
        } else {
          errorMessage = `Error: ${error.message}`
        }
      }
      
      toast.error(errorMessage)
    }
  })
}

export const useUpdateCandidate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<CreateCandidateData> & { skills?: string[], languages?: string[] } }) => {
      console.log('✏️ [useUpdateCandidate] Updating candidate:', id, data)

      const { data: result, error } = await supabase
        .from('candidates')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ [useUpdateCandidate] Error:', error)
        throw error
      }

      console.log('✅ [useUpdateCandidate] Candidate updated:', result)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['recruitment-stats'] })
      toast.success('Candidato actualizado correctamente')
    },
    onError: (error: any) => {
      console.error('💥 [useUpdateCandidate] Error:', error)
      toast.error('No se pudo actualizar el candidato')
    }
  })
}