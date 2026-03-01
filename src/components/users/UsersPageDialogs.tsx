
import { DirectUserCreationDialog } from './DirectUserCreationDialog'
import { UserFormDialog } from './UserFormDialog'
import { UserBulkCreation } from './UserBulkCreation'
import { UserPermissionsDialog } from './UserPermissionsDialog'
import { UserDeleteDialog } from './UserDeleteDialog'
import { UserAuditLogDialog } from './UserAuditLogDialog'

interface UsersPageDialogsProps {
  // User Form Dialog
  showUserForm: boolean
  setShowUserForm: (show: boolean) => void
  selectedUser: any
  setSelectedUser: (user: any) => void
  
  // Direct Creation Dialog
  showDirectCreation: boolean
  setShowDirectCreation: (show: boolean) => void
  
  // Bulk Upload Dialog
  showBulkUpload: boolean
  setShowBulkUpload: (show: boolean) => void
  onBulkUploadSuccess: () => void
  
  // Permissions Dialog
  showPermissionsDialog: boolean
  setShowPermissionsDialog: (show: boolean) => void
  
  // Delete Dialog
  showDeleteDialog: boolean
  setShowDeleteDialog: (show: boolean) => void
  
  // Audit Dialog
  showAuditDialog: boolean
  setShowAuditDialog: (show: boolean) => void
}

export const UsersPageDialogs = ({
  showUserForm,
  setShowUserForm,
  selectedUser,
  setSelectedUser,
  showDirectCreation,
  setShowDirectCreation,
  showBulkUpload,
  setShowBulkUpload,
  onBulkUploadSuccess,
  showPermissionsDialog,
  setShowPermissionsDialog,
  showDeleteDialog,
  setShowDeleteDialog,
  showAuditDialog,
  setShowAuditDialog
}: UsersPageDialogsProps) => {
  const handleCloseUserForm = () => {
    setShowUserForm(false)
    setSelectedUser(null)
  }

  const handleClosePermissions = () => {
    setShowPermissionsDialog(false)
    setSelectedUser(null)
  }

  const handleCloseDelete = () => {
    setShowDeleteDialog(false)
    setSelectedUser(null)
  }

  const handleCloseAudit = () => {
    setShowAuditDialog(false)
    setSelectedUser(null)
  }

  return (
    <>
      <UserFormDialog
        open={showUserForm}
        onOpenChange={setShowUserForm}
        user={selectedUser}
        onClose={handleCloseUserForm}
      />

      <DirectUserCreationDialog
        open={showDirectCreation}
        onOpenChange={setShowDirectCreation}
        onClose={() => setShowDirectCreation(false)}
      />

      <UserBulkCreation
        open={showBulkUpload}
        onOpenChange={setShowBulkUpload}
        onClose={() => setShowBulkUpload(false)}
      />

      <UserPermissionsDialog
        open={showPermissionsDialog}
        onOpenChange={setShowPermissionsDialog}
        user={selectedUser}
        onClose={handleClosePermissions}
      />

      <UserDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        user={selectedUser}
        onClose={handleCloseDelete}
      />

      <UserAuditLogDialog
        open={showAuditDialog}
        onOpenChange={setShowAuditDialog}
        user={selectedUser}
        onClose={handleCloseAudit}
      />
    </>
  )
}
