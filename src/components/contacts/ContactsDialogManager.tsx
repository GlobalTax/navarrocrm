
import { Contact } from '@/hooks/useContacts'
import { ContactFormDialog } from '@/components/clients/ClientFormDialog'
import { ContactDetailDialog } from '@/components/clients/ClientDetailDialog'
import { ContactBulkUpload } from '@/components/clients/ClientBulkUpload'
import { ContactExportDialog } from '@/components/clients/ClientExportDialog'

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
      <ContactFormDialog
        open={isCreateDialogOpen}
        onOpenChange={onClose}
        contact={null}
        mode="create"
      />

      <ContactFormDialog
        open={isEditDialogOpen}
        onOpenChange={onClose}
        contact={selectedContact}
        mode="edit"
      />

      <ContactDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={onClose}
        contact={selectedContact}
      />

      <ContactBulkUpload
        open={isBulkUploadOpen}
        onOpenChange={onBulkUploadClose}
        onSuccess={onBulkUploadSuccess}
      />

      <ContactExportDialog
        open={isExportDialogOpen}
        onOpenChange={onExportClose}
        contacts={contacts}
      />
    </>
  )
}
