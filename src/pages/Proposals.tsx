
import { Loader2 } from 'lucide-react'
import { useProposals } from '@/hooks/useProposals'
import { ProposalMetrics } from '@/components/proposals/ProposalMetrics'
import { ProposalFilters } from '@/components/proposals/ProposalFilters'
import { RecurringProposalForm } from '@/components/proposals/RecurringProposalForm'
import { useSaveProposal } from '@/modules/proposals/hooks/useSaveProposal'
import { ProposalFormData } from '@/modules/proposals/types/proposal.schema'
import { useApp } from '@/contexts/AppContext'
import { useProposalsPageState } from '@/hooks/proposals/useProposalsPageState'
import { useProposalsFilters } from '@/hooks/proposals/useProposalsFilters'
import { ProposalsPageHeader } from '@/components/proposals/ProposalsPageHeader'
import { ProposalsBuilderManager } from '@/components/proposals/ProposalsBuilderManager'
import { ProposalsTabsView } from '@/components/proposals/ProposalsTabsView'

export default function Proposals() {
  console.log('Proposals page rendering')
  
  const { proposals, isLoading, createProposal, updateProposalStatus, isCreating } = useProposals()
  const { mutate: saveBasicProposal, isPending: isSavingBasic } = useSaveProposal()
  const { user } = useApp()
  
  // Estados de la página
  const pageState = useProposalsPageState()
  const { filters, setFilters, filterProposals, categorizeProposals } = useProposalsFilters()

  console.log('Current state:', { 
    isBasicBuilderOpen: pageState.isBasicBuilderOpen, 
    isProfessionalBuilderOpen: pageState.isProfessionalBuilderOpen, 
    isLoading, 
    user 
  })

  // Filtrar y categorizar propuestas
  const filteredProposals = filterProposals(proposals)
  const categorizedProposals = categorizeProposals(filteredProposals)

  // Handlers
  const handleStatusChange = (id: string, status: any) => {
    updateProposalStatus.mutate({ id, status })
  }

  const handleViewProposal = (proposal: any) => {
    console.log('Ver propuesta:', proposal)
  }

  const handleSaveBasicProposal = (data: ProposalFormData) => {
    console.log('Handling save basic proposal:', data)
    if (!user || !user.org_id) {
      console.error("User or org_id is not available. Cannot save proposal.")
      return
    }
    saveBasicProposal({
      proposalData: data,
      orgId: user.org_id,
      userId: user.id,
    })
    pageState.closeBasicBuilder()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando propuestas...</span>
        </div>
      </div>
    )
  }

  // Mostrar builders si están activos
  const showingBuilder = pageState.isBasicBuilderOpen || pageState.isProfessionalBuilderOpen
  if (showingBuilder) {
    return (
      <ProposalsBuilderManager
        isBasicBuilderOpen={pageState.isBasicBuilderOpen}
        isProfessionalBuilderOpen={pageState.isProfessionalBuilderOpen}
        onCloseBasicBuilder={pageState.closeBasicBuilder}
        onCloseProfessionalBuilder={pageState.closeProfessionalBuilder}
        onSaveBasicProposal={handleSaveBasicProposal}
        isSavingBasic={isSavingBasic}
      />
    )
  }

  return (
    <div className="space-y-6">
      <ProposalsPageHeader
        onOpenBasicBuilder={pageState.openBasicBuilder}
        onOpenProfessionalBuilder={pageState.openProfessionalBuilder}
      />

      <ProposalMetrics />
      <ProposalFilters filters={filters} onFiltersChange={setFilters} />

      <ProposalsTabsView
        proposals={categorizedProposals}
        onStatusChange={handleStatusChange}
        onViewProposal={handleViewProposal}
        onOpenBasicBuilder={pageState.openBasicBuilder}
        onOpenProfessionalBuilder={pageState.openProfessionalBuilder}
      />
    </div>
  )
}
