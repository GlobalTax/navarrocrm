
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
}

export function CasesTabsContent({
  filteredCases,
  onViewCase,
  onEditCase,
  onDeleteCase,
  onArchiveCase,
  selectedCases,
  onSelectCase,
  onSelectAll
}: CasesTabsContentProps) {
  return (
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
              onViewCase={onViewCase}
              onEditCase={onEditCase}
              onDeleteCase={onDeleteCase}
              onArchiveCase={onArchiveCase}
              selectedCases={selectedCases}
              onSelectCase={onSelectCase}
              onSelectAll={onSelectAll}
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
  )
}
