
import { useState } from 'react'
import { CasesPageContainer } from '@/components/cases/CasesPageContainer'
import { CasesHeader } from '@/components/cases/CasesHeader'
import { CasesStats } from '@/components/cases/CasesStats'
import { CasesFilters } from '@/components/cases/CasesFilters'
import { CasesBulkActions } from '@/components/cases/CasesBulkActions'
import { CasesTabsContent } from '@/components/cases/CasesTabsContent'
import { CasesDialogManager } from '@/components/cases/CasesDialogManager'
import { useCases, Case } from '@/hooks/useCases'
import { usePracticeAreas } from '@/hooks/usePracticeAreas'
import { useUsers } from '@/hooks/useUsers'
import { useMatterTemplates } from '@/hooks/useMatterTemplates'

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

  return (
    <CasesPageContainer>
      <CasesHeader 
        templates={templates}
        onNewCase={() => setIsWizardOpen(true)}
      />

      <CasesStats cases={filteredCases} />

      <CasesFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        practiceAreaFilter={practiceAreaFilter}
        setPracticeAreaFilter={setPracticeAreaFilter}
        solicitorFilter={solicitorFilter}
        setSolicitorFilter={setSolicitorFilter}
        practiceAreas={practiceAreas}
        users={users}
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
    </CasesPageContainer>
  )
}
