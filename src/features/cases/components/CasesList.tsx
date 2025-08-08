import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CompactCard, CompactCardContent, CompactCardHeader, CompactCardTitle } from '@/components/ui/compact-card'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useCasesList } from '../hooks'
import { Case } from '@/hooks/useCases'
import { CasesFilters } from './CasesFilters'
import { CaseTable } from './CaseTable'
import { CaseEmptyState } from './CaseEmptyState'
import { useState } from 'react'

interface CasesListProps {
  onCreateCase: () => void
  onEditCase: (case_: Case) => void
  onViewCase: (case_: Case) => void
  onArchiveCase: (case_: Case) => void
  onDeleteCase: (case_: Case) => void
}

export const CasesList = ({ 
  onCreateCase, 
  onEditCase, 
  onViewCase, 
  onArchiveCase, 
  onDeleteCase 
}: CasesListProps) => {
  const [selectedCases, setSelectedCases] = useState<string[]>([])
  const { cases, isLoading, error, refetch } = useCasesList()

  const handleRefresh = () => {
    refetch()
  }

  const handleSelectCase = (caseId: string, selected: boolean) => {
    setSelectedCases(prev => 
      selected 
        ? [...prev, caseId]
        : prev.filter(id => id !== caseId)
    )
  }

  const handleSelectAll = (selected: boolean) => {
    setSelectedCases(selected ? cases.map(c => c.id) : [])
  }

  const hasFilters = false // TODO: Implement filters

  return (
    <Card>
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Expedientes</CardTitle>
          <div className="flex items-center gap-2">
            {error && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            )}
          </div>
        </div>
        
        <div className="pt-4">
          <CasesFilters
            searchTerm=""
            setSearchTerm={() => {}}
            statusFilter="all"
            setStatusFilter={() => {}}
            practiceAreaFilter="all"
            setPracticeAreaFilter={() => {}}
            solicitorFilter="all"
            setSolicitorFilter={() => {}}
            practiceAreas={[]}
            users={[]}
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Cargando expedientes...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-600 mb-2">Error al cargar expedientes</div>
              <Button variant="outline" onClick={handleRefresh}>
                Reintentar
              </Button>
            </div>
          </div>
        ) : cases.length === 0 ? (
          <CaseEmptyState 
            hasFilters={hasFilters}
            onCreateCase={onCreateCase}
          />
        ) : (
          <div className="p-6">
            <CaseTable
              cases={cases}
              onViewCase={onViewCase}
              onEditCase={onEditCase}
              onDeleteCase={onDeleteCase}
              onArchiveCase={onArchiveCase}
              selectedCases={selectedCases}
              onSelectCase={handleSelectCase}
              onSelectAll={handleSelectAll}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}