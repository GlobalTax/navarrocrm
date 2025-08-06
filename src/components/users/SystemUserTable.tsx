import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Filter, Users } from 'lucide-react'
import { UserActionsMenu } from './UserActionsMenu'
import { UserEmptyState } from './states/UserEmptyState'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface SystemUserTableProps {
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

export const SystemUserTable = ({
  users,
  hasFilters,
  onEditUser,
  onManagePermissions,
  onViewAudit,
  onActivateUser,
  onDeleteUser,
  onInviteUser,
  onClearFilters
}: SystemUserTableProps) => {
  
  const getRoleLabel = (role: string) => {
    const roleLabels = {
      'partner': 'Partner',
      'area_manager': 'Manager',
      'senior': 'Senior',
      'junior': 'Junior',
      'finance': 'Finanzas',
      'client': 'Cliente'
    }
    return roleLabels[role as keyof typeof roleLabels] || role
  }

  const getRoleColor = (role: string) => {
    const roleColors = {
      'partner': 'bg-purple-100 text-purple-800 border-purple-200',
      'area_manager': 'bg-blue-100 text-blue-800 border-blue-200',
      'senior': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'junior': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'finance': 'bg-orange-100 text-orange-800 border-orange-200',
      'client': 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getSystemStatus = (user: any) => {
    if (!user.is_active) return { label: 'Inactivo', color: 'bg-red-100 text-red-800 border-red-200' }
    if (user.last_login) {
      const daysSinceLogin = Math.floor((Date.now() - new Date(user.last_login).getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceLogin > 30) return { label: 'Inactivo >30d', color: 'bg-orange-100 text-orange-800 border-orange-200' }
      if (daysSinceLogin > 7) return { label: 'Inactivo >7d', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
    }
    return { label: 'Activo', color: 'bg-green-100 text-green-800 border-green-200' }
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Usuarios del Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-2 p-6">
          {users.map((user) => {
            const systemStatus = getSystemStatus(user)
            
            return (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-[10px] hover-lift transition-all duration-200 bg-white"
              >
                <div className="flex-1 space-y-2">
                  {/* Línea principal */}
                  <div className="flex items-center gap-3">
                    <div className="font-medium text-foreground">
                      {user.email}
                    </div>
                    <Badge className={`${getRoleColor(user.role)} border-0.5 rounded-[10px] text-xs`}>
                      {getRoleLabel(user.role)}
                    </Badge>
                    <Badge className={`${systemStatus.color} border-0.5 rounded-[10px] text-xs`}>
                      {systemStatus.label}
                    </Badge>
                  </div>
                  
                  {/* Línea secundaria con información técnica */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>ID: {user.id.slice(0, 8)}...</span>
                    <span>
                      Creado: {formatDistanceToNow(new Date(user.created_at), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </span>
                    {user.last_login && (
                      <span>
                        Último acceso: {formatDistanceToNow(new Date(user.last_login), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Menú de acciones */}
                <UserActionsMenu
                  user={user}
                  onEdit={onEditUser}
                  onManagePermissions={onManagePermissions}
                  onViewAudit={onViewAudit}
                  onActivate={onActivateUser}
                  onDelete={onDeleteUser}
                />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}