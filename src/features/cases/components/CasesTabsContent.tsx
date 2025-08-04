import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CaseTable } from './CaseTable'
import { CaseStagesView } from '@/components/cases/stages/CaseStagesView'
import { Case } from '@/features/cases'

interface CasesTabsContentProps {
  filteredCases: Case[]
  onView: (case_: Case) => void
  onEdit: (case_: Case) => void
  onDelete: (case_: Case) => void
  onArchive: (case_: Case) => void
  onStagesView: (case_: Case) => void
  selectedCases: string[]
  onSelectCase: (caseId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
}

export function CasesTabsContent({
  filteredCases,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onStagesView,
  selectedCases,
  onSelectCase,
  onSelectAll
}: CasesTabsContentProps) {
  const [selectedCaseForStages, setSelectedCaseForStages] = useState<Case | null>(null)

  const handleStagesView = (case_: Case) => {
    setSelectedCaseForStages(case_)
    onStagesView(case_)
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Tabs defaultValue="matters" className="w-full">
          <div className="border-b px-6 pt-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="matters">
                Expedientes ({filteredCases.length})
              </TabsTrigger>
              <TabsTrigger value="stages">
                Etapas
                {selectedCaseForStages && (
                  <span className="ml-1 text-xs">
                    - {selectedCaseForStages.title}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="matters" className="p-6 pt-4">
            <CaseTable
              cases={filteredCases}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onArchive={onArchive}
              onStagesView={handleStagesView}
              selectedCases={selectedCases}
              onSelectCase={onSelectCase}
              onSelectAll={onSelectAll}
            />
          </TabsContent>

          <TabsContent value="stages" className="p-6 pt-4">
            {selectedCaseForStages ? (
              <CaseStagesView 
                caseId={selectedCaseForStages.id}
                caseTitle={selectedCaseForStages.title}
              />
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecciona un expediente
                </h3>
                <p className="text-gray-500">
                  Selecciona un expediente desde la pestaña "Expedientes" para ver sus etapas.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}