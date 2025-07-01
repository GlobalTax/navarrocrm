
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

interface DefaultProposalText {
  id: string
  org_id: string
  practice_area: string
  introduction_text: string
  terms_text: string
  created_at: string
  updated_at: string
  created_by: string
}

interface CreateDefaultTextData {
  practice_area: string
  introduction_text: string
  terms_text: string
}

export const useDefaultProposalTexts = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const { data: defaultTexts = [], isLoading } = useQuery({
    queryKey: ['default-proposal-texts', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []

      const { data, error } = await supabase
        .from('default_proposal_texts')
        .select('*')
        .eq('org_id', user.org_id)
        .order('practice_area')

      if (error) throw error
      return data as DefaultProposalText[]
    },
    enabled: !!user?.org_id
  })

  const createMutation = useMutation({
    mutationFn: async (data: CreateDefaultTextData) => {
      if (!user?.org_id || !user?.id) throw new Error('Usuario no autenticado')

      const { data: result, error } = await supabase
        .from('default_proposal_texts')
        .insert({
          ...data,
          org_id: user.org_id,
          created_by: user.id
        })
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['default-proposal-texts'] })
      toast.success('Textos por defecto creados')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear textos por defecto')
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateDefaultTextData> }) => {
      const { data: result, error } = await supabase
        .from('default_proposal_texts')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['default-proposal-texts'] })
      toast.success('Textos por defecto actualizados')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar textos por defecto')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('default_proposal_texts')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['default-proposal-texts'] })
      toast.success('Textos por defecto eliminados')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar textos por defecto')
    }
  })

  const getDefaultTextsByArea = (practiceArea: string) => {
    return defaultTexts.find(text => text.practice_area === practiceArea)
  }

  return {
    defaultTexts,
    isLoading,
    createDefaultText: createMutation.mutate,
    updateDefaultText: updateMutation.mutate,
    deleteDefaultText: deleteMutation.mutate,
    getDefaultTextsByArea,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}
