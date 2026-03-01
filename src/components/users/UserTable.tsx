import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { UsersIcon } from 'lucide-react'
import { UserActionsMenu } from './UserActionsMenu'
import { UserEmptyState } from './states/UserEmptyState'

interface UserTableProps {
  users: any[]
  hasFilters: boolean
  onEditUser: (user: any) => void
  onManagePermissions: (user: any) => void
  onViewAudit: (user: any) => void
  onActivateUser: (user: any) => void
  onDeleteUser: (user: any) => void
  onInviteUser: () => void
  onClearFilters: () => void
}

export const UserTable = ({ 
  users, 
  hasFilters,
  onEditUser, 
  onManagePermissions, 
  onViewAudit, 
  onActivateUser, 
  onDeleteUser,
  onInviteUser,
  onClearFilters
}: UserTableProps) => {
  const getRoleLabel = (role: string) => {
    const labels = {
      partner: 'Partner',
      area_manager: 'Area Manager',
      senior: 'Senior',
      junior: 'Junior',
      finance: 'Finanzas'
    }
    return labels[role as keyof typeof labels] || role
  }

  const getRoleColor = (role: string) => {
    const colors = {
      partner: 'bg-purple-50 text-purple-700 border-purple-200',
      area_manager: 'bg-blue-50 text-blue-700 border-blue-200',
      senior: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      junior: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      finance: 'bg-orange-50 text-orange-700 border-orange-200'
    }
    return colors[role as keyof typeof colors] || 'bg-slate-50 text-slate-600 border-slate-200'
  }

  if (users.length === 0) {
    return (
      <UserEmptyState 
        hasFilters={hasFilters}
        onInviteUser={onInviteUser}
        onClearFilters={onClearFilters}
      />
    )
  }

  return (
    <Card className="border-[0.5px] border-black rounded-[10px]">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
          <UsersIcon className="h-5 w-5" />
          Usuarios ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Apellido</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow 
                key={user.id} 
                className={!user.is_active ? 'bg-destructive/5 hover:bg-destructive/10' : ''}
              >
                <TableCell className="font-medium">{user.first_name || '-'}</TableCell>
                <TableCell>{user.last_name || '-'}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge className={`${getRoleColor(user.role)} text-xs font-medium border-[0.5px] rounded-[10px]`}>
                    {getRoleLabel(user.role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.is_active ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs border-[0.5px] rounded-[10px]">Activo</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs border-[0.5px] rounded-[10px]">Inactivo</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <UserActionsMenu
                    user={user}
                    onEdit={onEditUser}
                    onManagePermissions={onManagePermissions}
                    onViewAudit={onViewAudit}
                    onActivate={onActivateUser}
                    onDelete={onDeleteUser}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
