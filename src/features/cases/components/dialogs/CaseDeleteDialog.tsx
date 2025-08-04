import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle } from 'lucide-react'
import { Case } from '@/features/cases'

interface CaseDeleteDialogProps {
  case_: Case | null
  open: boolean
  onClose: () => void
  onConfirm: (caseId: string) => void
  isDeleting: boolean
}

export function CaseDeleteDialog({
  case_,
  open,
  onClose,
  onConfirm,
  isDeleting
}: CaseDeleteDialogProps) {
  const [confirmText, setConfirmText] = useState('')

  const handleClose = () => {
    setConfirmText('')
    onClose()
  }

  const handleConfirm = () => {
    if (case_ && confirmText.toLowerCase() === 'eliminar') {
      onConfirm(case_.id)
      setConfirmText('')
    }
  }

  const isValidConfirmation = confirmText.toLowerCase() === 'eliminar'

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Eliminar Expediente
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Esta acción eliminará permanentemente el expediente <strong>"{case_?.title}"</strong> 
              y todos sus datos asociados, incluyendo:
            </p>
            
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Tareas y actividades</li>
              <li>Documentos y archivos</li>
              <li>Comentarios y notas</li>
              <li>Historial de cambios</li>
              <li>Registro de tiempo</li>
            </ul>

            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm font-medium">
                ⚠️ Esta acción no se puede deshacer
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-text">
                Para confirmar, escriba <span className="font-mono font-bold">eliminar</span> en el campo de abajo:
              </Label>
              <Input
                id="confirm-text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Escriba 'eliminar' para confirmar"
                disabled={isDeleting}
                className={!isValidConfirmation && confirmText ? 'border-red-300' : ''}
              />
              {!isValidConfirmation && confirmText && (
                <p className="text-sm text-red-600">
                  Debe escribir exactamente "eliminar" para confirmar
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isValidConfirmation || isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar Expediente'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}