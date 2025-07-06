
import { NewProposalDialog } from '@/components/proposals/NewProposalDialog'
import { RecurringProposalForm } from '@/components/proposals/RecurringProposalForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Repeat, FileText } from 'lucide-react'
import { ProposalFormData } from '@/modules/proposals/types/proposal.schema'

interface ProposalsBuilderManagerProps {
  isRecurrentBuilderOpen: boolean
  isSpecificBuilderOpen: boolean
  onCloseRecurrentBuilder: () => void
  onCloseSpecificBuilder: () => void
  onSaveRecurrentProposal: (data: ProposalFormData) => void
  isSavingRecurrent: boolean
  // Nuevas propiedades para edición
  isEditMode?: boolean
  editingProposal?: any
  onUpdateProposal?: (proposalId: string, data: any) => void
}

export const ProposalsBuilderManager = ({
  isRecurrentBuilderOpen,
  isSpecificBuilderOpen,
  onCloseRecurrentBuilder,
  onCloseSpecificBuilder,
  onSaveRecurrentProposal,
  isSavingRecurrent,
  isEditMode = false,
  editingProposal,
  onUpdateProposal
}: ProposalsBuilderManagerProps) => {
  // Mostrar el constructor de propuestas recurrentes LEGALES
  if (isRecurrentBuilderOpen) {
    return (
      <RecurringProposalForm
        open={true}
        onOpenChange={onCloseRecurrentBuilder}
        onSubmit={isEditMode && editingProposal && onUpdateProposal 
          ? (data: any) => onUpdateProposal(editingProposal.id, data)
          : onSaveRecurrentProposal
        }
        isCreating={isSavingRecurrent}
        editingProposal={isEditMode ? editingProposal : undefined}
        isEditMode={isEditMode}
      />
    )
  }

  // Mostrar el constructor de propuestas puntuales
  if (isSpecificBuilderOpen) {
    return (
      <NewProposalDialog
        open={true}
        onOpenChange={onCloseSpecificBuilder}
        onSubmit={isEditMode && editingProposal && onUpdateProposal 
          ? (data: any) => onUpdateProposal(editingProposal.id, data)
          : (data: any) => {
              // Por ahora solo log, esto debería conectarse con la lógica de creación
              console.log('Crear propuesta puntual:', data)
            }
        }
        isCreating={isSavingRecurrent}
        editingProposal={isEditMode ? editingProposal : undefined}
        isEditMode={isEditMode}
      />
    )
  }

  return null
}
