
import { ProposalBuilder } from '@/modules/proposals/components/ProposalBuilder'
import ProposalDemoModule from '@/components/proposals/ProposalDemoModule'
import { ProfessionalProposalBuilder } from '@/components/proposals/ProfessionalProposalBuilder'
import { Button } from '@/components/ui/button'
import { ProposalFormData } from '@/modules/proposals/types/proposal.schema'

interface ProposalsBuilderManagerProps {
  showEnhancedBuilder: boolean
  showProfessionalBuilder: boolean
  showAdvancedProfessionalBuilder: boolean
  onCloseEnhancedBuilder: () => void
  onCloseProfessionalBuilder: () => void
  onCloseAdvancedProfessionalBuilder: () => void
  onSaveEnhancedProposal: (data: ProposalFormData) => void
  isSavingEnhanced: boolean
}

export const ProposalsBuilderManager = ({
  showEnhancedBuilder,
  showProfessionalBuilder,
  showAdvancedProfessionalBuilder,
  onCloseEnhancedBuilder,
  onCloseProfessionalBuilder,
  onCloseAdvancedProfessionalBuilder,
  onSaveEnhancedProposal,
  isSavingEnhanced
}: ProposalsBuilderManagerProps) => {
  // Mostrar el ProposalBuilder si está activo
  if (showEnhancedBuilder) {
    console.log('Showing ProposalBuilder')
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nueva Propuesta Avanzada</h1>
            <p className="text-gray-600 mt-1">Crea propuestas comerciales con planes de precios personalizados</p>
          </div>
          <Button variant="outline" onClick={onCloseEnhancedBuilder}>
            Volver a Propuestas
          </Button>
        </div>
        
        <ProposalBuilder
          onSave={onSaveEnhancedProposal}
          isSaving={isSavingEnhanced}
        />
      </div>
    )
  }

  // Mostrar el ProposalDemoModule si está activo
  if (showProfessionalBuilder) {
    console.log('Showing ProposalDemoModule')
    return (
      <ProposalDemoModule onBack={onCloseProfessionalBuilder} />
    )
  }

  // Mostrar el nuevo ProfessionalProposalBuilder
  if (showAdvancedProfessionalBuilder) {
    return (
      <ProfessionalProposalBuilder onBack={onCloseAdvancedProfessionalBuilder} />
    )
  }

  return null
}
