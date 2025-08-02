
import { CaseDetailDialog } from './CaseDetailDialog'
import { MatterWizard } from './wizard/MatterWizard'
import { CaseDeleteDialog } from './CaseDeleteDialog'
import { CaseArchiveDialog } from './CaseArchiveDialog'
import { NewTemplateDialog } from './NewTemplateDialog'
import { Case, CreateCaseData } from '@/hooks/useCases'

interface CasesDialogManagerProps {
  // Detail dialog
  selectedCase: Case | null
  isDetailOpen: boolean
  onDetailClose: () => void
  
  // Wizard dialog
  isWizardOpen: boolean
  onWizardOpenChange: (open: boolean) => void
  onSubmit: (data: CreateCaseData) => void
  isCreating: boolean
  isCreateSuccess: boolean
  onResetCreate: () => void
  
  // Delete dialog
  caseToDelete: Case | null
  isDeleteDialogOpen: boolean
  onDeleteDialogClose: () => void
  onConfirmDelete: (caseId: string) => void
  isDeleting: boolean
  
  // Archive dialog
  caseToArchive: Case | null
  isArchiveDialogOpen: boolean
  onArchiveDialogClose: () => void
  onConfirmArchive: (caseId: string) => void
  isArchiving: boolean

  // New template dialog
  isNewTemplateOpen: boolean
  onNewTemplateOpenChange: (open: boolean) => void
  onNewTemplateSubmit: (data: {
    name: string
    description?: string
    practice_area_id?: string
    default_billing_method?: string
  }) => void
  isCreatingTemplate: boolean
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
  isNewTemplateOpen,
  onNewTemplateOpenChange,
  onNewTemplateSubmit,
  isCreatingTemplate
}: CasesDialogManagerProps) {
  return (
    <>
      <CaseDetailDialog
        case_={selectedCase}
        open={isDetailOpen}
        onClose={onDetailClose}
      />

      <MatterWizard
        open={isWizardOpen}
        onOpenChange={onWizardOpenChange}
        onSubmit={onSubmit}
        isLoading={isCreating}
        isSuccess={isCreateSuccess}
        onResetCreate={onResetCreate}
      />

      <CaseDeleteDialog
        case_={caseToDelete}
        open={isDeleteDialogOpen}
        onClose={onDeleteDialogClose}
        onConfirm={onConfirmDelete}
        isDeleting={isDeleting}
      />

      <CaseArchiveDialog
        case_={caseToArchive}
        open={isArchiveDialogOpen}
        onClose={onArchiveDialogClose}
        onConfirm={onConfirmArchive}
        isArchiving={isArchiving}
      />

      <NewTemplateDialog
        open={isNewTemplateOpen}
        onOpenChange={onNewTemplateOpenChange}
        onSubmit={onNewTemplateSubmit}
        isLoading={isCreatingTemplate}
      />
    </>
  )
}
