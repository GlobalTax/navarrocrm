import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useProposalsList } from '../hooks'
import { AllProposalsTable } from './AllProposalsTable'
import { ProposalsFiltersSection as ProposalsFilters } from './ProposalsFilters'
import { ProposalEmptyState } from './ProposalEmptyState'
import { useState } from 'react'

interface ProposalsListProps {
  onCreateProposal: () => void
  onEditProposal: (proposal: any) => void
  onViewProposal: (proposal: any) => void
  onStatusChange: (id: string, status: any) => void
}

export const ProposalsList = ({ 
  onCreateProposal, 
  onEditProposal, 
  onViewProposal,
  onStatusChange
}: ProposalsListProps) => {
  const { proposals, isLoading, error, refetch } = useProposalsList()
  const [filters, setFilters] = useState({ search: '', status: 'all', type: 'all' })

  const handleRefresh = () => {
    refetch()
  }

  const hasActiveFilters = Boolean(
    filters.search || filters.status !== 'all' || filters.type !== 'all'
  )

  const handleClearFilters = () => {
    setFilters({ search: '', status: 'all', type: 'all' })
  }

  return (
    <Card>
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Propuestas</CardTitle>
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
          <ProposalsFilters
            filters={filters}
            setFilters={setFilters}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Cargando propuestas...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-600 mb-2">Error al cargar propuestas</div>
              <Button variant="outline" onClick={handleRefresh}>
                Reintentar
              </Button>
            </div>
          </div>
        ) : proposals.length === 0 ? (
          <ProposalEmptyState 
            hasFilters={hasActiveFilters}
            onCreateProposal={onCreateProposal}
          />
        ) : (
          <div className="p-6">
            <AllProposalsTable
              proposals={proposals}
              onStatusChange={onStatusChange}
              onViewProposal={onViewProposal}
              onEditProposal={onEditProposal}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}