
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Case } from '@/hooks/useCases'
import { CaseWorkspace } from './workspace/CaseWorkspace'

interface CaseWorkspaceDialogProps {
  case_: Case | null
  open: boolean
  onClose: () => void
}

export function CaseWorkspaceDialogProps({ case_, open, onClose }: CaseWorkspaceDialogProps) {
  if (!case_) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-screen h-screen p-0 m-0">
        <CaseWorkspace case_={case_} onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}
