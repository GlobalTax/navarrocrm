
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export interface ClientService {
  id: string
  title: string
  status: string
  total_amount: number
  created_at: string
  accepted_at?: string
  proposal_type: string
  is_recurring: boolean
  frequency?: string
}

export const useClientServices = (clientId: string) => {
  const { user } = useApp()

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['client-services', clientId, user?.org_id],
    queryFn: async () => {
      if (!clientId || !user?.org_id) return []

      const { data, error } = await supabase
        .from('proposals')
        .select('id, title, status, total_amount, created_at, accepted_at, proposal_type, is_recurring, recurring_frequency')
        .eq('contact_id', clientId)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching client services:', error)
        return []
      }

      return data.map(service => ({
        ...service,
        frequency: service.recurring_frequency
      })) as ClientService[]
    },
    enabled: !!clientId && !!user?.org_id
  })

  // Métricas calculadas
  const totalRevenue = services
    .filter(s => s.status === 'won')
    .reduce((sum, s) => sum + s.total_amount, 0)

  const activeServices = services.filter(s => s.status === 'won' && s.is_recurring)
  const completedServices = services.filter(s => s.status === 'won' && !s.is_recurring)

  return {
    services,
    isLoading,
    metrics: {
      totalRevenue,
      activeServicesCount: activeServices.length,
      completedServicesCount: completedServices.length,
      totalProposals: services.length,
      conversionRate: services.length > 0 ? (services.filter(s => s.status === 'won').length / services.length) * 100 : 0
    }
  }
}
