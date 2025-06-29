
import { Loader2, Repeat, FileText } from 'lucide-react'
import { useProposals } from '@/hooks/useProposals'
import { ProposalMetrics } from '@/components/proposals/ProposalMetrics'
import { useSaveProposal } from '@/modules/proposals/hooks/useSaveProposal'
import { ProposalFormData } from '@/modules/proposals/types/proposal.schema'
import { useApp } from '@/contexts/AppContext'
import { useProposalsPageState } from '@/hooks/proposals/useProposalsPageState'
import { useProposalsFilters } from '@/hooks/proposals/useProposalsFilters'
import { ProposalsBuilderManager } from '@/components/proposals/ProposalsBuilderManager'
import { ProposalsTabsView } from '@/components/proposals/ProposalsTabsView'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { StandardFilters } from '@/components/layout/StandardFilters'
import { TestContactsButton } from '@/components/proposals/TestContactsButton'
import { useClients } from '@/hooks/useClients'

export default function Proposals() {
  console.log('Proposals page rendering')
  
  const { proposals, isLoading, createProposal, updateProposalStatus, isCreating } = useProposals()
  const { mutate: saveRecurrentProposal, isPending: isSavingRecurrent } = useSaveProposal()
  const { user } = useApp()
  const { clients } = useClients()
  
  // Estados de la página
  const pageState = useProposalsPageState()
  const { filters, setFilters, filterProposals, categorizeProposals, getProposalMetrics } = useProposalsFilters()

  console.log('Current state:', { 
    isRecurrentBuilderOpen: pageState.isRecurrentBuilderOpen, 
    isSpecificBuilderOpen: pageState.isSpecificBuilderOpen, 
    isLoading, 
    user,
    clientsCount: clients.length
  })

  // Filtrar y categorizar propuestas
  const filteredProposals = filterProposals(proposals)
  const categorizedProposals = categorizeProposals(filteredProposals)
  const metrics = getProposalMetrics(filteredProposals)

  // Handlers
  const handleStatusChange = (id: string, status: any) => {
    updateProposalStatus.mutate({ id, status })
  }

  const handleViewProposal = (proposal: any) => {
    console.log('Ver propuesta:', proposal)
  }

  const handleSaveRecurrentProposal = (data: ProposalFormData) => {
    console.log('Handling save recurrent proposal:', data)
    if (!user || !user.org_id) {
      console.error("User or org_id is not available. Cannot save proposal.")
      return
    }
    
    // Crear datos de propuesta recurrente con las propiedades correctas
    const recurrentProposalData: ProposalFormData = {
      ...data,
      is_recurring: true,
      recurring_frequency: data.recurring_frequency || 'monthly',
    }
    
    saveRecurrentProposal({
      proposalData: recurrentProposalData,
      orgId: user.org_id,
      userId: user.id,
    })
    pageState.closeRecurrentBuilder()
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

  // Mostrar builders si están activos
  const showingBuilder = pageState.isRecurrentBuilderOpen || pageState.isSpecificBuilderOpen
  if (showingBuilder) {
    return (
      <ProposalsBuilderManager
        isRecurrentBuilderOpen={pageState.isRecurrentBuilderOpen}
        isSpecificBuilderOpen={pageState.isSpecificBuilderOpen}
        onCloseRecurrentBuilder={pageState.closeRecurrentBuilder}
        onCloseSpecificBuilder={pageState.closeSpecificBuilder}
        onSaveRecurrentProposal={handleSaveRecurrentProposal}
        isSavingRecurrent={isSavingRecurrent}
      />
    )
  }

  const statusOptions = [
    { label: 'Todos los estados', value: 'all' },
    { label: 'Borrador', value: 'draft' },
    { label: 'Enviada', value: 'sent' },
    { label: 'Negociando', value: 'negotiating' },
    { label: 'Ganada', value: 'won' },
    { label: 'Perdida', value: 'lost' },
    { label: 'Expirada', value: 'expired' }
  ]

  const typeOptions = [
    { label: 'Todos los tipos', value: 'all' },
    { label: 'Recurrentes', value: 'recurring' },
    { label: 'Puntuales', value: 'oneTime' }
  ]

  const hasActiveFilters = Boolean(
    (filters.status && filters.status !== 'all') || 
    filters.search || 
    filters.type !== 'all'
  )

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      search: '',
      dateFrom: undefined,
      dateTo: undefined,
      type: 'all'
    })
  }

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Propuestas Comerciales"
        description="Gestiona propuestas recurrentes y servicios puntuales"
        badges={[
          {
            label: 'Recurrentes: Fiscal, Contabilidad, Laboral',
            variant: 'outline',
            color: 'text-blue-600 border-blue-200 bg-blue-50'
          },
          {
            label: 'Puntuales: Proyectos específicos',
            variant: 'outline',
            color: 'text-green-600 border-green-200 bg-green-50'
          }
        ]}
        secondaryAction={{
          label: 'Propuesta Recurrente',
          onClick: pageState.openRecurrentBuilder,
          variant: 'outline'
        }}
        primaryAction={{
          label: 'Propuesta Puntual',
          onClick: pageState.openSpecificBuilder
        }}
      />

      {/* Mostrar botón de crear contactos si no hay clientes */}
      {clients.length === 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-yellow-800">No hay clientes disponibles</h3>
              <p className="text-sm text-yellow-700">
                Para crear propuestas necesitas tener al menos un cliente. Puedes crear algunos contactos de prueba o ir a la página de Contactos.
              </p>
            </div>
            <TestContactsButton />
          </div>
        </div>
      )}

      <ProposalMetrics />

      <StandardFilters
        searchPlaceholder="Buscar propuestas..."
        searchValue={filters.search}
        onSearchChange={(value) => setFilters({ ...filters, search: value })}
        filters={[
          {
            placeholder: 'Estado',
            value: filters.status,
            onChange: (value) => setFilters({ ...filters, status: value }),
            options: statusOptions
          },
          {
            placeholder: 'Tipo',
            value: filters.type,
            onChange: (value) => setFilters({ ...filters, type: value }),
            options: typeOptions
          }
        ]}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      <ProposalsTabsView
        proposals={categorizedProposals}
        onStatusChange={handleStatusChange}
        onViewProposal={handleViewProposal}
        onOpenRecurrentBuilder={pageState.openRecurrentBuilder}
        onOpenSpecificBuilder={pageState.openSpecificBuilder}
      />
    </StandardPageContainer>
  )
}
