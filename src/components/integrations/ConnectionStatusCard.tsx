
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useConnectionStatus } from './connection-status/useConnectionStatus'
import { getStatusIcon, getStatusColor, getStatusText } from './connection-status/ConnectionStatusUtils'
import { ActionButton } from './connection-status/ActionButton'

export const ConnectionStatusCard = () => {
  const { status, overallStatus, refetch } = useConnectionStatus()

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-base">Estado de Outlook</span>
          <Badge variant={overallStatus === 'connected' ? 'default' : 'secondary'}>
            {overallStatus === 'connected' ? 'Activo' : 'Inactivo'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(overallStatus)}
            <div>
              <div className={`font-medium ${getStatusColor(overallStatus)}`}>
                {getStatusText(overallStatus)}
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
          <ActionButton status={overallStatus} onRefresh={() => refetch()} />
        </div>
      </CardContent>
    </Card>
  )
}
