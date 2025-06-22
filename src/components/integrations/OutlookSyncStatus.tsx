
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Clock, AlertCircle, Calendar, Mail } from 'lucide-react'

interface OutlookSyncStatusProps {
  syncEnabled: boolean
  emailEnabled: boolean
  connectionStatus: 'connected' | 'disconnected' | 'error'
  lastSync?: string
}

export const OutlookSyncStatus = ({
  syncEnabled,
  emailEnabled,
  connectionStatus,
  lastSync
}: OutlookSyncStatusProps) => {
  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'disconnected':
        return <Clock className="h-4 w-4 text-gray-400" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Conectado'
      case 'disconnected':
        return 'Desconectado'
      case 'error':
        return 'Error de conexión'
      default:
        return 'Desconocido'
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'default'
      case 'disconnected':
        return 'secondary'
      case 'error':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm font-medium">Estado de Outlook</span>
            </div>
            <Badge variant={getStatusColor() as any}>
              {getStatusText()}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className={syncEnabled ? 'text-green-600' : 'text-gray-500'}>
                Sincronización: {syncEnabled ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <span className={emailEnabled ? 'text-green-600' : 'text-gray-500'}>
                Email: {emailEnabled ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          {lastSync && (
            <div className="text-xs text-gray-500 pt-2 border-t">
              Última sincronización: {new Date(lastSync).toLocaleString('es-ES')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
