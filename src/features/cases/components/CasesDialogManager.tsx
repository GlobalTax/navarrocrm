import { Case } from '@/hooks/useCases'
import { CaseArchiveDialog } from './CaseArchiveDialog'
import { CaseDeleteDialog } from './CaseDeleteDialog'

interface CasesDialogManagerProps {
  selectedCase: Case | null
  isCreateDialogOpen: boolean
  isEditDialogOpen: boolean
  isArchiveDialogOpen: boolean
  isDeleteDialogOpen: boolean
  onClose: () => void
}

export function CasesDialogManager({
  selectedCase,
  isCreateDialogOpen,
  isEditDialogOpen,
  isArchiveDialogOpen,
  isDeleteDialogOpen,
  onClose
}: CasesDialogManagerProps) {
  const handleArchiveConfirm = (caseId: string) => {
    console.log('Archive case:', caseId)
    onClose()
  }

  const handleDeleteConfirm = (caseId: string) => {
    console.log('Delete case:', caseId)
    onClose()
  }

  return (
    <>
      {/* TODO: Add CaseFormDialog for create/edit */}
      
      <CaseArchiveDialog
        case_={selectedCase}
        open={isArchiveDialogOpen}
        onClose={onClose}
        onConfirm={handleArchiveConfirm}
        isArchiving={false}
      />

      <CaseDeleteDialog
        case_={selectedCase}
        open={isDeleteDialogOpen}
        onClose={onClose}
        onConfirm={handleDeleteConfirm}
        isDeleting={false}
      />
    </>
  )
}