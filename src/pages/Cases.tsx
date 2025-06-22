
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardHeader } from '@/components/ui/card'

import { CaseTable } from '@/components/cases/CaseTable'
import { CaseDetailDialog } from '@/components/cases/CaseDetailDialog'
import { MatterWizard } from '@/components/cases/wizard/MatterWizard'
import { CasesHeader } from '@/components/cases/CasesHeader'
import { CasesStats } from '@/components/cases/CasesStats'
import { CasesFilters } from '@/components/cases/CasesFilters'
import { CasesBulkActions } from '@/components/cases/CasesBulkActions'
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
    createCaseReset
  } = useCases()

  const { practiceAreas = [] } = usePracticeAreas()
  const { users = [] } = useUsers()
  const { templates = [] } = useMatterTemplates()

  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [selectedCases, setSelectedCases] = useState<string[]>([])

  const handleViewCase = (case_: Case) => {
    setSelectedCase(case_)
    setIsDetailOpen(true)
  }

  const handleEditCase = (case_: Case) => {
    setSelectedCase(case_)
    setIsWizardOpen(true)
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
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

        <Card>
          <CardHeader>
            <Tabs defaultValue="matters" className="w-full">
              <TabsList>
                <TabsTrigger value="matters">
                  Expedientes ({filteredCases.length})
                </TabsTrigger>
                <TabsTrigger value="stages">
                  Etapas
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="matters">
                <CaseTable
                  cases={filteredCases}
                  onViewCase={handleViewCase}
                  onEditCase={handleEditCase}
                  selectedCases={selectedCases}
                  onSelectCase={handleSelectCase}
                  onSelectAll={handleSelectAll}
                />
              </TabsContent>
              
              <TabsContent value="stages">
                <div className="text-center py-8 text-muted-foreground">
                  <p>La gestión de etapas estará disponible próximamente</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>

        <CaseDetailDialog
          case_={selectedCase}
          open={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />

        <MatterWizard
          open={isWizardOpen}
          onOpenChange={setIsWizardOpen}
          onSubmit={createCase}
          isLoading={isCreating}
          isSuccess={isCreateSuccess}
          onResetCreate={createCaseReset}
        />
      </div>
    </div>
  )
}
