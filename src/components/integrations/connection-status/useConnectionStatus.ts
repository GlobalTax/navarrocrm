
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { ConnectionStatus, ConnectionStatusType } from './types'

export const useConnectionStatus = () => {
  const { user } = useApp()

  const { data: status, isLoading, refetch } = useQuery({
    queryKey: ['connection-status', user?.org_id, user?.id],
    queryFn: async (): Promise<ConnectionStatus> => {
      if (!user?.org_id) {
        return {
          isConfigured: false,
          isUserConnected: false,
          hasValidToken: false,
          error: 'Usuario sin organización'
        }
      }

      // Check organization configuration
      const { data: orgConfig } = await supabase
        .from('organization_integrations')
        .select('*')
        .eq('org_id', user.org_id)
        .eq('integration_type', 'outlook')
        .eq('is_enabled', true)
        .single()

      const isConfigured = !!(orgConfig?.outlook_client_id && orgConfig?.outlook_tenant_id)

      if (!isConfigured) {
        return {
          isConfigured: false,
          isUserConnected: false,
          hasValidToken: false,
          error: 'Configuración de organización incompleta'
        }
      }

      // Check user tokens
      const { data: userTokens } = await supabase
        .from('user_outlook_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('org_id', user.org_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)

      const userToken = userTokens?.[0]
      const isUserConnected = !!userToken
      const hasValidToken = userToken ? new Date(userToken.token_expires_at) > new Date() : false

      return {
        isConfigured: true,
        isUserConnected,
        hasValidToken,
        lastSync: userToken?.last_used_at,
        error: userToken && !hasValidToken ? 'Token expirado' : undefined
      }
    },
    enabled: !!user?.org_id && !!user?.id,
    refetchInterval: 30000 // Refetch every 30 seconds
  })

  const getOverallStatus = (): ConnectionStatusType => {
    if (isLoading) return 'loading'
    if (!status?.isConfigured) return 'not-configured'
    if (!status?.isUserConnected) return 'not-connected'
    if (!status?.hasValidToken) return 'token-expired'
    return 'connected'
  }

  return {
    status,
    isLoading,
    refetch,
    overallStatus: getOverallStatus()
  }
}
