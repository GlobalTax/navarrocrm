
import { useState, useCallback, memo } from 'react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { useProposalsPageLogic } from '@/components/proposals/ProposalsPageLogic'
import { useProposalsPageHandlers } from '@/components/proposals/ProposalsPageHandlers'
import { useProposalActions } from '@/hooks/proposals/useProposalActions'
import { ProposalsEmptyClientsBanner } from '@/components/proposals/ProposalsEmptyClientsBanner'
import { ProposalsLoadingState } from '@/components/proposals/ProposalsLoadingState'
import { ProposalsFiltersSection } from '@/components/proposals/ProposalsFiltersSection'
import { ProposalsBuilderManager } from '@/components/proposals/ProposalsBuilderManager'
import { ProposalsTabsView } from '@/components/proposals/ProposalsTabsView'
import { ProposalMetrics } from '@/components/proposals/ProposalMetrics'
import { ProposalDetailDialog } from '@/components/proposals/ProposalDetailDialog'
import { ProposalConfirmationDialog } from '@/components/proposals/ProposalConfirmationDialog'
import { OnboardingConfirmationDialog } from '@/components/proposals/OnboardingConfirmationDialog'
import { ProposalsErrorBoundary } from '@/components/proposals/ProposalsErrorBoundary'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { Button } from '@/components/ui/button'
import { VisibleCard } from '@/components/ui/VisibleCard'
import { useUIPreferences } from '@/hooks/useUIPreferences'

export default function Proposals() {
  // Removed console.log to prevent render loop
  const { showKpis, toggleKpis } = useUIPreferences('proposals', { showKpis: false })
  const { startOnboardingFromProposal } = useOnboarding()
  const { updateProposal } = useProposalActions()
  const [onboardingDialog, setOnboardingDialog] = useState<{
    isOpen: boolean
    proposal: any
  }>({
    isOpen: false,
    proposal: null
  })

  // Función para manejar propuesta ganada y mostrar diálogo de onboarding
  const handleProposalWon = useCallback((proposal: any) => {
    setOnboardingDialog({
      isOpen: true,
      proposal
    })
  }, [])

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
    saveRecurrentProposal,
    error
  } = useProposalsPageLogic(handleProposalWon)

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
    openEditProposal: pageState.openEditProposal, // Pasar la nueva función
  })

  if (process.env.NODE_ENV === 'development') {
    console.log('Current state:', { 
      isRecurrentBuilderOpen: pageState.isRecurrentBuilderOpen, 
      isSpecificBuilderOpen: pageState.isSpecificBuilderOpen, 
      isLoading, 
      user,
      clientsCount: clients.length
    })
  }

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
          isEditMode={pageState.isEditMode}
          editingProposal={pageState.editingProposal}
          onUpdateProposal={async (proposalId: string, data: any) => {
            await updateProposal(proposalId, data)
            pageState.closeEditProposal()
          }}
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

      <ProposalsErrorBoundary error={error}>
        <div className="flex justify-end mb-4">
          <Button variant="outline" size="sm" onClick={toggleKpis}>
            {showKpis ? 'Ocultar Widgets' : 'Ver Widgets'}
          </Button>
        </div>
        <ProposalsEmptyClientsBanner clientsCount={clients.length} />

        {showKpis && (
          <VisibleCard pageKey="proposals" cardId="proposal-metrics" title="Métricas de propuestas">
            <ProposalMetrics />
          </VisibleCard>
        )}

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
      </ProposalsErrorBoundary>

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

      {/* Diálogo de confirmación de onboarding */}
      <OnboardingConfirmationDialog
        isOpen={onboardingDialog.isOpen}
        onClose={() => setOnboardingDialog({ isOpen: false, proposal: null })}
        onConfirm={async () => {
          if (onboardingDialog.proposal) {
            await startOnboardingFromProposal(onboardingDialog.proposal)
            setOnboardingDialog({ isOpen: false, proposal: null })
          }
        }}
        proposalTitle={onboardingDialog.proposal?.title || ''}
        clientName={onboardingDialog.proposal?.contact?.name || 'Cliente'}
        clientType={onboardingDialog.proposal?.contact?.client_type || 'particular'}
      />
    </StandardPageContainer>
  )
}
