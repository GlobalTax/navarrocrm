
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { CreateAdvancedTemplateData } from '@/types/templateTypes'

export interface CreateTemplateData {
  name: string
  description?: string
  practice_area_id?: string
  default_billing_method?: string
  template_data?: any
}

export const useMatterTemplateActions = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isAdvancedWizardOpen, setIsAdvancedWizardOpen] = useState(false)

  const createTemplateMutation = useMutation({
    mutationFn: async (data: CreateTemplateData | CreateAdvancedTemplateData) => {
      if (!user?.org_id) {
        throw new Error('No hay organización disponible')
      }

      const { data: template, error } = await supabase
        .from('matter_templates')
        .insert({
          ...data,
          org_id: user.org_id,
          created_by: user.id,
          template_data: JSON.stringify(data.template_data) // Convertir a JSON string
        })
        .select()
        .single()

      if (error) throw error
      return template
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matter-templates'] })
      toast.success('Plantilla creada exitosamente')
      setIsCreateDialogOpen(false)
      setIsAdvancedWizardOpen(false)
    },
    onError: (error: any) => {
      console.error('Error creando plantilla:', error)
      toast.error('Error al crear la plantilla')
    }
  })

  const openCreateDialog = () => setIsCreateDialogOpen(true)
  const closeCreateDialog = () => setIsCreateDialogOpen(false)
  
  const openAdvancedWizard = () => setIsAdvancedWizardOpen(true)
  const closeAdvancedWizard = () => setIsAdvancedWizardOpen(false)

  return {
    createTemplate: createTemplateMutation.mutate,
    isCreating: createTemplateMutation.isPending,
    isCreateDialogOpen,
    openCreateDialog,
    closeCreateDialog,
    isAdvancedWizardOpen,
    openAdvancedWizard,
    closeAdvancedWizard
  }
}
