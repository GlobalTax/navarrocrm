
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useProposals } from '@/hooks/useProposals'
import { ProposalMetrics } from '@/components/proposals/ProposalMetrics'
import { ProposalFilters } from '@/components/proposals/ProposalFilters'
import { ProposalCard } from '@/components/proposals/ProposalCard'
import { NewProposalDialog } from '@/components/proposals/NewProposalDialog'
import { Loader2 } from 'lucide-react'

export default function Proposals() {
  const { proposals, isLoading, createProposal, updateProposalStatus, isCreating } = useProposals()
  const [isNewProposalOpen, setIsNewProposalOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined
  })

  // Filtrar propuestas
  const filteredProposals = proposals.filter(proposal => {
    if (filters.status && proposal.status !== filters.status) return false
    if (filters.search && !proposal.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !proposal.client?.name.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.dateFrom && new Date(proposal.created_at) < filters.dateFrom) return false
    if (filters.dateTo && new Date(proposal.created_at) > filters.dateTo) return false
    return true
  })

  const handleStatusChange = (id: string, status: any) => {
    updateProposalStatus.mutate({ id, status })
  }

  const handleViewProposal = (proposal: any) => {
    // TODO: Implementar vista de detalles de propuesta
    console.log('Ver propuesta:', proposal)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando propuestas...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Propuestas</h1>
          <p className="text-gray-600 mt-1">Gestiona tus propuestas comerciales y seguimiento de ventas</p>
        </div>
        <Button onClick={() => setIsNewProposalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Propuesta
        </Button>
      </div>

      {/* Métricas */}
      <ProposalMetrics />

      {/* Filtros */}
      <ProposalFilters filters={filters} onFiltersChange={setFilters} />

      {/* Lista de Propuestas */}
      <div className="space-y-4">
        {filteredProposals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              {proposals.length === 0 ? 'No hay propuestas creadas aún' : 'No se encontraron propuestas con los filtros aplicados'}
            </div>
            {proposals.length === 0 && (
              <Button onClick={() => setIsNewProposalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear primera propuesta
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProposals.map(proposal => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onStatusChange={handleStatusChange}
                onView={handleViewProposal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialog para nueva propuesta */}
      <NewProposalDialog
        open={isNewProposalOpen}
        onOpenChange={setIsNewProposalOpen}
        onSubmit={createProposal.mutate}
        isCreating={isCreating}
      />
    </div>
  )
}
