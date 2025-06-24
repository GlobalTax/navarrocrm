
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, Clock, User } from 'lucide-react'
import { useUserAudit } from '@/hooks/useUserAudit'

interface UserAuditLogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
  onClose: () => void
}

export const UserAuditLogDialog = ({ open, onOpenChange, user, onClose }: UserAuditLogDialogProps) => {
  const { auditLog, isLoading, getActionTypeLabel } = useUserAudit()

  const userAuditEntries = auditLog.filter(entry => 
    entry.target_user_id === user?.id || entry.action_by === user?.id
  )

  const getActionTypeColor = (actionType: string) => {
    const colors = {
      role_change: 'bg-blue-50 text-blue-700 border-blue-200',
      permission_grant: 'bg-green-50 text-green-700 border-green-200',
      permission_revoke: 'bg-orange-50 text-orange-700 border-orange-200',
      invitation_sent: 'bg-purple-50 text-purple-700 border-purple-200',
      user_deleted: 'bg-red-50 text-red-700 border-red-200',
      user_activated: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
    return colors[actionType as keyof typeof colors] || 'bg-slate-50 text-slate-600 border-slate-200'
  }

  const formatValue = (value: any) => {
    if (!value) return '-'
    if (typeof value === 'object') {
      return Object.entries(value).map(([key, val]) => `${key}: ${val}`).join(', ')
    }
    return String(value)
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Historial de Actividad</DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">Cargando historial...</div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historial de Actividad - {user?.email}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-3">
            {userAuditEntries.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Sin actividad registrada
                </h3>
                <p className="text-slate-600">
                  No hay actividad registrada para este usuario
                </p>
              </div>
            ) : (
              userAuditEntries.map((entry) => (
                <Card key={entry.id} className="border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getActionTypeColor(entry.action_type)} text-xs font-medium border`}>
                          {getActionTypeLabel(entry.action_type)}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="h-3 w-3" />
                          {new Date(entry.created_at).toLocaleString('es-ES')}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">Usuario ID:</span>
                        <span className="text-slate-600">{entry.action_by}</span>
                      </div>

                      {entry.details && (
                        <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded">
                          {entry.details}
                        </p>
                      )}

                      {(entry.old_value || entry.new_value) && (
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          {entry.old_value && (
                            <div>
                              <span className="font-medium text-slate-600">Valor anterior:</span>
                              <div className="bg-red-50 p-2 rounded mt-1">
                                {formatValue(entry.old_value)}
                              </div>
                            </div>
                          )}
                          {entry.new_value && (
                            <div>
                              <span className="font-medium text-slate-600">Valor nuevo:</span>
                              <div className="bg-green-50 p-2 rounded mt-1">
                                {formatValue(entry.new_value)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
