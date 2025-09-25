import { useState } from 'react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserCog, Mail, Upload, Shield, Activity } from 'lucide-react'

// Hooks y componentes
import { useApp } from '@/contexts/AppContext'
import { useEnhancedUsers } from '@/hooks/useEnhancedUsers'
import { UserAdvancedFilters, UserFilters } from '@/components/users/UserAdvancedFilters'
import { UserTableSkeleton } from '@/components/users/skeleton/UserTableSkeleton'
import { UserMetricsSkeleton } from '@/components/users/skeleton/UserMetricsSkeleton'
import { useUsersPageStats } from '@/hooks/useUsersPageStats'
import { UserInvitationsTable } from '@/components/users/UserInvitationsTable'
import { InvitationNotifications } from '@/components/users/InvitationNotifications'
import { SystemUserMetrics } from '@/components/users/SystemUserMetrics'
import { SystemUserTable } from '@/components/users/SystemUserTable'
import { UsersPageDialogs } from '@/components/users/UsersPageDialogs'
import { AIEnhancedBulkUpload } from '@/components/bulk-upload/AIEnhancedBulkUpload'

const SystemUsersPage = () => {
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all'
  })

  const { user } = useApp()
  const { users, isLoading, activateUser, getFilteredStats } = useEnhancedUsers(filters)
  const { invitationCount, pendingInvitations } = useUsersPageStats()
  
  // Estados para diálogos
  const [showUserForm, setShowUserForm] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showDirectCreation, setShowDirectCreation] = useState(false)
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
          onClick={handleInviteUser}
          className="border-0.5 border-black rounded-[10px] hover-lift"
        >
          <Mail className="h-4 w-4 mr-2" />
          Invitar Usuario
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

      {/* Métricas del sistema */}
      <SystemUserMetrics stats={stats} />

      {/* Filtros avanzados */}
      <UserAdvancedFilters
        filters={filters}
        onFiltersChange={setFilters}
        userCount={users.length}
      />

      {/* Tabs para diferentes vistas */}
      <Tabs defaultValue="users" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 border-0.5 border-black rounded-[10px]">
          <TabsTrigger value="users" className="flex items-center gap-2 rounded-[10px] data-[state=active]:bg-primary data-[state=active]:text-white">
            <Shield className="h-4 w-4" />
            Usuarios ({users.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2 rounded-[10px] data-[state=active]:bg-primary data-[state=active]:text-white">
            <Mail className="h-4 w-4" />
            Invitaciones ({invitationCount})
            {pendingInvitations > 0 && (
              <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full ml-1 animate-pulse">
                {pendingInvitations}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <SystemUserTable
            users={users}
            hasFilters={hasFilters}
            onEditUser={handleEditUser}
            onManagePermissions={handleManagePermissions}
            onViewAudit={handleViewAudit}
            onActivateUser={handleActivateUser}
            onDeleteUser={handleDeleteUser}
            onInviteUser={handleInviteUser}
            onClearFilters={handleClearFilters}
          />
        </TabsContent>

        <TabsContent value="invitations" className="mt-6">
          <InvitationNotifications />
          <UserInvitationsTable onInviteUser={handleInviteUser} />
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
    </StandardPageContainer>
  )
}

export default SystemUsersPage