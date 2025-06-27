
import { useCases } from '@/hooks/useCases'
import { usePracticeAreas } from '@/hooks/usePracticeAreas'
import { useUsers } from '@/hooks/useUsers'
import { useMatterTemplates } from '@/hooks/useMatterTemplates'
import { useMatterTemplateActions } from '@/hooks/useMatterTemplateActions'
import { useCasesHandlers } from '@/hooks/cases/useCasesHandlers'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { CasesMainContent } from '@/components/cases/CasesMainContent'
import { CasesDialogManager } from '@/components/cases/CasesDialogManager'
import { CreateTemplateDialog } from '@/components/cases/CreateTemplateDialog'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'

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
    isArchiving
  } = useCases()

  const { practiceAreas = [] } = usePracticeAreas()
  const { users = [] } = useUsers()
  const { templates = [] } = useMatterTemplates()

  const { 
    createTemplate,
    isCreating: isCreatingTemplate,
    isCreateDialogOpen,
    openCreateDialog,
    closeCreateDialog,
    isAdvancedWizardOpen,
    openAdvancedWizard,
    closeAdvancedWizard
  } = useMatterTemplateActions()

  const handlers = useCasesHandlers(createCase, deleteCase, archiveCase)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando expedientes...</p>
        </div>
      </div>
    )
  }

  const statusOptions = [
    { label: 'Todos los estados', value: 'all' },
    { label: 'Activos', value: 'active' },
    { label: 'Abierto', value: 'open' },
    { label: 'En espera', value: 'on_hold' },
    { label: 'Cerrado', value: 'closed' },
    { label: 'Archivados', value: 'archived' }
  ]

  const practiceAreaOptions = [
    { label: 'Todas las áreas', value: 'all' },
    ...practiceAreas.map(area => ({ label: area.name, value: area.name }))
  ]

  const solicitorOptions = [
    { label: 'Todos los abogados', value: 'all' },
    ...users.map(user => ({ label: user.email, value: user.id }))
  ]

  const hasActiveFilters = searchStats.isFiltered

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="default">
              Acciones
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => handlers.handleExportCases(filteredCases)}>
              Exportar Expedientes
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              Plantillas ({templates.length})
            </DropdownMenuItem>
            {templates.map((template) => (
              <DropdownMenuItem 
                key={template.id} 
                className="pl-8"
                onClick={() => handlers.handleUseTemplate(template.id)}
              >
                {template.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={openCreateDialog}>
              Nueva Plantilla Básica
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openAdvancedWizard}>
              Nueva Plantilla Avanzada
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
        searchResultsWithScore={searchResultsWithScore}
        isSearching={isSearching}
        statusOptions={statusOptions}
        practiceAreaOptions={practiceAreaOptions}
        solicitorOptions={solicitorOptions}
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
