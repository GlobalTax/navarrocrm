import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Bell, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Mail
} from 'lucide-react'
import { useUserInvitations } from '@/hooks/useUserInvitations'
import { useTimeout } from '@/hooks/performance'

export const InvitationNotifications = () => {
  const { 
    invitations, 
    stats, 
    getExpiredInvitations,
    bulkCleanup 
  } = useUserInvitations()
  
  const [showNotifications, setShowNotifications] = useState(true)
  const expiredInvitations = getExpiredInvitations()

  // Ocultar notificaciones después de 5 segundos con hook optimizado
  const { clearTimeout } = useTimeout(() => {
    setShowNotifications(false)
  }, 5000)

  if (!showNotifications || invitations.length === 0) {
    return null
  }

  const hasExpiredInvitations = expiredInvitations.length > 0
  const hasPendingInvitations = stats.pending > 0

  return (
    <div className="space-y-4 mb-6">
      {/* Invitaciones expiradas */}
      {hasExpiredInvitations && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <span>
                <strong>{expiredInvitations.length}</strong> invitación{expiredInvitations.length > 1 ? 'es' : ''} expirada{expiredInvitations.length > 1 ? 's' : ''}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => bulkCleanup.mutate()}
                disabled={bulkCleanup.isPending}
                className="text-red-600 border-red-300 hover:bg-red-100"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${bulkCleanup.isPending ? 'animate-spin' : ''}`} />
                Limpiar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Invitaciones pendientes */}
      {hasPendingInvitations && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>{stats.pending}</strong> invitación{stats.pending > 1 ? 'es' : ''} pendiente{stats.pending > 1 ? 's' : ''} de respuesta
          </AlertDescription>
        </Alert>
      )}

      {/* Resumen de estadísticas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Resumen de Invitaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-blue-700">Total</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-xs text-yellow-700">Pendientes</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
              <div className="text-xs text-green-700">Aceptadas</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
              <div className="text-xs text-red-700">Expiradas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón para ocultar notificaciones */}
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowNotifications(false)}
          className="text-slate-500 hover:text-slate-700"
        >
          <XCircle className="h-4 w-4 mr-1" />
          Ocultar notificaciones
        </Button>
      </div>
    </div>
  )
}