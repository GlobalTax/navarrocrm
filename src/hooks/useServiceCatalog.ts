
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export interface ServiceCatalogItem {
  id: string
  org_id: string
  name: string
  description?: string
  default_price?: number
  billing_unit: string
  practice_area_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
  practice_area?: {
    name: string
  }
}

export interface CreateServiceData {
  name: string
  description?: string
  default_price?: number
  billing_unit?: string
  practice_area_id?: string
}

export const useServiceCatalog = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['service-catalog', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []

      const { data, error } = await supabase
        .from('service_catalog')
        .select(`
          *,
          practice_area:practice_areas(name)
        `)
        .eq('org_id', user.org_id)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data as ServiceCatalogItem[]
    },
    enabled: !!user?.org_id
  })

  const createService = useMutation({
    mutationFn: async (serviceData: CreateServiceData) => {
      if (!user?.org_id) throw new Error('Usuario no autenticado')

      const { data, error } = await supabase
        .from('service_catalog')
        .insert({
          org_id: user.org_id,
          ...serviceData
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-catalog'] })
      toast.success('Servicio agregado al catálogo')
    },
    onError: (error) => {
      console.error('Error creating service:', error)
      toast.error('Error al crear servicio')
    }
  })

  return {
    services,
    isLoading,
    createService,
    isCreating: createService.isPending
  }
}
