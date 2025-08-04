import { useState, useMemo, useCallback } from 'react'
import { 
  CasesStats,
  CasesBulkActions, 
  CasesTabsContent,
  CasesDialogManager,
  CasesLoadingState 
} from '@/features/cases/components'
import { useCases, type Case } from '@/hooks/useCases'
import { usePracticeAreas } from '@/hooks/usePracticeAreas'
import { useUsers } from '@/hooks/useUsers'
import { useMatterTemplates } from '@/hooks/useMatterTemplates'
import { useExportCases } from '@/hooks/useExportCases'
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
  const { templates = [], createTemplate, isCreating: isCreatingTemplate } = useMatterTemplates()
  const { exportCasesToCSV } = useExportCases()

  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isNewTemplateOpen, setIsNewTemplateOpen] = useState(false)
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

  // Optimizar callbacks con useCallback
  const handleSelectCase = useCallback((caseId: string, selected: boolean) => {
    setSelectedCases(prev => 
      selected 
        ? [...prev, caseId]
        : prev.filter(id => id !== caseId)
    )
  }, [])

  const handleSelectAll = useCallback((selected: boolean) => {
    setSelectedCases(selected ? filteredCases.map(c => c.id) : [])
  }, [filteredCases])

  const handleExportCases = useCallback(() => {
    exportCasesToCSV(filteredCases, 'expedientes')
  }, [filteredCases, exportCasesToCSV])

  const handleNewTemplate = useCallback(() => {
    setIsNewTemplateOpen(true)
  }, [])

  const handleNewTemplateSubmit = useCallback((data: {
    name: string
    description?: string
    practice_area_id?: string
    default_billing_method?: string
  }) => {
    createTemplate(data)
    setIsNewTemplateOpen(false)
  }, [createTemplate])

  // Usar skeleton loader optimizado
  if (isLoading) {
    return (
      <StandardPageContainer>
        <StandardPageHeader
          title="Expedientes"
          description="Gestiona todos los expedientes del despacho"
          primaryAction={{
            label: 'Nuevo Expediente',
            onClick: () => setIsWizardOpen(true)
          }}
        />
        <CasesLoadingState />
      </StandardPageContainer>
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
    { label: 'Todos los asesores', value: 'all' },
    ...users.map(user => ({ label: user.email, value: user.id }))
  ]

  const hasActiveFilters = Boolean(
    statusFilter !== 'all' || 
    practiceAreaFilter !== 'all' || 
    solicitorFilter !== 'all' || 
    searchTerm
  )

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setPracticeAreaFilter('all')
    setSolicitorFilter('all')
  }

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
            <DropdownMenuItem onClick={handleExportCases}>
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
            <DropdownMenuItem onClick={handleNewTemplate}>
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
            placeholder: 'Asesor',
            value: solicitorFilter,
            onChange: setSolicitorFilter,
            options: solicitorOptions
          }
        ]}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      <CasesBulkActions selectedCases={selectedCases} />

        <CasesTabsContent
          filteredCases={filteredCases}
          onView={handleViewCase}
          onEdit={handleEditCase}
          onDelete={handleDeleteCase}
          onArchive={handleArchiveCase}
          onStagesView={handleViewCase}
          selectedCases={selectedCases}
          onSelectCase={handleSelectCase}
          onSelectAll={handleSelectAll}
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
        isNewTemplateOpen={isNewTemplateOpen}
        onNewTemplateOpenChange={setIsNewTemplateOpen}
        onNewTemplateSubmit={handleNewTemplateSubmit}
        isCreatingTemplate={isCreatingTemplate}
      />
    </StandardPageContainer>
  )
}
