import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  MailOpen, 
  Send, 
  FileText, 
  RefreshCw, 
  Plus,
  Settings,
  Inbox,
  MailSearch
} from 'lucide-react'
import { useEmailMetrics } from '@/hooks/useEmailMetrics'
import { useOutlookConnection } from '@/hooks/useOutlookConnection'
import { OutlookConnectionStatus } from '@/components/emails/OutlookConnectionStatus'
import { EmailMetricsCards } from '@/components/emails/EmailMetricsCards'
import { RecentEmailsList } from '@/components/emails/RecentEmailsList'
import { toast } from 'sonner'

export function EmailDashboard() {
  const navigate = useNavigate()
  const { metrics, isLoading, refetch } = useEmailMetrics()
  const { connectionStatus, syncEmails, isSyncing } = useOutlookConnection()
  const [lastSync, setLastSync] = useState<Date>(new Date())

  const handleSync = async () => {
    try {
      await syncEmails()
      setLastSync(new Date())
      toast.success('Sincronización completada')
    } catch (error) {
      toast.error('Error en la sincronización')
    }
  }

  const handleRefresh = async () => {
    try {
      await refetch()
      toast.success('Datos actualizados')
    } catch (error) {
      toast.error('Error al actualizar')
    }
  }

  return (
    <div className="space-y-6">
      <StandardPageHeader
        title="Email Dashboard"
        description="Gestión centralizada de correo electrónico"
        badges={[
          {
            label: `Estado: ${connectionStatus}`,
            variant: connectionStatus === 'connected' ? 'default' : 'outline',
            color: connectionStatus === 'connected' 
              ? 'text-green-600 border-green-200 bg-green-50' 
              : 'text-amber-600 border-amber-200 bg-amber-50'
          }
        ]}
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
              onClick={handleSync}
              disabled={isSyncing || connectionStatus !== 'connected'}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Sincronizar
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/emails/compose')}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Redactar
            </Button>
          </div>
        }
      />

      {/* Estado de conexión */}
      <OutlookConnectionStatus 
        status={connectionStatus}
        lastSync={lastSync}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      {/* Métricas principales */}
      <EmailMetricsCards metrics={metrics} isLoading={isLoading} />

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow border-0.5 border-black rounded-[10px]"
          onClick={() => navigate('/emails/inbox')}
        >
          <CardContent className="p-6 text-center">
            <Inbox className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium">Bandeja de Entrada</h3>
            <Badge variant="secondary" className="mt-2">
              {metrics?.unreadCount || 0} sin leer
            </Badge>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow border-0.5 border-black rounded-[10px]"
          onClick={() => navigate('/emails/sent')}
        >
          <CardContent className="p-6 text-center">
            <Send className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium">Enviados</h3>
            <Badge variant="secondary" className="mt-2">
              {metrics?.sentToday || 0} hoy
            </Badge>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow border-0.5 border-black rounded-[10px]"
          onClick={() => navigate('/emails/drafts')}
        >
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium">Borradores</h3>
            <Badge variant="secondary" className="mt-2">
              {metrics?.draftsCount || 0} pendientes
            </Badge>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow border-0.5 border-black rounded-[10px]"
          onClick={() => navigate('/emails/search')}
        >
          <CardContent className="p-6 text-center">
            <MailSearch className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium">Buscar</h3>
            <Badge variant="secondary" className="mt-2">
              Avanzada
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Emails recientes */}
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Emails Recientes
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecentEmailsList />
        </CardContent>
      </Card>
    </div>
  )
}