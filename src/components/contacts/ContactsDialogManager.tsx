
import { Contact } from '@/hooks/useContacts'
import { ContactFormDialog } from './ContactFormDialog'
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
      <ContactFormDialog
        open={isCreateDialogOpen}
        onClose={onClose}
        contact={selectedContact}
      />

      <ContactFormDialog
        open={isEditDialogOpen}
        onClose={onClose}
        contact={selectedContact}
      />

      <ClientDetailDialog
        open={isDetailDialogOpen}
        onClose={onClose}
        client={selectedContact as any}
      />

      <ClientBulkUpload
        open={isBulkUploadOpen}
        onClose={onBulkUploadClose}
        onSuccess={onBulkUploadSuccess}
      />

      <ClientExportDialog
        open={isExportDialogOpen}
        onClose={onExportClose}
        clients={contacts as any}
      />
    </>
  )
}
