import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export interface CreateJobOfferData {
  candidate_id?: string
  candidate_email: string
  candidate_name: string
  candidate_phone?: string
  title: string
  department?: string
  position_level?: string
  salary_amount?: number
  salary_currency?: string
  salary_period?: string
  start_date?: string
  probation_period_months?: number
  vacation_days?: number
  work_schedule?: string
  work_location?: string
  remote_work_allowed?: boolean
  benefits?: any[]
  requirements?: any[]
  responsibilities?: any[]
  expires_at?: string
  additional_notes?: string
  template_id?: string
  recruitment_process_id?: string
}

export function useCreateJobOffer() {
  const { user } = useApp()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateJobOfferData) => {
      if (!user?.org_id || !user?.id) {
        throw new Error('Usuario no autenticado')
      }

      console.log('🚀 [useCreateJobOffer] Creating job offer with data:', data)

      const { error } = await supabase
        .from('job_offers')
        .insert({
          ...data,
          org_id: user.org_id,
          created_by: user.id,
          status: 'draft'
        })

      if (error) {
        console.error('❌ [useCreateJobOffer] Error:', error)
        throw error
      }

      console.log('✅ [useCreateJobOffer] Job offer created successfully')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-offers'] })
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['recruitment-stats'] })
      toast.success('Oferta de trabajo creada correctamente')
    },
    onError: (error) => {
      console.error('❌ [useCreateJobOffer] Mutation error:', error)
      toast.error('Error al crear la oferta de trabajo')
    }
  })
}

export function useJobOffers() {
  const { user } = useApp()

  return useQuery({
    queryKey: ['job-offers', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) {
        throw new Error('Usuario no autenticado')
      }

      const { data, error } = await supabase
        .from('job_offers')
        .select(`
          *,
          candidate:candidates(id, first_name, last_name, email)
        `)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [useJobOffers] Error:', error)
        throw error
      }

      return data || []
    },
    enabled: !!user?.org_id
  })
}

export function useJobOffer(id: string) {
  const { user } = useApp()

  return useQuery({
    queryKey: ['job-offer', id],
    queryFn: async () => {
      if (!user?.org_id || !id) {
        throw new Error('Parámetros faltantes')
      }

      const { data, error } = await supabase
        .from('job_offers')
        .select(`
          *,
          candidate:candidates(id, first_name, last_name, email)
        `)
        .eq('id', id)
        .eq('org_id', user.org_id)
        .single()

      if (error) {
        console.error('❌ [useJobOffer] Error:', error)
        throw error
      }

      return data
    },
    enabled: !!user?.org_id && !!id
  })
}

export function useUpdateJobOfferStatus() {
  const { user } = useApp()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      if (!user?.org_id) {
        throw new Error('Usuario no autenticado')
      }

      console.log('🚀 [useUpdateJobOfferStatus] Updating job offer status:', id, 'to:', status)

      const { error } = await supabase
        .from('job_offers')
        .update({ status })
        .eq('id', id)
        .eq('org_id', user.org_id)

      if (error) {
        console.error('❌ [useUpdateJobOfferStatus] Error:', error)
        throw error
      }

      console.log('✅ [useUpdateJobOfferStatus] Job offer status updated successfully')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-offers'] })
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['recruitment-stats'] })
      toast.success('Estado de la oferta actualizado')
    },
    onError: (error) => {
      console.error('❌ [useUpdateJobOfferStatus] Mutation error:', error)
      toast.error('Error al actualizar el estado de la oferta')
    }
  })
}