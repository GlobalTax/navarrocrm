
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { MoreHorizontal, Mail, Clock, Send, X, Trash2, Filter, Search, BarChart3 } from 'lucide-react'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { UserBulkActions } from './UserBulkActions'

export const UserInvitationsTable = () => {
  const { 
    invitations, 
    isLoading, 
    error,
    stats,
    cancelInvitation, 
    deleteInvitation, 
    resendInvitation, 
    getRoleLabel,
    getInvitationsByStatus,
    getExpiredInvitations
  } = useUserInvitations()
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Filtrar invitaciones
  const filteredInvitations = invitations.filter(invitation => {
    const matchesStatus = statusFilter === 'all' || invitation.status === statusFilter
    const matchesSearch = invitation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getRoleLabel(invitation.role).toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

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

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error cargando invitaciones: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Aceptadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <Mail className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Expiradas</p>
                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <X className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Canceladas</p>
                <p className="text-2xl font-bold text-gray-600">{stats.cancelled}</p>
              </div>
              <Trash2 className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones masivas */}
      <UserBulkActions />
      
      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por email o rol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="accepted">Aceptadas</SelectItem>
                  <SelectItem value="expired">Expiradas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabla de invitaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-slate-900 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invitaciones Enviadas ({filteredInvitations.length} de {invitations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvitations.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {invitations.length === 0 ? 'No hay invitaciones enviadas' : 'No se encontraron resultados'}
              </h3>
              <p className="text-slate-600 mb-4">
                {invitations.length === 0 
                  ? 'Las invitaciones que envíes aparecerán aquí'
                  : 'Intenta ajustar los filtros de búsqueda'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInvitations.map((invitation) => {
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
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-slate-600 hover:text-slate-900">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {invitation.status === 'pending' && !expired && (
                          <>
                            <DropdownMenuItem onClick={() => resendInvitation.mutate(invitation.id)}>
                              <Send className="h-4 w-4 mr-2" />
                              Reenviar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-yellow-600"
                              onClick={() => cancelInvitation.mutate(invitation.id)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancelar
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {invitation.status !== 'accepted' && (
                          <AlertDialog 
                            open={deleteDialogOpen === invitation.id} 
                            onOpenChange={(open) => setDeleteDialogOpen(open ? invitation.id : null)}
                          >
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar invitación?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará permanentemente la invitación para <strong>{invitation.email}</strong>.
                                  <br /><br />
                                  Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={async () => {
                                    await deleteInvitation.mutateAsync(invitation.id)
                                    setDeleteDialogOpen(null)
                                  }}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
