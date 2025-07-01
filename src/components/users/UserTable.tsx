
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Shield, UsersIcon } from 'lucide-react'
import { UserActionsMenu } from './UserActionsMenu'

interface UserTableProps {
  users: any[]
  onEditUser: (user: any) => void
  onManagePermissions: (user: any) => void
  onViewAudit: (user: any) => void
  onActivateUser: (user: any) => void
  onDeleteUser: (user: any) => void
}

export const UserTable = ({ 
  users, 
  onEditUser, 
  onManagePermissions, 
  onViewAudit, 
  onActivateUser, 
  onDeleteUser 
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

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-slate-900 flex items-center gap-2">
          <UsersIcon className="h-5 w-5" />
          Usuarios ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No se encontraron usuarios
            </h3>
            <p className="text-slate-600 mb-4">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                user.is_active 
                  ? 'border-slate-200 hover:bg-slate-50' 
                  : 'border-red-200 bg-red-50 hover:bg-red-100'
              }`}>
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-2 rounded-lg ${
                    user.is_active ? 'bg-slate-100' : 'bg-red-100'
                  }`}>
                    <Mail className={`h-5 w-5 ${
                      user.is_active ? 'text-slate-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${
                        user.is_active ? 'text-slate-900' : 'text-red-900'
                      }`}>
                        {user.email}
                      </h4>
                      <Badge className={`${getRoleColor(user.role)} text-xs font-medium border`}>
                        {getRoleLabel(user.role)}
                      </Badge>
                      {!user.is_active && (
                        <Badge className="bg-red-50 text-red-700 border-red-200 text-xs font-medium border">
                          Inactivo
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
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
        )}
      </CardContent>
    </Card>
  )
}
