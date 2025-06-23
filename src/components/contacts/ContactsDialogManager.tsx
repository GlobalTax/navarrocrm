
import { Contact } from '@/hooks/useContacts'
import { ClientFormDialog } from '@/components/clients/ClientFormDialog'
import { ClientDetailDialog } from '@/components/clients/ClientDetailDialog'
import { ClientBulkUpload } from '@/components/clients/ClientBulkUpload'
import { ClientExportDialog } from '@/components/clients/ClientExportDialog'

interface ContactsDialogManagerProps {
  selectedContact: Contact | null
  isCreateDialogOpen: boolean
  isEditDialogOpen: boolean
  isDetailDialogOpen: boolean
  isBulkUploadOpen: boolean
  isExportDialogOpen: boolean
  contacts: Contact[]
  onClose: () => void
  onBulkUploadClose: () => void
  onExportClose: () => void
  onBulkUploadSuccess: () => void
}

export function ContactsDialogManager({
  selectedContact,
  isCreateDialogOpen,
  isEditDialogOpen,
  isDetailDialogOpen,
  isBulkUploadOpen,
  isExportDialogOpen,
  contacts,
  onClose,
  onBulkUploadClose,
  onExportClose,
  onBulkUploadSuccess
}: ContactsDialogManagerProps) {
  return (
    <>
      <ClientFormDialog
        open={isCreateDialogOpen}
        onOpenChange={onClose}
        client={selectedContact}
        mode="create"
      />

      <ClientFormDialog
        open={isEditDialogOpen}
        onOpenChange={onClose}
        client={selectedContact}
        mode="edit"
      />

      <ClientDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={onClose}
        client={selectedContact}
      />

      <ClientBulkUpload
        open={isBulkUploadOpen}
        onClose={onBulkUploadClose}
        onSuccess={onBulkUploadSuccess}
      />

      <ClientExportDialog
        open={isExportDialogOpen}
        onClose={onExportClose}
        clients={contacts}
      />
    </>
  )
}
