import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { contactsDAL } from '@/lib/dal'
import { useApp } from '@/contexts/AppContext'
import { Client } from '@/types/shared/clientTypes'

// Optimized hook that fetches only clients from the server
export const useOptimizedClients = () => {
  const { user } = useApp()

  const { data: clients = [], isLoading, error, refetch } = useQuery({
    queryKey: ['clients', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      
      const result = await contactsDAL.findClients(user.org_id)
      if (!result.success) {
        throw new Error(result.error?.message || 'Error al cargar clientes')
      }
      return result.data as Client[]
    },
    enabled: !!user?.org_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })

  const clientsCount = useMemo(() => clients.length, [clients])

  return {
    clients,
    clientsCount,
    isLoading,
    error,
    refetch
  }
}