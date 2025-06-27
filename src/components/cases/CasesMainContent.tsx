
import { Case } from '@/hooks/useCases'
import { MatterTemplate } from '@/hooks/useMatterTemplates'
import { CasesStats } from './CasesStats'
import { CasesBulkActions } from './CasesBulkActions'
import { CasesTabsContent } from './CasesTabsContent'
import { StandardFilters } from '@/components/layout/StandardFilters'

interface CasesMainContentProps {
  filteredCases: Case[]
  templates: MatterTemplate[]
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  practiceAreaFilter: string
  setPracticeAreaFilter: (value: string) => void
  solicitorFilter: string
  setSolicitorFilter: (value: string) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
  selectedCases: string[]
  onViewCase: (case_: Case) => void
  onEditCase: (case_: Case) => void
  onDeleteCase: (case_: Case) => void
  onArchiveCase: (case_: Case) => void
  onSelectCase: (caseId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  searchResultsWithScore?: Array<{ item: Case; score: number; highlights: any[] }>
  isSearching?: boolean
  statusOptions: Array<{ label: string; value: string }>
  practiceAreaOptions: Array<{ label: string; value: string }>
  solicitorOptions: Array<{ label: string; value: string }>
}

export function CasesMainContent({
  filteredCases,
  searchTerm,
  onSearchChange,
  statusFilter,
  setStatusFilter,
  practiceAreaFilter,
  setPracticeAreaFilter,
  solicitorFilter,
  setSolicitorFilter,
  hasActiveFilters,
  onClearFilters,
  selectedCases,
  onViewCase,
  onEditCase,
  onDeleteCase,
  onArchiveCase,
  onSelectCase,
  onSelectAll,
  searchResultsWithScore,
  isSearching,
  statusOptions,
  practiceAreaOptions,
  solicitorOptions
}: CasesMainContentProps) {
  const handleSelectAllWrapper = (selected: boolean) => {
    if (selected) {
      // Set all filtered cases as selected
      filteredCases.forEach(c => onSelectCase(c.id, true))
    } else {
      onSelectAll(selected)
    }
  }

  return (
    <>
      <CasesStats cases={filteredCases} />

      <StandardFilters
        searchPlaceholder="Buscar expedientes..."
        searchValue={searchTerm}
        onSearchChange={onSearchChange}
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
        onClearFilters={onClearFilters}
      />

      <CasesBulkActions selectedCases={selectedCases} />

      <CasesTabsContent
        filteredCases={filteredCases}
        onViewCase={onViewCase}
        onEditCase={onEditCase}
        onDeleteCase={onDeleteCase}
        onArchiveCase={onArchiveCase}
        selectedCases={selectedCases}
        onSelectCase={onSelectCase}
        onSelectAll={handleSelectAllWrapper}
        searchResultsWithScore={searchResultsWithScore}
        searchTerm={searchTerm}
        isSearching={isSearching}
      />
    </>
  )
}
