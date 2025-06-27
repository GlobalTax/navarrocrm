
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { CasesMainContent } from '@/components/cases/CasesMainContent'
import { CasesDialogManager } from '@/components/cases/CasesDialogManager'
import { CreateTemplateDialog } from '@/components/cases/CreateTemplateDialog'
import { TemplateWizard } from '@/components/cases/wizard/TemplateWizard'
import { CasesLoadingState } from '@/components/cases/CasesLoadingState'
import { CasesPageActions } from '@/components/cases/CasesPageActions'
import { useCasesPageState } from '@/hooks/cases/useCasesPageState'

export default function Cases() {
  const {
    filteredCases,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    practiceAreaFilter,
    setPracticeAreaFilter,
    solicitorFilter,
    setSolicitorFilter,
    isSearching,
    searchStats,
    searchResultsWithScore,
    clearAllFilters,
    createCase,
    isCreating,
    isCreateSuccess,
    createCaseReset,
    deleteCase,
    isDeleting,
    archiveCase,
    isArchiving,
    templates,
    createTemplate,
    isCreating: isCreatingTemplate,
    isCreateDialogOpen,
    openCreateDialog,
    closeCreateDialog,
    isAdvancedWizardOpen,
    openAdvancedWizard,
    closeAdvancedWizard,
    handlers,
    statusOptions,
    practiceAreaOptions,
    solicitorOptions
  } = useCasesPageState()

  if (isLoading) {
    return <CasesLoadingState />
  }

  const hasActiveFilters = searchStats.isFiltered

  // Transform searchResultsWithScore to match expected type
  const transformedSearchResults = searchResultsWithScore?.map(result => ({
    id: result.item?.id || '',
    score: result.score || 0
  })) || []

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Expedientes"
        description="Gestiona todos los expedientes del despacho"
        primaryAction={{
          label: 'Nuevo Expediente',
          onClick: () => handlers.setIsWizardOpen(true)
        }}
      >
        <CasesPageActions
          templates={templates}
          filteredCases={filteredCases}
          onExportCases={handlers.handleExportCases}
          onUseTemplate={handlers.handleUseTemplate}
          onOpenCreateDialog={openCreateDialog}
          onOpenAdvancedWizard={openAdvancedWizard}
        />
      </StandardPageHeader>

      <CasesMainContent
        filteredCases={filteredCases}
        templates={templates}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        practiceAreaFilter={practiceAreaFilter}
        setPracticeAreaFilter={setPracticeAreaFilter}
        solicitorFilter={solicitorFilter}
        setSolicitorFilter={setSolicitorFilter}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAllFilters}
        selectedCases={handlers.selectedCases}
        onViewCase={handlers.handleViewCase}
        onEditCase={handlers.handleEditCase}
        onDeleteCase={handlers.handleDeleteCase}
        onArchiveCase={handlers.handleArchiveCase}
        onSelectCase={handlers.handleSelectCase}
        onSelectAll={handlers.handleSelectAll}
        searchResultsWithScore={transformedSearchResults}
        isSearching={isSearching}
        statusOptions={statusOptions}
        practiceAreaOptions={practiceAreaOptions}
        solicitorOptions={solicitorOptions}
        onOpenWorkspace={handlers.handleOpenWorkspace}
      />

      <CasesDialogManager
        selectedCase={handlers.selectedCase}
        isDetailOpen={handlers.isDetailOpen}
        onDetailClose={() => handlers.setIsDetailOpen(false)}
        isWizardOpen={handlers.isWizardOpen}
        onWizardOpenChange={handlers.setIsWizardOpen}
        onSubmit={createCase}
        isCreating={isCreating}
        isCreateSuccess={isCreateSuccess}
        onResetCreate={createCaseReset}
        caseToDelete={handlers.caseToDelete}
        isDeleteDialogOpen={handlers.isDeleteDialogOpen}
        onDeleteDialogClose={() => {
          handlers.setIsDeleteDialogOpen(false)
          handlers.setCaseToDelete(null)
        }}
        onConfirmDelete={handlers.handleConfirmDelete}
        isDeleting={isDeleting}
        caseToArchive={handlers.caseToArchive}
        isArchiveDialogOpen={handlers.isArchiveDialogOpen}
        onArchiveDialogClose={() => {
          handlers.setIsArchiveDialogOpen(false)
          handlers.setCaseToArchive(null)
        }}
        onConfirmArchive={handlers.handleConfirmArchive}
        isArchiving={isArchiving}
        isWorkspaceOpen={handlers.isWorkspaceOpen}
        onWorkspaceClose={handlers.handleCloseWorkspace}
      />

      <CreateTemplateDialog
        open={isCreateDialogOpen}
        onOpenChange={closeCreateDialog}
        onSubmit={createTemplate}
        isCreating={isCreatingTemplate}
      />

      <TemplateWizard
        open={isAdvancedWizardOpen}
        onOpenChange={closeAdvancedWizard}
        onSubmit={createTemplate}
        isCreating={isCreatingTemplate}
      />
    </StandardPageContainer>
  )
}
