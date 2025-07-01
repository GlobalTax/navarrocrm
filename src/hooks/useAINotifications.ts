
import { useMutation, useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export interface AINotificationConfig {
  id?: string
  org_id: string
  user_id: string
  notification_type: 'email' | 'dashboard' | 'both'
  threshold_cost: number
  threshold_failures: number
  is_enabled: boolean
  email_address?: string
  created_at?: string
  updated_at?: string
}

export const useAINotifications = () => {
  return useQuery({
    queryKey: ['ai-notifications'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('ai_notification_configs' as any)
          .select('*')
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }
        
        return data as AINotificationConfig | null
      } catch (error) {
        console.log('No existing configuration found, will create new one')
        return null
      }
    }
  })
}

export const useCreateAINotificationConfig = () => {
  return useMutation({
    mutationFn: async (config: Omit<AINotificationConfig, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('ai_notification_configs' as any)
        .insert(config)
        .select()
        .single()

      if (error) throw error
      return data as AINotificationConfig
    },
    onSuccess: () => {
      toast.success('Configuración de alertas guardada')
    },
    onError: (error: any) => {
      console.error('Error guardando configuración:', error)
      toast.error('Error al guardar la configuración')
    }
  })
}

export const useUpdateAINotificationConfig = () => {
  return useMutation({
    mutationFn: async ({ id, ...config }: AINotificationConfig) => {
      const { data, error } = await supabase
        .from('ai_notification_configs' as any)
        .update(config)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as AINotificationConfig
    },
    onSuccess: () => {
      toast.success('Configuración actualizada')
    },
    onError: (error: any) => {
      console.error('Error actualizando configuración:', error)
      toast.error('Error al actualizar la configuración')
    }
  })
}
