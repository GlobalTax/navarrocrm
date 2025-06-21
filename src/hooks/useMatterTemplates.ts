
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export interface MatterTemplate {
  id: string
  name: string
  description: string | null
  practice_area_id: string | null
  default_billing_method: string
  template_data: any
  org_id: string
  created_by: string
  created_at: string
  updated_at: string
  practice_area?: {
    name: string
  }
}

export const useMatterTemplates = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: templates = [], isLoading, error } = useQuery({
    queryKey: ['matter-templates', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      
      const { data, error } = await supabase
        .from('matter_templates')
        .select(`
          *,
          practice_area:practice_areas(name)
        `)
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    },
    enabled: !!user?.org_id,
  })

  const createTemplate = useMutation({
    mutationFn: async (templateData: Partial<MatterTemplate>) => {
      const { error } = await supabase
        .from('matter_templates')
        .insert({
          ...templateData,
          org_id: user?.org_id!,
          created_by: user?.id!,
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matter-templates'] })
      toast({ title: 'Template created successfully' })
    },
    onError: (error) => {
      toast({ 
        title: 'Error creating template', 
        description: error.message, 
        variant: 'destructive' 
      })
    },
  })

  return {
    templates,
    isLoading,
    error,
    createTemplate: createTemplate.mutate,
    isCreating: createTemplate.isPending,
  }
}
