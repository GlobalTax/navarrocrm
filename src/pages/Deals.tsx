
import { useState } from 'react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { StandardFilters } from '@/components/layout/StandardFilters'
import { DealsMetrics } from '@/components/deals/DealsMetrics'
import { DealsList } from '@/components/deals/DealsList'
import { DealsPipeline } from '@/components/deals/DealsPipeline'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProposals } from '@/hooks/useProposals'

export default function Deals() {
  const { proposals, isLoading } = useProposals()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('list')

  // Filtrar propuestas como deals
  const filteredDeals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusOptions = [
    { label: 'Todos los estados', value: 'all' },
    { label: 'Borrador', value: 'draft' },
    { label: 'Enviado', value: 'sent' },
    { label: 'Ganado', value: 'won' },
    { label: 'Perdido', value: 'lost' }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando deals...</p>
        </div>
      </div>
    )
  }

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Deals"
        description="Gestiona las oportunidades de negocio y propuestas comerciales"
        primaryAction={{
          label: 'Nueva Propuesta',
          onClick: () => console.log('Nueva propuesta')
        }}
      >
        <Button
          variant="outline"
          onClick={() => setViewMode(viewMode === 'list' ? 'pipeline' : 'list')}
        >
          {viewMode === 'list' ? 'Vista Pipeline' : 'Vista Lista'}
        </Button>
      </StandardPageHeader>

      <DealsMetrics deals={filteredDeals} />

      <StandardFilters
        searchPlaceholder="Buscar deals..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            placeholder: 'Estado',
            value: statusFilter,
            onChange: setStatusFilter,
            options: statusOptions
          }
        ]}
        hasActiveFilters={statusFilter !== 'all' || searchTerm.length > 0}
        onClearFilters={() => {
          setStatusFilter('all')
          setSearchTerm('')
        }}
      />

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'pipeline')}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-4">
          <DealsList deals={filteredDeals} />
        </TabsContent>
        
        <TabsContent value="pipeline" className="mt-4">
          <DealsPipeline deals={filteredDeals} />
        </TabsContent>
      </Tabs>
    </StandardPageContainer>
  )
}
