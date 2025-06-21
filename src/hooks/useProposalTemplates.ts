
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export interface ProposalTemplate {
  id: string
  org_id: string
  name: string
  description?: string
  template_type: 'retainer' | 'subscription' | 'project' | 'hybrid'
  is_recurring: boolean
  default_frequency?: 'monthly' | 'quarterly' | 'yearly'
  default_retainer_amount?: number
  default_included_hours?: number
  default_hourly_rate?: number
  template_data?: any
  created_by: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export const useProposalTemplates = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['proposal-templates', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []

      const { data, error } = await supabase
        .from('proposal_templates')
        .select('*')
        .eq('org_id', user.org_id)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data as ProposalTemplate[]
    },
    enabled: !!user?.org_id
  })

  const createTemplate = useMutation({
    mutationFn: async (templateData: Omit<ProposalTemplate, 'id' | 'org_id' | 'created_by' | 'created_at' | 'updated_at'>) => {
      if (!user?.org_id || !user?.id) throw new Error('Usuario no autenticado')

      const { data, error } = await supabase
        .from('proposal_templates')
        .insert({
          ...templateData,
          org_id: user.org_id,
          created_by: user.id
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal-templates'] })
      toast.success('Plantilla creada exitosamente')
    },
    onError: (error) => {
      console.error('Error creating template:', error)
      toast.error('Error al crear la plantilla')
    }
  })

  return {
    templates,
    isLoading,
    createTemplate
  }
}
