
import { ProposalBuilder } from '@/modules/proposals/components/ProposalBuilder'
import { ProfessionalProposalBuilder } from '@/components/proposals/ProfessionalProposalBuilder'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ProposalFormData } from '@/modules/proposals/types/proposal.schema'

interface ProposalsBuilderManagerProps {
  isBasicBuilderOpen: boolean
  isProfessionalBuilderOpen: boolean
  onCloseBasicBuilder: () => void
  onCloseProfessionalBuilder: () => void
  onSaveBasicProposal: (data: ProposalFormData) => void
  isSavingBasic: boolean
}

export const ProposalsBuilderManager = ({
  isBasicBuilderOpen,
  isProfessionalBuilderOpen,
  onCloseBasicBuilder,
  onCloseProfessionalBuilder,
  onSaveBasicProposal,
  isSavingBasic
}: ProposalsBuilderManagerProps) => {
  // Mostrar el constructor básico (ProposalBuilder + ProposalDemoModule unificados)
  if (isBasicBuilderOpen) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nueva Propuesta Básica</h1>
            <p className="text-gray-600 mt-1">Constructor simplificado para propuestas comerciales</p>
          </div>
          <Button variant="outline" onClick={onCloseBasicBuilder}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        
        <ProposalBuilder
          onSave={onSaveBasicProposal}
          isSaving={isSavingBasic}
        />
      </div>
    )
  }

  // Mostrar el constructor profesional
  if (isProfessionalBuilderOpen) {
    return (
      <ProfessionalProposalBuilder onBack={onCloseProfessionalBuilder} />
    )
  }

  return null
}
