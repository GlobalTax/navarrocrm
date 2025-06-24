
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Mail, Clock, Send, X } from 'lucide-react'
import { useUserInvitations } from '@/hooks/useUserInvitations'

export const UserInvitationsTable = () => {
  const { invitations, isLoading, cancelInvitation, resendInvitation, getRoleLabel } = useUserInvitations()

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      accepted: 'bg-green-50 text-green-700 border-green-200',
      expired: 'bg-red-50 text-red-700 border-red-200',
      cancelled: 'bg-gray-50 text-gray-700 border-gray-200'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-50 text-gray-600 border-gray-200'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendiente',
      accepted: 'Aceptada',
      expired: 'Expirada',
      cancelled: 'Cancelada'
    }
    return labels[status as keyof typeof labels] || status
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando invitaciones...</div>
        </CardContent>
      </Card>
    )
  }

  if (invitations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-slate-900 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invitaciones Enviadas (0)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Mail className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No hay invitaciones enviadas
            </h3>
            <p className="text-slate-600 mb-4">
              Las invitaciones que envíes aparecerán aquí
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium text-slate-900 flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Invitaciones Enviadas ({invitations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invitations.map((invitation) => {
            const expired = isExpired(invitation.expires_at)
            const finalStatus = expired && invitation.status === 'pending' ? 'expired' : invitation.status
            
            return (
              <div key={invitation.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Mail className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-slate-900">{invitation.email}</h4>
                      <Badge className={`${getStatusColor(finalStatus)} text-xs font-medium border`}>
                        {getStatusLabel(finalStatus)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <span>Rol: {getRoleLabel(invitation.role)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Enviada: {new Date(invitation.created_at).toLocaleDateString('es-ES')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Expira: {new Date(invitation.expires_at).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>
                </div>
                
                {invitation.status === 'pending' && !expired && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="text-slate-600 hover:text-slate-900">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => resendInvitation.mutate(invitation.id)}>
                        <Send className="h-4 w-4 mr-2" />
                        Reenviar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => cancelInvitation.mutate(invitation.id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
