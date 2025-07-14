
import { useState } from 'react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users as UsersIcon, Mail, Upload, Building, FileText } from 'lucide-react'

// Hooks y componentes refactorizados
import { useEnhancedUsers } from '@/hooks/useEnhancedUsers'
import { UserAdvancedFilters, UserFilters } from '@/components/users/UserAdvancedFilters'
import { UserTableSkeleton } from '@/components/users/skeleton/UserTableSkeleton'
import { UserMetricsSkeleton } from '@/components/users/skeleton/UserMetricsSkeleton'
import { useUsersPageStats } from '@/hooks/useUsersPageStats'
import { UserInvitationsTable } from '@/components/users/UserInvitationsTable'
import { InvitationNotifications } from '@/components/users/InvitationNotifications'
import { UserMetrics } from '@/components/users/UserMetrics'
import { UserTable } from '@/components/users/UserTable'
import { UsersPageDialogs } from '@/components/users/UsersPageDialogs'
import { EmployeeOnboardingManager } from '@/components/users/EmployeeOnboardingManager'
import { DocumentTemplateManager } from '@/components/employee-onboarding/DocumentTemplateManager'
import { AIEnhancedBulkUpload } from '@/components/bulk-upload/AIEnhancedBulkUpload'

const Users = () => {
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all'
  })

  const { users, isLoading, activateUser, getFilteredStats } = useEnhancedUsers(filters)
  const { invitationCount, pendingInvitations } = useUsersPageStats()
  
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
          title="Gestión de Usuarios"
          description="Administra los usuarios de tu asesoría con funcionalidades avanzadas"
          primaryAction={{
            label: 'Invitar Usuario',
            onClick: () => {}
          }}
        />
        <UserMetricsSkeleton />
        <UserTableSkeleton />
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
        <TabsList className="grid w-full grid-cols-4 border-0.5 border-black rounded-[10px]">
          <TabsTrigger value="users" className="flex items-center gap-2 rounded-[10px] data-[state=active]:bg-primary data-[state=active]:text-white">
            <UsersIcon className="h-4 w-4" />
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
          <TabsTrigger value="onboarding" className="flex items-center gap-2 rounded-[10px] data-[state=active]:bg-primary data-[state=active]:text-white">
            <Building className="h-4 w-4" />
            Onboarding
          </TabsTrigger>
          <TabsTrigger value="document-templates" className="flex items-center gap-2 rounded-[10px] data-[state=active]:bg-primary data-[state=active]:text-white">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UserTable
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

        <TabsContent value="onboarding" className="mt-6">
          <EmployeeOnboardingManager />
        </TabsContent>
        <TabsContent value="document-templates" className="mt-6">
          <DocumentTemplateManager />
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
