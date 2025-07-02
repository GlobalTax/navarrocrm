
import { useState } from 'react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users as UsersIcon, Mail, Upload, Building } from 'lucide-react'

// Hooks y componentes refactorizados
import { useEnhancedUsers } from '@/hooks/useEnhancedUsers'
import { UserAdvancedFilters, UserFilters } from '@/components/users/UserAdvancedFilters'
import { UserInvitationsTable } from '@/components/users/UserInvitationsTable'
import { UserMetrics } from '@/components/users/UserMetrics'
import { UserTable } from '@/components/users/UserTable'
import { UsersPageDialogs } from '@/components/users/UsersPageDialogs'
import { EmployeeOnboardingManager } from '@/components/users/EmployeeOnboardingManager'

const Users = () => {
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all'
  })

  const { users, isLoading, activateUser, getFilteredStats } = useEnhancedUsers(filters)
  
  // Estados para diálogos
  const [showUserForm, setShowUserForm] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAuditDialog, setShowAuditDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const stats = getFilteredStats()

  // Handlers para acciones de usuario
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
      <UserMetrics stats={stats} />

      {/* Filtros avanzados */}
      <UserAdvancedFilters
        filters={filters}
        onFiltersChange={setFilters}
        userCount={users.length}
      />

      {/* Tabs para diferentes vistas */}
      <Tabs defaultValue="users" className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4" />
            Usuarios ({users.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Invitaciones
          </TabsTrigger>
          <TabsTrigger value="onboarding" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Onboarding
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UserTable
            users={users}
            onEditUser={handleEditUser}
            onManagePermissions={handleManagePermissions}
            onViewAudit={handleViewAudit}
            onActivateUser={handleActivateUser}
            onDeleteUser={handleDeleteUser}
          />
        </TabsContent>

        <TabsContent value="invitations" className="mt-6">
          <UserInvitationsTable />
        </TabsContent>

        <TabsContent value="onboarding" className="mt-6">
          <EmployeeOnboardingManager />
        </TabsContent>
      </Tabs>

      {/* Todos los diálogos agrupados */}
      <UsersPageDialogs
        showUserForm={showUserForm}
        setShowUserForm={setShowUserForm}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        showInviteDialog={showInviteDialog}
        setShowInviteDialog={setShowInviteDialog}
        showBulkUpload={showBulkUpload}
        setShowBulkUpload={setShowBulkUpload}
        onBulkUploadSuccess={handleBulkUploadSuccess}
        showPermissionsDialog={showPermissionsDialog}
        setShowPermissionsDialog={setShowPermissionsDialog}
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        showAuditDialog={showAuditDialog}
        setShowAuditDialog={setShowAuditDialog}
      />
    </StandardPageContainer>
  )
}

export default Users
