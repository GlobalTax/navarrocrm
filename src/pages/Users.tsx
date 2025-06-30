import { useState } from 'react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users as UsersIcon, 
  UserPlus, 
  Mail,
  Shield,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  UserCog,
  FileText,
  RefreshCw,
  Upload
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// Hooks y componentes nuevos
import { useEnhancedUsers } from '@/hooks/useEnhancedUsers'
import { UserAdvancedFilters, UserFilters } from '@/components/users/UserAdvancedFilters'
import { EnhancedUserInviteDialog } from '@/components/users/EnhancedUserInviteDialog'
import { UserInvitationsTable } from '@/components/users/UserInvitationsTable'
import { UserFormDialog } from '@/components/users/UserFormDialog'
import { UserPermissionsDialog } from '@/components/users/UserPermissionsDialog'
import { UserDeleteDialog } from '@/components/users/UserDeleteDialog'
import { UserAuditLogDialog } from '@/components/users/UserAuditLogDialog'
import { UserBulkUpload } from '@/components/users/UserBulkUpload'

const Users = () => {
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all'
  })

  const { users, isLoading, activateUser, getFilteredStats } = useEnhancedUsers(filters)
  
  const [showUserForm, setShowUserForm] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAuditDialog, setShowAuditDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const stats = getFilteredStats()
  
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

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setShowUserForm(true)
  }

  const handleManagePermissions = (user: any) => {
    setSelectedUser(user)
    setShowPermissionsDialog(true)
  }

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user)
    setShowDeleteDialog(true)
  }

  const handleViewAudit = (user: any) => {
    setSelectedUser(user)
    setShowAuditDialog(true)
  }

  const handleActivateUser = (user: any) => {
    activateUser.mutate(user.id)
  }

  const handleInviteUser = () => {
    setShowInviteDialog(true)
  }

  const handleBulkUpload = () => {
    setShowBulkUpload(true)
  }

  const handleBulkUploadSuccess = () => {
    // Refrescar datos si es necesario
    window.location.reload()
  }

  if (isLoading) {
    return (
      <StandardPageContainer>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      </StandardPageContainer>
    )
  }

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Gestión de Usuarios"
        description="Administra los usuarios de tu asesoría con funcionalidades avanzadas"
        primaryAction={{
          label: 'Invitar Usuario',
          onClick: handleInviteUser
        }}
      >
        <Button 
          variant="outline" 
          onClick={handleBulkUpload}
          className="border-0.5 border-black rounded-[10px] hover-lift"
        >
          <Upload className="h-4 w-4 mr-2" />
          Importación Masiva
        </Button>
      </StandardPageHeader>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-600">Total</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-green-700">{stats.active}</div>
            <div className="text-sm text-slate-600">Activos</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-purple-700">{stats.partners}</div>
            <div className="text-sm text-slate-600">Partners</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-blue-700">{stats.managers}</div>
            <div className="text-sm text-slate-600">Managers</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-emerald-700">{stats.seniors}</div>
            <div className="text-sm text-slate-600">Seniors</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-yellow-700">{stats.juniors}</div>
            <div className="text-sm text-slate-600">Juniors</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros avanzados */}
      <UserAdvancedFilters
        filters={filters}
        onFiltersChange={setFilters}
        userCount={users.length}
      />

      {/* Tabs para diferentes vistas */}
      <Tabs defaultValue="users" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4" />
            Usuarios ({users.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Invitaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
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
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-slate-600 hover:text-slate-900">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleManagePermissions(user)}>
                            <UserCog className="h-4 w-4 mr-2" />
                            Permisos
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewAudit(user)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Historial
                          </DropdownMenuItem>
                          {!user.is_active ? (
                            <DropdownMenuItem 
                              onClick={() => handleActivateUser(user)}
                              className="text-green-600"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Reactivar
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Desactivar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="mt-6">
          <UserInvitationsTable />
        </TabsContent>
      </Tabs>

      {/* Diálogos existentes */}
      <UserFormDialog
        open={showUserForm}
        onOpenChange={setShowUserForm}
        user={selectedUser}
        onClose={() => {
          setShowUserForm(false)
          setSelectedUser(null)
        }}
      />

      <EnhancedUserInviteDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onClose={() => setShowInviteDialog(false)}
      />

      {/* Nuevo diálogo de importación masiva */}
      <UserBulkUpload
        open={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onSuccess={handleBulkUploadSuccess}
      />

      <UserPermissionsDialog
        open={showPermissionsDialog}
        onOpenChange={setShowPermissionsDialog}
        user={selectedUser}
        onClose={() => {
          setShowPermissionsDialog(false)
          setSelectedUser(null)
        }}
      />

      <UserDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        user={selectedUser}
        onClose={() => {
          setShowDeleteDialog(false)
          setSelectedUser(null)
        }}
      />

      <UserAuditLogDialog
        open={showAuditDialog}
        onOpenChange={setShowAuditDialog}
        user={selectedUser}
        onClose={() => {
          setShowAuditDialog(false)
          setSelectedUser(null)
        }}
      />
    </StandardPageContainer>
  )
}

export default Users
