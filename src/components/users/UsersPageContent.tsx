import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users as UsersIcon, Mail, Building, FileText } from 'lucide-react'
import { useEnhancedUsers, UserFilters } from '@/hooks/useEnhancedUsers'
import { useUsersPageStats } from '@/hooks/useUsersPageStats'
import { UserAdvancedFilters } from './UserAdvancedFilters'
import { UserMetrics } from './UserMetrics'
import { UserTable } from './UserTable'
import { UserTableSkeleton } from './skeleton/UserTableSkeleton'
import { UserMetricsSkeleton } from './skeleton/UserMetricsSkeleton'
import { UserInvitationsTable } from './UserInvitationsTable'
import { InvitationNotifications } from './InvitationNotifications'
import { EmployeeOnboardingManager } from './EmployeeOnboardingManager'
import { DocumentTemplateManager } from '@/components/employee-onboarding/DocumentTemplateManager'
import { EmployeeManagement } from '@/components/employees/EmployeeManagement'
import { DepartmentManagement } from '@/components/departments/DepartmentManagement'

interface UsersPageContentProps {
  filters: UserFilters
  onFiltersChange: (filters: UserFilters) => void
  selectedUser: any
  onEditUser: (user: any) => void
  onManagePermissions: (user: any) => void
  onDeleteUser: (user: any) => void
  onViewAudit: (user: any) => void
  onInviteUser: () => void
}

export const UsersPageContent = ({
  filters,
  onFiltersChange,
  onEditUser,
  onManagePermissions,
  onDeleteUser,
  onViewAudit,
  onInviteUser
}: UsersPageContentProps) => {
  const { users, isLoading, activateUser, getFilteredStats } = useEnhancedUsers(filters)
  const { invitationCount, pendingInvitations } = useUsersPageStats()
  
  const stats = getFilteredStats()

  const handleActivateUser = (user: any) => {
    activateUser.mutate(user.id)
  }

  const hasFilters = filters.search !== '' || filters.role !== 'all' || filters.status !== 'all'

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      role: 'all', 
      status: 'all'
    })
  }

  if (isLoading) {
    return (
      <>
        <UserMetricsSkeleton />
        <UserTableSkeleton />
      </>
    )
  }

  return (
    <>
      {/* Métricas principales */}
      <UserMetrics stats={stats} />

      {/* Filtros avanzados */}
      <UserAdvancedFilters
        filters={filters}
        onFiltersChange={onFiltersChange}
        userCount={users.length}
      />

      {/* Tabs para diferentes vistas */}
      <Tabs defaultValue="users" className="mt-6">
        <TabsList className="grid w-full grid-cols-6 border-0.5 border-black rounded-[10px]">
          <TabsTrigger value="users" className="flex items-center gap-2 rounded-[10px] data-[state=active]:bg-primary data-[state=active]:text-white">
            <UsersIcon className="h-4 w-4" />
            Usuarios ({users.length})
          </TabsTrigger>
          <TabsTrigger value="employees" className="flex items-center gap-2 rounded-[10px] data-[state=active]:bg-primary data-[state=active]:text-white">
            <Building className="h-4 w-4" />
            Empleados
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2 rounded-[10px] data-[state=active]:bg-primary data-[state=active]:text-white">
            <Building className="h-4 w-4" />
            Departamentos
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
            onEditUser={onEditUser}
            onManagePermissions={onManagePermissions}
            onViewAudit={onViewAudit}
            onActivateUser={handleActivateUser}
            onDeleteUser={onDeleteUser}
            onInviteUser={onInviteUser}
            onClearFilters={handleClearFilters}
          />
        </TabsContent>

        <TabsContent value="employees" className="mt-6">
          <EmployeeManagement />
        </TabsContent>

        <TabsContent value="departments" className="mt-6">
          <DepartmentManagement />
        </TabsContent>

        <TabsContent value="invitations" className="mt-6">
          <InvitationNotifications />
          <UserInvitationsTable onInviteUser={onInviteUser} />
        </TabsContent>

        <TabsContent value="onboarding" className="mt-6">
          <EmployeeOnboardingManager />
        </TabsContent>
        
        <TabsContent value="document-templates" className="mt-6">
          <DocumentTemplateManager />
        </TabsContent>
      </Tabs>
    </>
  )
}