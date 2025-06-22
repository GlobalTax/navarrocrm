
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, RefreshCw, Settings, AlertTriangle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

interface ConnectionStatus {
  isConfigured: boolean
  isUserConnected: boolean
  hasValidToken: boolean
  lastSync?: string
  error?: string
}

export const ConnectionStatusCard = () => {
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

  const getOverallStatus = () => {
    if (isLoading) return 'loading'
    if (!status?.isConfigured) return 'not-configured'
    if (!status?.isUserConnected) return 'not-connected'
    if (!status?.hasValidToken) return 'token-expired'
    return 'connected'
  }

  const getStatusColor = () => {
    switch (getOverallStatus()) {
      case 'connected':
        return 'text-green-600'
      case 'not-configured':
      case 'not-connected':
      case 'token-expired':
        return 'text-red-600'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="h-5 w-5 animate-spin" />
    
    switch (getOverallStatus()) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'not-configured':
      case 'not-connected':
      case 'token-expired':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (getOverallStatus()) {
      case 'loading':
        return 'Verificando conexión...'
      case 'connected':
        return 'Conectado y sincronizado'
      case 'not-configured':
        return 'Configuración pendiente'
      case 'not-connected':
        return 'Usuario no conectado'
      case 'token-expired':
        return 'Token expirado'
      default:
        return 'Estado desconocido'
    }
  }

  const getActionButton = () => {
    switch (getOverallStatus()) {
      case 'not-configured':
        return (
          <Button size="sm" variant="outline" asChild>
            <a href="/integrations">
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </a>
          </Button>
        )
      case 'not-connected':
      case 'token-expired':
        return (
          <Button size="sm" variant="outline" asChild>
            <a href="/integrations">
              <RefreshCw className="h-4 w-4 mr-2" />
              Conectar
            </a>
          </Button>
        )
      case 'connected':
        return (
          <Button size="sm" variant="ghost" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-base">Estado de Outlook</span>
          <Badge variant={getOverallStatus() === 'connected' ? 'default' : 'secondary'}>
            {getOverallStatus() === 'connected' ? 'Activo' : 'Inactivo'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <div className={`font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </div>
              {status?.lastSync && (
                <div className="text-xs text-gray-500">
                  Último uso: {new Date(status.lastSync).toLocaleString('es-ES')}
                </div>
              )}
              {status?.error && (
                <div className="text-xs text-red-600">
                  {status.error}
                </div>
              )}
            </div>
          </div>
          {getActionButton()}
        </div>
      </CardContent>
    </Card>
  )
}
