
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Case } from '@/hooks/useCases'
import { Archive } from 'lucide-react'

interface CaseArchiveDialogProps {
  case_: Case | null
  open: boolean
  onClose: () => void
  onConfirm: (caseId: string) => void
  isArchiving: boolean
}

export function CaseArchiveDialog({
  case_,
  open,
  onClose,
  onConfirm,
  isArchiving
}: CaseArchiveDialogProps) {
  const handleConfirm = () => {
    if (case_) {
      onConfirm(case_.id)
    }
  }

  const isArchived = case_?.status === 'archived'

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            {isArchived ? 'Desarchivar Expediente' : 'Archivar Expediente'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isArchived 
              ? `¿Está seguro de que desea desarchivar el expediente "${case_?.title}"? Volverá a aparecer en la lista principal.`
              : `¿Está seguro de que desea archivar el expediente "${case_?.title}"? Se moverá a la sección de archivados pero conservará todos sus datos.`
            }
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isArchiving}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isArchiving}
          >
            {isArchiving 
              ? (isArchived ? 'Desarchivando...' : 'Archivando...') 
              : (isArchived ? 'Desarchivar' : 'Archivar')
            }
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
