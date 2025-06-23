
import { Loader2 } from 'lucide-react'
import { useProposals } from '@/hooks/useProposals'
import { ProposalMetrics } from '@/components/proposals/ProposalMetrics'
import { ProposalFilters } from '@/components/proposals/ProposalFilters'
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
  const { mutate: saveRecurrentProposal, isPending: isSavingRecurrent } = useSaveProposal()
  const { user } = useApp()
  
  // Estados de la página
  const pageState = useProposalsPageState()
  const { filters, setFilters, filterProposals, categorizeProposals, getProposalMetrics } = useProposalsFilters()

  console.log('Current state:', { 
    isRecurrentBuilderOpen: pageState.isRecurrentBuilderOpen, 
    isSpecificBuilderOpen: pageState.isSpecificBuilderOpen, 
    isLoading, 
    user 
  })

  // Filtrar y categorizar propuestas
  const filteredProposals = filterProposals(proposals)
  const categorizedProposals = categorizeProposals(filteredProposals)
  const metrics = getProposalMetrics(filteredProposals)

  // Handlers
  const handleStatusChange = (id: string, status: any) => {
    updateProposalStatus.mutate({ id, status })
  }

  const handleViewProposal = (proposal: any) => {
    console.log('Ver propuesta:', proposal)
  }

  const handleSaveRecurrentProposal = (data: ProposalFormData) => {
    console.log('Handling save recurrent proposal:', data)
    if (!user || !user.org_id) {
      console.error("User or org_id is not available. Cannot save proposal.")
      return
    }
    saveRecurrentProposal({
      proposalData: { ...data, is_recurring: true },
      orgId: user.org_id,
      userId: user.id,
    })
    pageState.closeRecurrentBuilder()
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
  const showingBuilder = pageState.isRecurrentBuilderOpen || pageState.isSpecificBuilderOpen
  if (showingBuilder) {
    return (
      <ProposalsBuilderManager
        isRecurrentBuilderOpen={pageState.isRecurrentBuilderOpen}
        isSpecificBuilderOpen={pageState.isSpecificBuilderOpen}
        onCloseRecurrentBuilder={pageState.closeRecurrentBuilder}
        onCloseSpecificBuilder={pageState.closeSpecificBuilder}
        onSaveRecurrentProposal={handleSaveRecurrentProposal}
        isSavingRecurrent={isSavingRecurrent}
      />
    )
  }

  return (
    <div className="space-y-6">
      <ProposalsPageHeader
        onOpenRecurrentBuilder={pageState.openRecurrentBuilder}
        onOpenSpecificBuilder={pageState.openSpecificBuilder}
      />

      <ProposalMetrics />
      <ProposalFilters filters={filters} onFiltersChange={setFilters} />

      <ProposalsTabsView
        proposals={categorizedProposals}
        onStatusChange={handleStatusChange}
        onViewProposal={handleViewProposal}
        onOpenRecurrentBuilder={pageState.openRecurrentBuilder}
        onOpenSpecificBuilder={pageState.openSpecificBuilder}
      />
    </div>
  )
}
