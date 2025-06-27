
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

// Interfaz temporal hasta que se actualicen los tipos de Supabase
export interface TaskTemplate {
  id: string
  org_id: string
  name: string
  description?: string
  template_data: {
    title?: string
    description?: string
    priority?: string
    status?: string
    due_date_offset?: number // días desde creación
    estimated_hours?: number
    tags?: string[]
    case_id?: string
    contact_id?: string
  }
  category: string
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface TaskTemplateInsert {
  name: string
  description?: string
  template_data: TaskTemplate['template_data']
  category?: string
  is_active?: boolean
}

export const useTaskTemplates = () => {
  const queryClient = useQueryClient()

  // Por ahora, retornamos datos simulados hasta que los tipos se actualicen
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['task-templates'],
    queryFn: async (): Promise<TaskTemplate[]> => {
      // Las tablas no existen aún, devolvemos array vacío
      console.log('Task templates table not available yet, returning empty array')
      return []
    }
  })

  const createTemplate = useMutation({
    mutationFn: async (template: TaskTemplateInsert) => {
      const user = await supabase.auth.getUser()
      if (!user.data.user?.user_metadata?.org_id) {
        throw new Error('No organization ID found')
      }

      // Simulate successful creation for now
      const mockTemplate: TaskTemplate = {
        id: crypto.randomUUID(),
        org_id: user.data.user.user_metadata.org_id,
        created_by: user.data.user.id,
        name: template.name,
        description: template.description,
        template_data: template.template_data,
        category: template.category || 'general',
        is_active: template.is_active !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Template creation simulated (table not available yet):', mockTemplate)
      return mockTemplate
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-templates'] })
      toast.success('Plantilla creada correctamente')
    },
    onError: (error: any) => {
      console.error('Error creating template:', error)
      toast.error('Error al crear la plantilla')
    }
  })

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TaskTemplate> & { id: string }) => {
      // Simulate successful update for now
      const mockUpdate = { id, ...updates }
      console.log('Template update simulated (table not available yet):', mockUpdate)
      return mockUpdate
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-templates'] })
      toast.success('Plantilla actualizada')
    }
  })

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      // Simulate successful deletion for now
      console.log('Template deletion simulated (table not available yet):', id)
      return { id }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-templates'] })
      toast.success('Plantilla eliminada')
    }
  })

  return {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate
  }
}
