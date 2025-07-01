
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal,
  Edit,
  Trash2,
  UserCog,
  FileText,
  RefreshCw
} from 'lucide-react'

interface UserActionsMenuProps {
  user: any
  onEdit: (user: any) => void
  onManagePermissions: (user: any) => void
  onViewAudit: (user: any) => void
  onActivate: (user: any) => void
  onDelete: (user: any) => void
}

export const UserActionsMenu = ({ 
  user, 
  onEdit, 
  onManagePermissions, 
  onViewAudit, 
  onActivate, 
  onDelete 
}: UserActionsMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" className="text-slate-600 hover:text-slate-900">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(user)}>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onManagePermissions(user)}>
          <UserCog className="h-4 w-4 mr-2" />
          Permisos
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onViewAudit(user)}>
          <FileText className="h-4 w-4 mr-2" />
          Historial
        </DropdownMenuItem>
        {!user.is_active ? (
          <DropdownMenuItem 
            onClick={() => onActivate(user)}
            className="text-green-600"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reactivar
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem 
            className="text-red-600"
            onClick={() => onDelete(user)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Desactivar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
