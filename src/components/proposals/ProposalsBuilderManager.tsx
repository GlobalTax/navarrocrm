
import { LegalProposalBuilder } from '@/components/proposals/legal/LegalProposalBuilder'
import { ProfessionalProposalBuilder } from '@/components/proposals/ProfessionalProposalBuilder'
import { ProposalFormData } from '@/types/proposals'

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
  // Mostrar el wizard profesional para ambos tipos de propuestas
  if (isRecurrentBuilderOpen || isSpecificBuilderOpen) {
    return (
      <LegalProposalBuilder
        onClose={isRecurrentBuilderOpen ? onCloseRecurrentBuilder : onCloseSpecificBuilder}
        onSave={isEditMode && editingProposal && onUpdateProposal 
          ? (data: any) => onUpdateProposal(editingProposal.id, data)
          : onSaveRecurrentProposal
        }
        isSaving={isSavingRecurrent}
      />
    )
  }

  return null
}
