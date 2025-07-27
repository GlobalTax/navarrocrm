import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import type { SubscriptionTemplate, CreateSubscriptionTemplateData } from '@/types/subscription-templates'

export const useSubscriptionTemplates = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['subscription-templates', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []

      const { data, error } = await supabase
        .from('subscription_templates')
        .select('*')
        .eq('org_id', user.org_id)
        .eq('is_active', true)
        .order('usage_count', { ascending: false })

      if (error) throw error
      return data as SubscriptionTemplate[]
    },
    enabled: !!user?.org_id
  })

  const createTemplate = useMutation({
    mutationFn: async (templateData: CreateSubscriptionTemplateData) => {
      if (!user?.org_id || !user?.id) throw new Error('Usuario no autenticado')

      const { data, error } = await supabase
        .from('subscription_templates')
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
      queryClient.invalidateQueries({ queryKey: ['subscription-templates'] })
      toast.success('Plantilla creada exitosamente')
    },
    onError: (error) => {
      console.error('Error creating template:', error)
      toast.error('Error al crear la plantilla')
    }
  })

  const updateTemplate = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SubscriptionTemplate> }) => {
      const { error } = await supabase
        .from('subscription_templates')
        .update(data)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-templates'] })
      toast.success('Plantilla actualizada exitosamente')
    },
    onError: (error) => {
      console.error('Error updating template:', error)
      toast.error('Error al actualizar la plantilla')
    }
  })

  const deleteTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('subscription_templates')
        .delete()
        .eq('id', templateId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-templates'] })
      toast.success('Plantilla eliminada exitosamente')
    },
    onError: (error) => {
      console.error('Error deleting template:', error)
      toast.error('Error al eliminar la plantilla')
    }
  })

  const incrementUsage = useMutation({
    mutationFn: async (templateId: string) => {
      // Manual increment since we don't have a stored procedure yet
      const template = templates.find(t => t.id === templateId)
      if (template) {
        const { error } = await supabase
          .from('subscription_templates')
          .update({ usage_count: template.usage_count + 1 })
          .eq('id', templateId)
        
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-templates'] })
    }
  })

  return {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsage,
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending
  }
}