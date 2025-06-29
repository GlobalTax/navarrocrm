
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { useProposalsPageLogic } from '@/components/proposals/ProposalsPageLogic'
import { useProposalsPageHandlers } from '@/components/proposals/ProposalsPageHandlers'
import { ProposalsEmptyClientsBanner } from '@/components/proposals/ProposalsEmptyClientsBanner'
import { ProposalsLoadingState } from '@/components/proposals/ProposalsLoadingState'
import { ProposalsFiltersSection } from '@/components/proposals/ProposalsFiltersSection'
import { ProposalsBuilderManager } from '@/components/proposals/ProposalsBuilderManager'
import { ProposalsTabsView } from '@/components/proposals/ProposalsTabsView'
import { ProposalMetrics } from '@/components/proposals/ProposalMetrics'
import { ProposalDetailDialog } from '@/components/proposals/ProposalDetailDialog'
import { ProposalConfirmationDialog } from '@/components/proposals/ProposalConfirmationDialog'

export default function Proposals() {
  console.log('Proposals page rendering')
  
  const {
    categorizedProposals,
    clients,
    user,
    isLoading,
    isSavingRecurrent,
    pageState,
    filters,
    setFilters,
    updateProposalStatus,
    saveRecurrentProposal
  } = useProposalsPageLogic()

  const { 
    handleStatusChange, 
    handleViewProposal, 
    handleEditProposal,
    handleDuplicateProposal,
    handleDetailStatusChange,
    handleSaveRecurrentProposal,
    selectedProposal,
    isDetailDialogOpen,
    confirmDialog,
    closeDetailDialog,
    closeConfirmDialog
  } = useProposalsPageHandlers({
    updateProposalStatus,
    saveRecurrentProposal,
    user,
    closeRecurrentBuilder: pageState.closeRecurrentBuilder,
  })

  console.log('Current state:', { 
    isRecurrentBuilderOpen: pageState.isRecurrentBuilderOpen, 
    isSpecificBuilderOpen: pageState.isSpecificBuilderOpen, 
    isLoading, 
    user,
    clientsCount: clients.length
  })

  if (isLoading) {
    return <ProposalsLoadingState />
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

  const hasActiveFilters = Boolean(
    (filters.status && filters.status !== 'all') || 
    filters.search || 
    filters.type !== 'all'
  )

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      search: '',
      dateFrom: undefined,
      dateTo: undefined,
      type: 'all'
    })
  }

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Propuestas Comerciales"
        description="Gestiona propuestas recurrentes y servicios puntuales"
        badges={[
          {
            label: 'Recurrentes: Fiscal, Contabilidad, Laboral',
            variant: 'outline',
            color: 'text-blue-600 border-blue-200 bg-blue-50'
          },
          {
            label: 'Puntuales: Proyectos específicos',
            variant: 'outline',
            color: 'text-green-600 border-green-200 bg-green-50'
          }
        ]}
        secondaryAction={{
          label: 'Propuesta Recurrente',
          onClick: pageState.openRecurrentBuilder,
          variant: 'outline'
        }}
        primaryAction={{
          label: 'Propuesta Puntual',
          onClick: pageState.openSpecificBuilder
        }}
      />

      <ProposalsEmptyClientsBanner clientsCount={clients.length} />

      <ProposalMetrics />

      <ProposalsFiltersSection
        filters={filters}
        setFilters={setFilters}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      <ProposalsTabsView
        proposals={categorizedProposals}
        onStatusChange={handleStatusChange}
        onViewProposal={handleViewProposal}
        onEditProposal={handleEditProposal}
        onDuplicateProposal={handleDuplicateProposal}
        onOpenRecurrentBuilder={pageState.openRecurrentBuilder}
        onOpenSpecificBuilder={pageState.openSpecificBuilder}
      />

      {/* Diálogo de detalles */}
      <ProposalDetailDialog
        proposal={selectedProposal}
        isOpen={isDetailDialogOpen}
        onClose={closeDetailDialog}
        onEdit={handleEditProposal}
        onDuplicate={handleDuplicateProposal}
        onStatusChange={handleDetailStatusChange}
      />

      {/* Diálogo de confirmación */}
      <ProposalConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
      />
    </StandardPageContainer>
  )
}
