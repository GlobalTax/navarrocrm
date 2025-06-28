
import { Client } from '@/hooks/useClients'
import { ClientFormDialog } from './ClientFormDialog'
import { ClientDetailDialog } from './ClientDetailDialog'
import { ClientBulkUpload } from './ClientBulkUpload'
import { ClientExportDialog } from './ClientExportDialog'

interface ClientsDialogManagerProps {
  selectedClient: Client | null
  isCreateDialogOpen: boolean
  isEditDialogOpen: boolean
  isDetailDialogOpen: boolean
  isBulkUploadOpen: boolean
  isExportDialogOpen: boolean
  clients: Client[]
  onClose: () => void
  onBulkUploadClose: () => void
  onExportClose: () => void
  onBulkUploadSuccess: () => void
}

export const ClientsDialogManager = ({
  selectedClient,
  isCreateDialogOpen,
  isEditDialogOpen,
  isDetailDialogOpen,
  isBulkUploadOpen,
  isExportDialogOpen,
  clients,
  onClose,
  onBulkUploadClose,
  onExportClose,
  onBulkUploadSuccess
}: ClientsDialogManagerProps) => {
  return (
    <>
      <ClientFormDialog
        client={selectedClient}
        open={isCreateDialogOpen || isEditDialogOpen}
        onClose={onClose}
      />

      <ClientDetailDialog
        client={selectedClient}
        open={isDetailDialogOpen}
        onClose={onClose}
      />

      <ClientBulkUpload
        open={isBulkUploadOpen}
        onClose={onBulkUploadClose}
        onSuccess={onBulkUploadSuccess}
      />

      <ClientExportDialog
        open={isExportDialogOpen}
        onClose={onExportClose}
        clients={clients}
      />
    </>
  )
}
