
import { CaseDetailDialog } from './CaseDetailDialog'
import { MatterFormDialog } from './MatterFormDialog'
import { CaseDeleteDialog } from './CaseDeleteDialog'
import { CaseArchiveDialog } from './CaseArchiveDialog'
import { CaseWorkspace } from './workspace/CaseWorkspace'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Case } from '@/hooks/useCases'

interface CasesDialogManagerProps {
  selectedCase: Case | null
  isDetailOpen: boolean
  onDetailClose: () => void
  isWizardOpen: boolean
  onWizardOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  isCreating: boolean
  isCreateSuccess: boolean
  onResetCreate: () => void
  caseToDelete: Case | null
  isDeleteDialogOpen: boolean
  onDeleteDialogClose: () => void
  onConfirmDelete: (caseId: string) => void
  isDeleting: boolean
  caseToArchive: Case | null
  isArchiveDialogOpen: boolean
  onArchiveDialogClose: () => void
  onConfirmArchive: (caseId: string) => void
  isArchiving: boolean
  // Nuevas props para el workspace
  isWorkspaceOpen?: boolean
  onWorkspaceClose?: () => void
}

export function CasesDialogManager({
  selectedCase,
  isDetailOpen,
  onDetailClose,
  isWizardOpen,
  onWizardOpenChange,
  onSubmit,
  isCreating,
  isCreateSuccess,
  onResetCreate,
  caseToDelete,
  isDeleteDialogOpen,
  onDeleteDialogClose,
  onConfirmDelete,
  isDeleting,
  caseToArchive,
  isArchiveDialogOpen,
  onArchiveDialogClose,
  onConfirmArchive,
  isArchiving,
  isWorkspaceOpen = false,
  onWorkspaceClose = () => {}
}: CasesDialogManagerProps) {
  return (
    <>
      {/* Workspace del Expediente - Pantalla Completa */}
      {isWorkspaceOpen && selectedCase && (
        <CaseWorkspace case_={selectedCase} onClose={onWorkspaceClose} />
      )}

      {/* Dialog de Detalles Original */}
      <CaseDetailDialog
        case_={selectedCase}
        open={isDetailOpen}
        onClose={onDetailClose}
      />

      {/* Wizard de Creación */}
      <MatterFormDialog
        open={isWizardOpen}
        onOpenChange={onWizardOpenChange}
        onSubmit={onSubmit}
        isCreating={isCreating}
        isCreateSuccess={isCreateSuccess}
        onResetCreate={onResetCreate}
      />

      {/* Dialog de Eliminación */}
      <CaseDeleteDialog
        case_={caseToDelete}
        open={isDeleteDialogOpen}
        onClose={onDeleteDialogClose}
        onConfirm={onConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Dialog de Archivo */}
      <CaseArchiveDialog
        case_={caseToArchive}
        open={isArchiveDialogOpen}
        onClose={onArchiveDialogClose}
        onConfirm={onConfirmArchive}
        isArchiving={isArchiving}
      />
    </>
  )
}
