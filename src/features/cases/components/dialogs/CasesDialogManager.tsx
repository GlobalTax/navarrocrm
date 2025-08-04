import { CaseDetailDialog } from './CaseDetailDialog'
import { CaseArchiveDialog } from './CaseArchiveDialog'
import { CaseDeleteDialog } from './CaseDeleteDialog'
import { NewTemplateDialog } from './NewTemplateDialog'
import { MatterWizard } from '../wizard/MatterWizard'
import { Case } from '@/features/cases'

interface CasesDialogManagerProps {
  // Detail dialog
  detailCase: Case | null
  detailOpen: boolean
  onDetailClose: () => void
  onDetailEdit?: (case_: Case) => void

  // Wizard dialog
  wizardOpen: boolean
  onWizardClose: () => void
  onWizardSubmit: (data: any) => void
  isCreating: boolean
  isCreateSuccess: boolean
  onResetCreate?: () => void

  // Delete dialog
  deleteCase: Case | null
  deleteOpen: boolean
  onDeleteClose: () => void
  onDeleteConfirm: (caseId: string) => void
  isDeleting: boolean

  // Archive dialog
  archiveCase: Case | null
  archiveOpen: boolean
  onArchiveClose: () => void
  onArchiveConfirm: (caseId: string) => void
  isArchiving: boolean

  // New template dialog
  newTemplateOpen: boolean
  onNewTemplateClose: () => void
  onNewTemplateSubmit: (data: any) => void
  isCreatingTemplate: boolean
}

export function CasesDialogManager(props: CasesDialogManagerProps) {
  return (
    <>
      <CaseDetailDialog
        case_={props.detailCase}
        open={props.detailOpen}
        onClose={props.onDetailClose}
        onEdit={props.onDetailEdit}
      />

      <MatterWizard
        open={props.wizardOpen}
        onOpenChange={props.onWizardClose}
        onSubmit={props.onWizardSubmit}
        isLoading={props.isCreating}
        isSuccess={props.isCreateSuccess}
        onResetCreate={props.onResetCreate}
      />

      <CaseDeleteDialog
        case_={props.deleteCase}
        open={props.deleteOpen}
        onClose={props.onDeleteClose}
        onConfirm={props.onDeleteConfirm}
        isDeleting={props.isDeleting}
      />

      <CaseArchiveDialog
        case_={props.archiveCase}
        open={props.archiveOpen}
        onClose={props.onArchiveClose}
        onConfirm={props.onArchiveConfirm}
        isArchiving={props.isArchiving}
      />

      <NewTemplateDialog
        open={props.newTemplateOpen}
        onOpenChange={props.onNewTemplateClose}
        onSubmit={props.onNewTemplateSubmit}
        isLoading={props.isCreatingTemplate}
      />
    </>
  )
}