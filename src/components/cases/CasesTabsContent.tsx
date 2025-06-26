
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardHeader } from '@/components/ui/card'
import { CaseTable } from './CaseTable'
import { Case } from '@/hooks/useCases'

interface CasesTabsContentProps {
  filteredCases: Case[]
  onViewCase: (case_: Case) => void
  onEditCase: (case_: Case) => void
  onDeleteCase: (case_: Case) => void
  onArchiveCase: (case_: Case) => void
  selectedCases: string[]
  onSelectCase: (caseId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  searchResultsWithScore?: Array<{ item: Case; score: number; highlights: any[] }>
  searchTerm?: string
  isSearching?: boolean
}

export function CasesTabsContent({
  filteredCases,
  onViewCase,
  onEditCase,
  onDeleteCase,
  onArchiveCase,
  selectedCases,
  onSelectCase,
  onSelectAll,
  searchResultsWithScore,
  searchTerm,
  isSearching
}: CasesTabsContentProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <Tabs defaultValue="matters" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="matters" className="flex items-center gap-2">
              Expedientes
              <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                {filteredCases.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="stages">
              Etapas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="matters" className="mt-4">
            <CaseTable
              cases={filteredCases}
              onViewCase={onViewCase}
              onEditCase={onEditCase}
              onDeleteCase={onDeleteCase}
              onArchiveCase={onArchiveCase}
              selectedCases={selectedCases}
              onSelectCase={onSelectCase}
              onSelectAll={onSelectAll}
              searchResultsWithScore={searchResultsWithScore}
              searchTerm={searchTerm}
            />
          </TabsContent>
          
          <TabsContent value="stages" className="mt-4">
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-lg font-medium mb-2">Gestión de Etapas</div>
              <p className="text-sm">Esta funcionalidad estará disponible próximamente</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  )
}
