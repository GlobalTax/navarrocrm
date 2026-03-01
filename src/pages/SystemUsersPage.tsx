import { useState } from 'react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserCog, Upload, UsersRound, Shield } from 'lucide-react'

// Hooks y componentes
import { useApp } from '@/contexts/AppContext'
import { useEnhancedUsers } from '@/hooks/useEnhancedUsers'
import { useUserPermissionGroupNames } from '@/hooks/useUserPermissionGroupNames'
import { UserAdvancedFilters, UserFilters } from '@/components/users/UserAdvancedFilters'
import { UserTableSkeleton } from '@/components/users/skeleton/UserTableSkeleton'
import { UserMetricsSkeleton } from '@/components/users/skeleton/UserMetricsSkeleton'
import { useUsersPageStats } from '@/hooks/useUsersPageStats'
import { SystemUserMetrics } from '@/components/users/SystemUserMetrics'
import { SystemUserTable } from '@/components/users/SystemUserTable'
import { UsersPageDialogs } from '@/components/users/UsersPageDialogs'
import { UserBulkPreloaded } from '@/components/users/UserBulkPreloaded'
import { PermissionGroupsTab } from '@/components/users/PermissionGroupsTab'
import { SendAccessEmailDialog } from '@/components/users/SendAccessEmailDialog'

const SystemUsersPage = () => {
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all'
  })

  const { user } = useApp()
  const { users, isLoading, activateUser, getFilteredStats } = useEnhancedUsers(filters)
  const { invitationCount, pendingInvitations } = useUsersPageStats()
  const { data: permissionGroupMap = {} } = useUserPermissionGroupNames()
  
  // Estados para diálogos
  const [showUserForm, setShowUserForm] = useState(false)
  const [showDirectCreation, setShowDirectCreation] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [showBulkPreloaded, setShowBulkPreloaded] = useState(false)
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAuditDialog, setShowAuditDialog] = useState(false)
  const [showSendEmailDialog, setShowSendEmailDialog] = useState(false)
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

  const handleSendAccessEmail = (user: any) => {
    setSelectedUser(user)
    setShowSendEmailDialog(true)
  }

  const handleActivateUser = (user: any) => {
    activateUser.mutate(user.id)
  }

  const handleCreateDirectUser = () => {
    setShowDirectCreation(true)
  }

  const handleBulkUpload = () => {
    setShowBulkUpload(true)
  }

  const handleBulkUploadSuccess = () => {
    window.location.reload()
  }

  const hasFilters = filters.search !== '' || filters.role !== 'all' || filters.status !== 'all'

  const handleClearFilters = () => {
    setFilters({
      search: '',
      role: 'all', 
      status: 'all'
    })
  }

  if (isLoading) {
    return (
      <StandardPageContainer>
        <StandardPageHeader
          title="Usuarios del Sistema"
          description="Administración técnica de usuarios y accesos del sistema"
          primaryAction={{
            label: 'Invitar Usuario',
            onClick: () => {}
          }}
        >
          <UserCog className="h-8 w-8 text-primary" />
        </StandardPageHeader>
        <UserMetricsSkeleton />
        <UserTableSkeleton />
      </StandardPageContainer>
    )
  }

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Usuarios del Sistema"
        description="Administración técnica de usuarios y accesos del sistema"
        primaryAction={{
          label: 'Crear Usuario',
          onClick: handleCreateDirectUser
        }}
      >
        <UserCog className="h-8 w-8 text-primary" />
        <Button 
          variant="outline" 
          onClick={() => setShowBulkPreloaded(true)}
          className="border-0.5 border-black rounded-[10px] hover-lift"
        >
          <UsersRound className="h-4 w-4 mr-2" />
          Alta equipo NRRO
        </Button>
        <Button 
          variant="outline" 
          onClick={handleBulkUpload}
          className="border-0.5 border-black rounded-[10px] hover-lift"
        >
          <Upload className="h-4 w-4 mr-2" />
          Importación Masiva
        </Button>
      </StandardPageHeader>

      {/* Tabs: Usuarios y Grupos de Permisos */}
      <Tabs defaultValue="users" className="mt-4">
        <TabsList className="border-[0.5px] border-black rounded-[10px]">
          <TabsTrigger value="users" className="rounded-[8px]">
            <UserCog className="h-4 w-4 mr-2" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="permission-groups" className="rounded-[8px]">
            <Shield className="h-4 w-4 mr-2" />
            Grupos de Permisos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4 space-y-4">
          {/* Métricas del sistema */}
          <SystemUserMetrics stats={stats} />

          {/* Filtros avanzados */}
          <UserAdvancedFilters
            filters={filters}
            onFiltersChange={setFilters}
            userCount={users.length}
          />

          {/* Tabla de usuarios del sistema */}
          <div className="mt-6">
            <SystemUserTable
              users={users}
              hasFilters={hasFilters}
              permissionGroupMap={permissionGroupMap}
              onEditUser={handleEditUser}
              onManagePermissions={handleManagePermissions}
              onViewAudit={handleViewAudit}
              onActivateUser={handleActivateUser}
              onDeleteUser={handleDeleteUser}
              onInviteUser={handleCreateDirectUser}
              onClearFilters={handleClearFilters}
              onSendAccessEmail={handleSendAccessEmail}
            />
          </div>
        </TabsContent>

        <TabsContent value="permission-groups" className="mt-4">
          <PermissionGroupsTab />
        </TabsContent>
      </Tabs>

      {/* Todos los diálogos agrupados */}
      <UsersPageDialogs
        showUserForm={showUserForm}
        setShowUserForm={setShowUserForm}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        showDirectCreation={showDirectCreation}
        setShowDirectCreation={setShowDirectCreation}
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

      <UserBulkPreloaded
        open={showBulkPreloaded}
        onOpenChange={setShowBulkPreloaded}
      />

      <SendAccessEmailDialog
        open={showSendEmailDialog}
        onOpenChange={setShowSendEmailDialog}
        user={selectedUser}
      />
    </StandardPageContainer>
  )
}

export default SystemUsersPage
