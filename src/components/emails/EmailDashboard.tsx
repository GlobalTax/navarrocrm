import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { useOutlookConnection } from '@/hooks/useOutlookConnection'
import { useEmailMetrics } from '@/hooks/useEmailMetrics'
import { OutlookConnectionStatus } from './OutlookConnectionStatus'
import { EmailMetricsCards } from './EmailMetricsCards'
import { RecentEmailsList } from './RecentEmailsList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, RefreshCw, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function EmailDashboard() {
  const navigate = useNavigate()
  const { 
    connectionStatus, 
    connectionData, 
    isConnecting, 
    isSyncing, 
    connect, 
    syncEmails 
  } = useOutlookConnection()
  
  const { metrics, isLoading: metricsLoading } = useEmailMetrics()

  const handleConfigure = () => {
    connect()
  }

  const handleSync = () => {
    syncEmails(false)
  }

  return (
    <div className="space-y-6">
      <StandardPageHeader
        title="Dashboard de Email"
        description="Gestiona tus emails y sincronización con Outlook"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/emails/settings')}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Configuración
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/emails/inbox')}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Ver Bandeja
            </Button>
          </div>
        }
      />

      {/* Estado de conexión */}
      <OutlookConnectionStatus
        status={connectionStatus}
        lastSync={connectionData?.updated_at ? new Date(connectionData.updated_at) : undefined}
        onSync={handleSync}
        onConfigure={handleConfigure}
        isSyncing={isSyncing}
      />

      {/* Métricas de email */}
      <EmailMetricsCards 
        metrics={metrics} 
        isLoading={metricsLoading} 
      />

      {/* Emails recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-0.5 border-black rounded-[10px]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Emails Recientes
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Sincronizando...' : 'Actualizar'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <RecentEmailsList />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Acciones rápidas */}
          <Card className="border-0.5 border-black rounded-[10px]">
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full gap-2" 
                onClick={() => navigate('/emails/compose')}
              >
                <Mail className="h-4 w-4" />
                Nuevo Email
              </Button>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => navigate('/emails/inbox')}
              >
                <Mail className="h-4 w-4" />
                Ver Bandeja de Entrada
              </Button>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => navigate('/emails/sent')}
              >
                <Mail className="h-4 w-4" />
                Emails Enviados
              </Button>
            </CardContent>
          </Card>

          {/* Estadísticas de conexión */}
          {connectionData && (
            <Card className="border-0.5 border-black rounded-[10px]">
              <CardHeader>
                <CardTitle>Estado de Conexión</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Estado:</span>{' '}
                  <span className="text-green-600">Conectado</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Última actualización:</span>{' '}
                  <span className="text-muted-foreground">
                    {new Date(connectionData.updated_at).toLocaleString('es-ES')}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Token expira:</span>{' '}
                  <span className="text-muted-foreground">
                    {new Date(connectionData.token_expires_at).toLocaleString('es-ES')}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}