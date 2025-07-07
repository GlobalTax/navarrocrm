
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail } from 'lucide-react'
import { useUserInvitations } from '@/hooks/useUserInvitations'
import { UserBulkActions } from './UserBulkActions'
import { InvitationStats } from './InvitationStats'
import { InvitationFilters } from './InvitationFilters'
import { InvitationCard } from './InvitationCard'
import { InvitationsEmptyState } from './states/InvitationsEmptyState'
import { filterInvitations } from '@/hooks/useUserInvitations/utils'

export const UserInvitationsTable = ({ onInviteUser }: { onInviteUser?: () => void }) => {
  const { 
    invitations, 
    isLoading, 
    error,
    stats,
    deleteInvitation, 
    getRoleLabel
  } = useUserInvitations()
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Filtrar invitaciones usando utilidad
  const filteredInvitations = filterInvitations(invitations, searchTerm, statusFilter, getRoleLabel)

  const handleDelete = async (invitationId: string) => {
    await deleteInvitation.mutateAsync(invitationId)
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
      <InvitationStats stats={stats} />

      {/* Acciones masivas */}
      <UserBulkActions />
      
      {/* Filtros */}
      <InvitationFilters 
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      
      {/* Tabla de invitaciones */}
      {filteredInvitations.length === 0 && invitations.length === 0 ? (
        <InvitationsEmptyState onInviteUser={onInviteUser || (() => {})} />
      ) : (
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Invitaciones Enviadas ({filteredInvitations.length} de {invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredInvitations.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No se encontraron resultados
                </h3>
                <p className="text-muted-foreground mb-4">
                  Intenta ajustar los filtros de búsqueda
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInvitations.map((invitation) => (
                  <InvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    onDelete={handleDelete}
                    deleteDialogOpen={deleteDialogOpen}
                    setDeleteDialogOpen={setDeleteDialogOpen}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
