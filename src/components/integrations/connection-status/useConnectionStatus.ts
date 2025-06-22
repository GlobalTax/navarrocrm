
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { ConnectionStatus, ConnectionStatusType } from './types'

export const useConnectionStatus = () => {
  const { user } = useApp()

  const { data: status, refetch, isLoading } = useQuery({
    queryKey: ['connection-status', user?.org_id, user?.id],
    queryFn: async (): Promise<ConnectionStatus> => {
      if (!user?.org_id || !user?.id) {
        return {
          isConfigured: false,
          isUserConnected: false,
          hasValidToken: false,
          error: 'Usuario o organización no disponible'
        }
      }

      try {
        // Verificar configuración de la organización
        const { data: orgConfig, error: orgError } = await supabase
          .from('organization_integrations')
          .select('*')
          .eq('org_id', user.org_id)
          .eq('integration_type', 'outlook')
          .maybeSingle()

        if (orgError) {
          console.error('Error fetching org config:', orgError)
          return {
            isConfigured: false,
            isUserConnected: false,
            hasValidToken: false,
            error: `Error de configuración: ${orgError.message}`
          }
        }

        const isConfigured = !!(orgConfig?.outlook_client_id && orgConfig?.outlook_tenant_id && orgConfig?.is_enabled)

        // Verificar tokens del usuario
        const { data: userTokens, error: tokenError } = await supabase
          .from('user_outlook_tokens')
          .select('*')
          .eq('user_id', user.id)
          .eq('org_id', user.org_id)
          .eq('is_active', true)

        if (tokenError) {
          console.error('Error fetching user tokens:', tokenError)
          return {
            isConfigured,
            isUserConnected: false,
            hasValidToken: false,
            error: `Error de tokens: ${tokenError.message}`
          }
        }

        const isUserConnected = (userTokens?.length || 0) > 0
        const hasValidToken = userTokens?.[0] 
          ? new Date(userTokens[0].token_expires_at) > new Date()
          : false

        return {
          isConfigured,
          isUserConnected,
          hasValidToken,
          lastSync: userTokens?.[0]?.last_used_at || undefined
        }
      } catch (error) {
        console.error('Unexpected error in useConnectionStatus:', error)
        return {
          isConfigured: false,
          isUserConnected: false,
          hasValidToken: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        }
      }
    },
    enabled: !!user?.org_id && !!user?.id,
    retry: 1,
    refetchOnWindowFocus: false
  })

  const getOverallStatus = (): ConnectionStatusType => {
    if (isLoading) return 'loading'
    if (!status) return 'not-configured'
    if (status.error) return 'not-configured'
    if (!status.isConfigured) return 'not-configured'
    if (!status.isUserConnected) return 'not-connected'
    if (!status.hasValidToken) return 'token-expired'
    return 'connected'
  }

  return {
    status,
    overallStatus: getOverallStatus(),
    refetch,
    isLoading
  }
}
