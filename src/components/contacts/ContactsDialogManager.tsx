
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
  // Convertir contacts a formato compatible con ClientExportDialog
  const contactsAsClients = contacts.map(contact => ({
    ...contact,
    // Asegurar que relationship_type sea compatible
    relationship_type: 'cliente' as const
  }))

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
        clients={contactsAsClients}
      />

      <QuantumImportDialog
        open={isQuantumImportOpen}
        onClose={onQuantumImportClose}
      />
    </>
  )
}
