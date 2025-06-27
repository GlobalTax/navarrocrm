
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { Database } from '@/integrations/supabase/types'

// Tipos basados en la base de datos real
type TaskTemplateRow = Database['public']['Tables']['task_templates']['Row']
export type TaskTemplateInsert = Database['public']['Tables']['task_templates']['Insert']
type TaskTemplateUpdate = Database['public']['Tables']['task_templates']['Update']

// Tipos para los datos de la plantilla
export interface TaskTemplateData {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress'
  estimated_hours: number
}

export const useTaskTemplates = () => {
  const queryClient = useQueryClient()

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['task-templates'],
    queryFn: async (): Promise<TaskTemplateRow[]> => {
      try {
        const { data, error } = await supabase
          .from('task_templates')
          .select('*')
          .eq('is_active', true)
          .order('name')
        
        if (error) {
          console.error('Error fetching templates:', error.message)
          return []
        }
        
        // Asegurar que category tenga un valor por defecto
        return (data || []).map((item) => ({
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
    mutationFn: async (template: Omit<TaskTemplateInsert, 'org_id' | 'created_by'>) => {
      const user = await supabase.auth.getUser()
      if (!user.data.user?.user_metadata?.org_id) {
        throw new Error('No organization ID found')
      }

      const templateData: TaskTemplateInsert = {
        ...template,
        org_id: user.data.user.user_metadata.org_id,
        created_by: user.data.user.id,
        category: template.category || 'general'
      }

      const { data, error } = await supabase
        .from('task_templates')
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
    mutationFn: async ({ id, ...updates }: TaskTemplateUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('task_templates')
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
        .from('task_templates')
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
