
import { useState } from 'react'
import { CasesStats } from '@/components/cases/CasesStats'
import { CasesBulkActions } from '@/components/cases/CasesBulkActions'
import { CasesTabsContent } from '@/components/cases/CasesTabsContent'
import { CasesDialogManager } from '@/components/cases/CasesDialogManager'
import { SearchStats } from '@/components/search/SearchStats'
import { useCases, Case } from '@/hooks/useCases'
import { usePracticeAreas } from '@/hooks/usePracticeAreas'
import { useUsers } from '@/hooks/useUsers'
import { useMatterTemplates } from '@/hooks/useMatterTemplates'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { StandardFilters } from '@/components/layout/StandardFilters'
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

  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [selectedCases, setSelectedCases] = useState<string[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [caseToDelete, setCaseToDelete] = useState<Case | null>(null)
  const [caseToArchive, setCaseToArchive] = useState<Case | null>(null)

  const handleViewCase = (case_: Case) => {
    setSelectedCase(case_)
    setIsDetailOpen(true)
  }

  const handleEditCase = (case_: Case) => {
    setSelectedCase(case_)
    setIsWizardOpen(true)
  }

  const handleDeleteCase = (case_: Case) => {
    setCaseToDelete(case_)
    setIsDeleteDialogOpen(true)
  }

  const handleArchiveCase = (case_: Case) => {
    setCaseToArchive(case_)
    setIsArchiveDialogOpen(true)
  }

  const handleConfirmDelete = (caseId: string) => {
    deleteCase(caseId)
    setIsDeleteDialogOpen(false)
    setCaseToDelete(null)
  }

  const handleConfirmArchive = (caseId: string) => {
    archiveCase(caseId)
    setIsArchiveDialogOpen(false)
    setCaseToArchive(null)
  }

  const handleSelectCase = (caseId: string, selected: boolean) => {
    if (selected) {
      setSelectedCases([...selectedCases, caseId])
    } else {
      setSelectedCases(selectedCases.filter(id => id !== caseId))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedCases(filteredCases.map(c => c.id))
    } else {
      setSelectedCases([])
    }
  }

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
          onClick: () => setIsWizardOpen(true)
        }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="default">
              Acciones
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              Exportar Expedientes
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              Plantillas ({templates.length})
            </DropdownMenuItem>
            {templates.map((template) => (
              <DropdownMenuItem key={template.id} className="pl-8">
                {template.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Nueva Plantilla
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </StandardPageHeader>

      <CasesStats cases={filteredCases} />

      <StandardFilters
        searchPlaceholder="Buscar expedientes..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            placeholder: 'Estado',
            value: statusFilter,
            onChange: setStatusFilter,
            options: statusOptions
          },
          {
            placeholder: 'Área de práctica',
            value: practiceAreaFilter,
            onChange: setPracticeAreaFilter,
            options: practiceAreaOptions
          },
          {
            placeholder: 'Abogado',
            value: solicitorFilter,
            onChange: setSolicitorFilter,
            options: solicitorOptions
          }
        ]}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAllFilters}
      />

      <SearchStats 
        stats={searchStats}
        isSearching={isSearching}
        searchTerm={searchTerm}
      />

      <CasesBulkActions selectedCases={selectedCases} />

      <CasesTabsContent
        filteredCases={filteredCases}
        onViewCase={handleViewCase}
        onEditCase={handleEditCase}
        onDeleteCase={handleDeleteCase}
        onArchiveCase={handleArchiveCase}
        selectedCases={selectedCases}
        onSelectCase={handleSelectCase}
        onSelectAll={handleSelectAll}
        searchResultsWithScore={searchResultsWithScore}
        searchTerm={searchTerm}
        isSearching={isSearching}
      />

      <CasesDialogManager
        selectedCase={selectedCase}
        isDetailOpen={isDetailOpen}
        onDetailClose={() => setIsDetailOpen(false)}
        isWizardOpen={isWizardOpen}
        onWizardOpenChange={setIsWizardOpen}
        onSubmit={createCase}
        isCreating={isCreating}
        isCreateSuccess={isCreateSuccess}
        onResetCreate={createCaseReset}
        caseToDelete={caseToDelete}
        isDeleteDialogOpen={isDeleteDialogOpen}
        onDeleteDialogClose={() => {
          setIsDeleteDialogOpen(false)
          setCaseToDelete(null)
        }}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
        caseToArchive={caseToArchive}
        isArchiveDialogOpen={isArchiveDialogOpen}
        onArchiveDialogClose={() => {
          setIsArchiveDialogOpen(false)
          setCaseToArchive(null)
        }}
        onConfirmArchive={handleConfirmArchive}
        isArchiving={isArchiving}
      />
    </StandardPageContainer>
  )
}
