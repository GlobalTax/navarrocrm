import { useQuery } from '@tanstack/react-query'
import { useApp } from '@/contexts/AppContext'
import { OutlookAuthService } from '@/services/outlookAuthService'

export interface OutlookConnectionStatus {
  status: 'not_connected' | 'connected' | 'expired' | 'error'
  connectionData?: any
  error?: string
  lastSync?: string
}

export function useOutlookConnectionStatus() {
  const { user } = useApp()

  const { data: status, isLoading, error, refetch } = useQuery({
    queryKey: ['outlook-connection-status', user?.id, user?.org_id],
    queryFn: async (): Promise<OutlookConnectionStatus> => {
      if (!user?.id || !user?.org_id) {
        return { status: 'not_connected' }
      }

      try {
        const result = await OutlookAuthService.getConnectionStatus(user.id, user.org_id)
        
        return {
          status: result.status as any,
          connectionData: result.connectionData,
          error: result.error,
          lastSync: result.connectionData?.last_used_at
        }
      } catch (error: any) {
        console.error('Error obteniendo estado de conexión Outlook:', error)
        return {
          status: 'error',
          error: error.message || 'Error desconocido'
        }
      }
    },
    enabled: !!user?.id && !!user?.org_id,
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchInterval: 1000 * 60 * 5, // 5 minutos
    retry: 1
  })

  const isConnected = status?.status === 'connected'

  return {
    status,
    isConnected,
    isLoading,
    error,
    refetch
  }
}