
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Shield, UsersIcon } from 'lucide-react'
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
    <Card className="border-0.5 border-black rounded-[10px]">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
          <UsersIcon className="h-5 w-5" />
          Usuarios ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className={`flex items-center justify-between p-4 border rounded-[10px] transition-all duration-200 hover-lift ${
              user.is_active 
                ? 'border-muted hover:bg-muted/50' 
                : 'border-destructive/20 bg-destructive/5 hover:bg-destructive/10'
            }`}>
              <div className="flex items-center gap-4 flex-1">
                <div className={`p-2 rounded-[10px] ${
                  user.is_active ? 'bg-muted' : 'bg-destructive/10'
                }`}>
                  <Mail className={`h-5 w-5 ${
                    user.is_active ? 'text-muted-foreground' : 'text-destructive'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${
                      user.is_active ? 'text-foreground' : 'text-destructive'
                    }`}>
                      {user.email}
                    </h4>
                    <Badge className={`${getRoleColor(user.role)} text-xs font-medium border-0.5 rounded-[10px]`}>
                      {getRoleLabel(user.role)}
                    </Badge>
                    {!user.is_active && (
                      <Badge variant="destructive" className="text-xs font-medium border-0.5 rounded-[10px]">
                        Inactivo
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {getRoleLabel(user.role)}
                    </div>
                    <span>Creado: {new Date(user.created_at).toLocaleDateString('es-ES')}</span>
                    {user.last_login_at && (
                      <span>Último acceso: {new Date(user.last_login_at).toLocaleDateString('es-ES')}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <UserActionsMenu
                user={user}
                onEdit={onEditUser}
                onManagePermissions={onManagePermissions}
                onViewAudit={onViewAudit}
                onActivate={onActivateUser}
                onDelete={onDeleteUser}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
