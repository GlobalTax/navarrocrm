import { LegalProposalBuilder } from '@/components/proposals/legal/LegalProposalBuilder'
import { ProfessionalProposalBuilder } from '@/components/proposals/ProfessionalProposalBuilder'
import type { ProposalFormData } from '@/types/proposals/forms'

interface ProposalsBuilderManagerProps {
  isRecurrentBuilderOpen: boolean
  isSpecificBuilderOpen: boolean
  onCloseRecurrentBuilder: () => void
  onCloseSpecificBuilder: () => void
  onSaveRecurrentProposal: (data: ProposalFormData) => void
  isSavingRecurrent: boolean
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
  if (isRecurrentBuilderOpen) {
    return (
      <LegalProposalBuilder
        onClose={onCloseRecurrentBuilder}
        onSave={isEditMode && editingProposal && onUpdateProposal 
          ? (data: any) => onUpdateProposal(editingProposal.id, data)
          : onSaveRecurrentProposal
        }
        isSaving={isSavingRecurrent}
      />
    )
  }

  if (isSpecificBuilderOpen) {
    return (
      <ProfessionalProposalBuilder
        onBack={onCloseSpecificBuilder}
      />
    )
  }

  return null
}