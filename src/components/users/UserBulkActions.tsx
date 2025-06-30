
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Trash2, 
  RefreshCw,
  AlertTriangle,
  Eraser,
  CheckCircle
} from 'lucide-react'
import { useUserInvitations } from '@/hooks/useUserInvitations'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function UserBulkActions() {
  const { invitations, bulkCleanup } = useUserInvitations()
  const [showCleanupDialog, setShowCleanupDialog] = useState(false)

  const pendingCount = invitations.filter(inv => inv.status === 'pending').length
  const expiredCount = invitations.filter(inv => {
    return inv.status === 'pending' && new Date(inv.expires_at) < new Date()
  }).length
  const cancelledCount = invitations.filter(inv => inv.status === 'cancelled').length

  const handleBulkCleanup = async () => {
    try {
      await bulkCleanup.mutateAsync()
      setShowCleanupDialog(false)
    } catch (error) {
      console.error('Error en limpieza masiva:', error)
    }
  }

  return (
    <Card className="border-0.5 border-black rounded-[10px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eraser className="h-5 w-5" />
          Acciones Masivas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estadísticas de invitaciones */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 border border-gray-200 rounded-lg">
            <div className="text-2xl font-semibold text-yellow-600">{pendingCount}</div>
            <div className="text-xs text-gray-600">Pendientes</div>
          </div>
          <div className="text-center p-3 border border-gray-200 rounded-lg">
            <div className="text-2xl font-semibold text-red-600">{expiredCount}</div>
            <div className="text-xs text-gray-600">Expiradas</div>
          </div>
          <div className="text-center p-3 border border-gray-200 rounded-lg">
            <div className="text-2xl font-semibold text-gray-600">{cancelledCount}</div>
            <div className="text-xs text-gray-600">Canceladas</div>
          </div>
        </div>

        {/* Información y acciones */}
        {expiredCount > 0 && (
          <Alert className="border-0.5 border-yellow-300 rounded-[10px]">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Tienes <strong>{expiredCount}</strong> invitaciones expiradas que pueden ser limpiadas automáticamente.
            </AlertDescription>
          </Alert>
        )}

        {expiredCount === 0 && pendingCount === 0 && cancelledCount === 0 && (
          <Alert className="border-0.5 border-green-300 rounded-[10px]">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              No hay invitaciones para limpiar. El sistema está organizado.
            </AlertDescription>
          </Alert>
        )}

        {/* Botones de acción */}
        <div className="space-y-2">
          <Button
            onClick={() => setShowCleanupDialog(true)}
            disabled={expiredCount === 0 || bulkCleanup.isPending}
            className="w-full border-0.5 border-black rounded-[10px] hover-lift"
          >
            {bulkCleanup.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Limpiando...
              </>
            ) : (
              <>
                <Eraser className="h-4 w-4 mr-2" />
                Limpiar Invitaciones Expiradas ({expiredCount})
              </>
            )}
          </Button>

          {pendingCount > 0 && (
            <div className="text-xs text-gray-600 text-center">
              Las invitaciones pendientes válidas no se verán afectadas
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Automático
            </Badge>
            <span>La limpieza solo afecta invitaciones ya expiradas</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Seguro
            </Badge>
            <span>Se mantiene registro de auditoría de todas las acciones</span>
          </div>
        </div>
      </CardContent>

      {/* Diálogo de confirmación */}
      <AlertDialog open={showCleanupDialog} onOpenChange={setShowCleanupDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Limpieza Masiva</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará como "expiradas" todas las invitaciones pendientes que han superado su fecha de vencimiento.
              <br /><br />
              <strong>Invitaciones que serán procesadas: {expiredCount}</strong>
              <br /><br />
              Esta acción no se puede deshacer, pero se mantendrá un registro de auditoría.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkCleanup}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmar Limpieza
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
