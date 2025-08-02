import { useState } from 'react'
import { UserFilters } from '@/hooks/useEnhancedUsers'
import { UsersPageHeader } from './UsersPageHeader'
import { UsersPageContent } from './UsersPageContent'
import { UsersPageDialogs } from './UsersPageDialogs'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'

export const UsersPageContainer = () => {
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all'
  })

  // Estados para diálogos
  const [showUserForm, setShowUserForm] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAuditDialog, setShowAuditDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const handleBulkUploadSuccess = () => {
    window.location.reload()
  }

  return (
    <StandardPageContainer>
      <UsersPageHeader 
        onInviteUser={() => setShowInviteDialog(true)}
        onBulkUpload={() => setShowBulkUpload(true)}
      />
      
      <UsersPageContent
        filters={filters}
        onFiltersChange={setFilters}
        selectedUser={selectedUser}
        onEditUser={(user) => {
          setSelectedUser(user)
          setShowUserForm(true)
        }}
        onManagePermissions={(user) => {
          setSelectedUser(user)
          setShowPermissionsDialog(true)
        }}
        onDeleteUser={(user) => {
          setSelectedUser(user)
          setShowDeleteDialog(true)
        }}
        onViewAudit={(user) => {
          setSelectedUser(user)
          setShowAuditDialog(true)
        }}
        onInviteUser={() => setShowInviteDialog(true)}
      />

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