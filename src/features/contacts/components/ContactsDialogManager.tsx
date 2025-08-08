import { Contact } from '@/hooks/useContacts'
import { ContactFormDialog } from './ContactFormDialog'
import { AIEnhancedBulkUpload } from '@/components/bulk-upload/AIEnhancedBulkUpload'
import { ClientExportDialog } from '@/components/clients/ClientExportDialog'
import { QuantumImportDialog } from './QuantumImportDialog'

interface ContactsDialogManagerProps {
  selectedContact: Contact | null
  isCreateDialogOpen: boolean
  isEditDialogOpen: boolean
  isBulkUploadOpen: boolean
  isExportDialogOpen: boolean
  isQuantumImportOpen: boolean
  contacts: Contact[]
  onClose: () => void
  onBulkUploadClose: () => void
  onExportClose: () => void
  onQuantumImportClose: () => void
  onBulkUploadSuccess: () => void
}

export function ContactsDialogManager({
  selectedContact,
  isCreateDialogOpen,
  isEditDialogOpen,
  isBulkUploadOpen,
  isExportDialogOpen,
  isQuantumImportOpen,
  contacts,
  onClose,
  onBulkUploadClose,
  onExportClose,
  onQuantumImportClose,
  onBulkUploadSuccess
}: ContactsDialogManagerProps) {
  return (
    <>
      <ContactFormDialog
        open={isCreateDialogOpen}
        onClose={onClose}
        contact={null}
      />

      <ContactFormDialog
        open={isEditDialogOpen}
        onClose={onClose}
        contact={selectedContact}
      />

      <AIEnhancedBulkUpload
        open={isBulkUploadOpen}
        onClose={onBulkUploadClose}
        onSuccess={onBulkUploadSuccess}
        dataType="contacts"
        title="Importación Masiva de Contactos"
      />

      <ClientExportDialog
        open={isExportDialogOpen}
        onClose={onExportClose}
        clients={contacts.filter(c => c.relationship_type === 'cliente') as any}
      />

      <QuantumImportDialog
        open={isQuantumImportOpen}
        onClose={onQuantumImportClose}
      />
    </>
  )
}