
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

// Interfaz para los datos que realmente vienen de la base de datos
export interface TaskTemplateFromDB {
  id: string
  org_id: string
  name: string
  description?: string
  template_data: any
  category?: string
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

// Interfaz para crear nuevas plantillas
export interface TaskTemplateInsert {
  name: string
  description?: string
  template_data: any
  category?: string
  is_active?: boolean
}

export const useTaskTemplates = () => {
  const queryClient = useQueryClient()

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['task-templates'],
    queryFn: async (): Promise<TaskTemplateFromDB[]> => {
      try {
        const { data, error } = await supabase
          .from('task_templates' as any)
          .select('*')
          .eq('is_active', true)
          .order('name')
        
        if (error) {
          console.error('Error fetching templates:', error.message)
          return []
        }
        
        return (data || []).map((item: any) => ({
          ...item,
          category: item.category || 'general'
        }))
      } catch (error) {
        console.error('Templates fetch error:', error)
        return []
      }
    }
  })

  const createTemplate = useMutation({
    mutationFn: async (template: TaskTemplateInsert) => {
      const user = await supabase.auth.getUser()
      if (!user.data.user?.user_metadata?.org_id) {
        throw new Error('No organization ID found')
      }

      const templateData = {
        ...template,
        org_id: user.data.user.user_metadata.org_id,
        created_by: user.data.user.id,
        category: template.category || 'general'
      }

      const { data, error } = await supabase
        .from('task_templates' as any)
        .insert(templateData)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
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
    mutationFn: async ({ id, ...updates }: Partial<TaskTemplateFromDB> & { id: string }) => {
      const { data, error } = await supabase
        .from('task_templates' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-templates'] })
      toast.success('Plantilla actualizada')
    }
  })

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('task_templates' as any)
        .update({ is_active: false })
        .eq('id', id)

      if (error) {
        throw error
      }

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
