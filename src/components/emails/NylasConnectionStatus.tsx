import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertTriangle, Loader2, Mail, RefreshCw, Settings } from 'lucide-react'
import { type NylasConnectionStatus } from '@/hooks/useNylasConnection'

interface NylasConnectionStatusProps {
  status: NylasConnectionStatus
  connection?: {
    email_address: string
    provider: string
    last_sync?: string
  } | null
  onConnect?: () => void
  onSync?: () => void
  onConfigure?: () => void
  isConnecting?: boolean
  isSyncing?: boolean
  error?: Error | null
}

export function NylasConnectionStatus({
  status,
  connection,
  onConnect,
  onSync,
  onConfigure,
  isConnecting = false,
  isSyncing = false,
  error
}: NylasConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          title: 'Nylas Conectado',
          description: `Conectado a ${connection?.email_address || 'email'} via ${connection?.provider || 'proveedor'}`
        }
      case 'connecting':
        return {
          icon: Loader2,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          title: 'Conectando...',
          description: 'Estableciendo conexión con Nylas'
        }
      case 'error':
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          title: 'Error de Conexión',
          description: 'No se pudo conectar con Nylas'
        }
      default:
        return {
          icon: Mail,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          title: 'Sin Conexión',
          description: 'Configure su conexión con Nylas para sincronizar emails'
        }
    }
  }

  const config = getStatusConfig()
  const IconComponent = config.icon

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          Error: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="border-0.5 border-black bg-white rounded-[10px] shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-[10px] ${config.bgColor}`}>
              <IconComponent className={`h-5 w-5 ${config.color} ${status === 'connecting' ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                {config.title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                {config.description}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {status === 'connected' && (
              <Badge variant="secondary" className="border-0.5 border-black rounded-[10px] bg-green-100 text-green-800">
                Activo
              </Badge>
            )}
            
            {status === 'not_connected' && (
              <Badge variant="outline" className="border-0.5 border-black rounded-[10px]">
                Desconectado
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {connection?.last_sync && (
          <div className="mb-4 text-xs text-gray-500">
            Última sincronización: {new Date(connection.last_sync).toLocaleString()}
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          {status === 'not_connected' && (
            <Button
              onClick={onConnect}
              disabled={isConnecting}
              size="sm"
              className="border-0.5 border-black rounded-[10px] bg-black text-white hover:bg-gray-800"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-1" />
                  Conectar Nylas
                </>
              )}
            </Button>
          )}
          
          {status === 'connected' && (
            <>
              <Button
                onClick={onSync}
                disabled={isSyncing}
                size="sm"
                variant="outline"
                className="border-0.5 border-black rounded-[10px] hover:bg-gray-50"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Sincronizar
                  </>
                )}
              </Button>
              
              <Button
                onClick={onConfigure}
                size="sm"
                variant="ghost"
                className="border-0.5 border-gray-300 rounded-[10px] hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 mr-1" />
                Configurar
              </Button>
            </>
          )}
          
          {status === 'error' && (
            <Button
              onClick={onConnect}
              disabled={isConnecting}
              size="sm"
              variant="destructive"
              className="border-0.5 border-red-500 rounded-[10px]"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Reintentando...
                </>
              ) : (
                'Reintentar Conexión'
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}