import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
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
import { MoreHorizontal, Mail, Clock, Send, X, Trash2 } from 'lucide-react'
import { useUserInvitations } from '@/hooks/useUserInvitations'
import { isInvitationExpired, getInvitationStatusColor, getInvitationStatusLabel } from '@/hooks/useUserInvitations/utils'
import type { UserInvitation } from '@/hooks/useUserInvitations/types'

interface InvitationCardProps {
  invitation: UserInvitation
  onDelete: (id: string) => void
  deleteDialogOpen: string | null
  setDeleteDialogOpen: (id: string | null) => void
}

export const InvitationCard = ({ 
  invitation, 
  onDelete, 
  deleteDialogOpen, 
  setDeleteDialogOpen 
}: InvitationCardProps) => {
  const { cancelInvitation, resendInvitation, getRoleLabel } = useUserInvitations()
  
  const expired = isInvitationExpired(invitation)
  const finalStatus = expired ? 'expired' : invitation.status
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className="p-2 bg-muted rounded-lg">
          <Mail className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-foreground">{invitation.email}</h4>
            <Badge className={`${getInvitationStatusColor(finalStatus)} text-xs font-medium border`}>
              {getInvitationStatusLabel(finalStatus)}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
          <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
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
                className="text-orange-600"
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
                  className="text-destructive"
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
                    onClick={() => {
                      onDelete(invitation.id)
                      setDeleteDialogOpen(null)
                    }}
                    className="bg-destructive hover:bg-destructive/90"
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
}