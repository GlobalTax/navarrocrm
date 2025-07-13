import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  Settings,
  Zap
} from 'lucide-react'
import { ConnectionStatus } from '@/hooks/useOutlookConnection'

interface OutlookConnectionStatusProps {
  status: ConnectionStatus | 'expired'
  lastSync?: Date
  onSync?: () => void
  onConfigure?: () => void
  isSyncing?: boolean
  error?: string | null
}

export function OutlookConnectionStatus({
  status,
  lastSync,
  onSync,
  onConfigure,
  isSyncing = false,
  error
}: OutlookConnectionStatusProps) {
  
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          badge: 'Conectado',
          badgeVariant: 'default' as const,
          title: 'Outlook Conectado',
          description: 'Sincronización activa con Microsoft Outlook'
        }
      case 'connecting':
        return {
          icon: Loader2,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          badge: 'Conectando',
          badgeVariant: 'outline' as const,
          title: 'Conectando...',
          description: 'Estableciendo conexión con Microsoft Outlook'
        }
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          badge: 'Error',
          badgeVariant: 'destructive' as const,
          title: 'Error de Conexión',
          description: 'Problema con la conexión a Outlook. Revisa la configuración.'
        }
      case 'expired':
        return {
          icon: AlertCircle,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          badge: 'Sesión Expirada',
          badgeVariant: 'outline' as const,
          title: 'Sesión Expirada',
          description: 'Tu sesión ha expirado. Inicia sesión nuevamente para continuar.'
        }
      default:
        return {
          icon: AlertCircle,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          badge: 'Desconectado',
          badgeVariant: 'outline' as const,
          title: 'Outlook No Conectado',
          description: 'Conecta tu cuenta de Outlook para sincronizar emails'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  if (status === 'not_connected') {
    return (
      <Alert className={`${config.bgColor} ${config.borderColor} border-0.5 rounded-[10px]`}>
        <Icon className={`h-4 w-4 ${config.color}`} />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong>{config.title}</strong>
            <p className="text-sm text-muted-foreground mt-1">
              {config.description}
            </p>
          </div>
          <Button 
            onClick={onConfigure}
            className="gap-2"
            size="sm"
          >
            <Zap className="h-4 w-4" />
            Conectar Outlook
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border-0.5 rounded-[10px]`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon 
              className={`h-5 w-5 ${config.color} ${status === 'connecting' ? 'animate-spin' : ''}`} 
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{config.title}</h3>
                <Badge variant={config.badgeVariant}>
                  {config.badge}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {config.description}
              </p>
              {error && (status === 'error' || status === 'expired') && (
                <p className="text-xs text-red-600 mt-1">
                  {error}
                </p>
              )}
              {lastSync && status === 'connected' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Última sincronización: {lastSync.toLocaleString('es-ES')}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {status === 'connected' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSync}
                disabled={isSyncing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
              </Button>
            )}
            
            {status === 'expired' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => window.location.href = '/login'}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Iniciar Sesión
              </Button>
            )}
            
            {(status === 'error' || status === 'connected') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onConfigure}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Configurar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}