
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
  // Convertir Contact a formato compatible con formularios
  const contactForForm = selectedContact ? {
    ...selectedContact,
    email: selectedContact.email || '', // Hacer email requerido para el formulario
  } : null

  return (
    <>
      <ContactFormDialog
        open={isCreateDialogOpen}
        onClose={onClose}
        contact={contactForForm}
      />

      <ContactFormDialog
        open={isEditDialogOpen}
        onClose={onClose}
        contact={contactForForm}
      />

      <ClientDetailDialog
        open={isDetailDialogOpen}
        onClose={onClose}
        client={contactForForm}
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
