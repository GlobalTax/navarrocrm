import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Users, Shield } from 'lucide-react'
import { UserActionsMenu } from './UserActionsMenu'
import { UserEmptyState } from './states/UserEmptyState'
import { BulkPermissionAssignDialog } from './BulkPermissionAssignDialog'

interface SystemUserTableProps {
  users: any[]
  hasFilters: boolean
  permissionGroupMap?: Record<string, string>
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
  permissionGroupMap = {},
  onEditUser,
  onManagePermissions,
  onViewAudit,
  onActivateUser,
  onDeleteUser,
  onInviteUser,
  onClearFilters
}: SystemUserTableProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBulkPermissions, setShowBulkPermissions] = useState(false)

  const allSelected = users.length > 0 && selectedIds.size === users.length
  const someSelected = selectedIds.size > 0

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(users.map(u => u.id)))
    }
  }

  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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
    <>
      {/* Barra de acciones masivas */}
      {someSelected && (
        <div className="mb-4 flex items-center justify-between bg-primary/5 border-[0.5px] border-primary/20 rounded-[10px] px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="text-sm font-medium">
            {selectedIds.size} usuario{selectedIds.size !== 1 ? 's' : ''} seleccionado{selectedIds.size !== 1 ? 's' : ''}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedIds(new Set())}
              className="border-[0.5px] border-black rounded-[10px]"
            >
              Deseleccionar
            </Button>
            <Button
              size="sm"
              onClick={() => setShowBulkPermissions(true)}
              className="border-[0.5px] border-black rounded-[10px] gap-1.5"
            >
              <Shield className="h-4 w-4" />
              Asignar permisos
            </Button>
          </div>
        </div>
      )}

      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuarios del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Seleccionar todos"
                  />
                </TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Apellido</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Permisos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const systemStatus = getSystemStatus(user)
                return (
                  <TableRow
                    key={user.id}
                    className={`${!user.is_active ? 'bg-destructive/5' : ''} ${selectedIds.has(user.id) ? 'bg-primary/5' : ''}`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(user.id)}
                        onCheckedChange={() => toggleOne(user.id)}
                        aria-label={`Seleccionar ${user.first_name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{user.first_name || '-'}</TableCell>
                    <TableCell>{user.last_name || '-'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={`${getRoleColor(user.role)} border-[0.5px] rounded-[10px] text-xs`}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${permissionGroupMap[user.id] ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-500 border-gray-200'} border-[0.5px] rounded-[10px] text-xs`}>
                        {permissionGroupMap[user.id] || 'Sin asignar'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${systemStatus.color} border-[0.5px] rounded-[10px] text-xs`}>
                        {systemStatus.label}
                      </Badge>
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
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BulkPermissionAssignDialog
        open={showBulkPermissions}
        onOpenChange={setShowBulkPermissions}
        selectedUserIds={Array.from(selectedIds)}
        onComplete={() => setSelectedIds(new Set())}
      />
    </>
  )
}
