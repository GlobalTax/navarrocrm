
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Calculator } from 'lucide-react'
import { useProposals } from '@/hooks/useProposals'
import { ProposalMetrics } from '@/components/proposals/ProposalMetrics'
import { ProposalFilters } from '@/components/proposals/ProposalFilters'
import { ProposalCard } from '@/components/proposals/ProposalCard'
import { RecurringProposalForm } from '@/components/proposals/RecurringProposalForm'
import { RecurringRevenueMetrics } from '@/components/proposals/RecurringRevenueMetrics'
import { Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProposalBuilder } from '@/modules/proposals/components/ProposalBuilder'
import ProposalDemoModule from '@/components/proposals/ProposalDemoModule'
import { ProfessionalProposalBuilder } from '@/components/proposals/ProfessionalProposalBuilder'
import { useSaveProposal } from '@/modules/proposals/hooks/useSaveProposal'
import { ProposalFormData } from '@/modules/proposals/types/proposal.schema'
import { useApp } from '@/contexts/AppContext'

export default function Proposals() {
  console.log('Proposals page rendering');
  
  const { proposals, isLoading, createProposal, updateProposalStatus, isCreating } = useProposals()
  const { mutate: saveEnhancedProposal, isPending: isSavingEnhanced } = useSaveProposal()
  const { user } = useApp()
  const [isNewProposalOpen, setIsNewProposalOpen] = useState(false)
  const [showEnhancedBuilder, setShowEnhancedBuilder] = useState(false)
  const [showProfessionalBuilder, setShowProfessionalBuilder] = useState(false)
  const [showAdvancedProfessionalBuilder, setShowAdvancedProfessionalBuilder] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined
  })

  console.log('Current state:', { showEnhancedBuilder, showProfessionalBuilder, showAdvancedProfessionalBuilder, isLoading, user });

  // Filtrar propuestas
  const filteredProposals = proposals.filter(proposal => {
    if (filters.status && proposal.status !== filters.status) return false
    if (filters.search && !proposal.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !proposal.client?.name.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.dateFrom && new Date(proposal.created_at) < filters.dateFrom) return false
    if (filters.dateTo && new Date(proposal.created_at) > filters.dateTo) return false
    return true
  })

  // Separar propuestas recurrentes y puntuales
  const recurringProposals = filteredProposals.filter(p => p.is_recurring)
  const oneTimeProposals = filteredProposals.filter(p => !p.is_recurring)

  const handleStatusChange = (id: string, status: any) => {
    updateProposalStatus.mutate({ id, status })
  }

  const handleViewProposal = (proposal: any) => {
    console.log('Ver propuesta:', proposal)
  }

  const handleSaveEnhancedProposal = (data: ProposalFormData) => {
    console.log('Handling save enhanced proposal:', data);
    if (!user || !user.org_id) {
      console.error("User or org_id is not available. Cannot save proposal.");
      return;
    }
    saveEnhancedProposal({
      proposalData: data,
      orgId: user.org_id,
      userId: user.id,
    });
    setShowEnhancedBuilder(false);
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

  // Mostrar el ProposalBuilder si está activo
  if (showEnhancedBuilder) {
    console.log('Showing ProposalBuilder');
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nueva Propuesta Avanzada</h1>
            <p className="text-gray-600 mt-1">Crea propuestas comerciales con planes de precios personalizados</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              console.log('Volver a propuestas clicked');
              setShowEnhancedBuilder(false);
            }}
          >
            Volver a Propuestas
          </Button>
        </div>
        
        <ProposalBuilder
          onSave={handleSaveEnhancedProposal}
          isSaving={isSavingEnhanced}
        />
      </div>
    )
  }

  // Mostrar el ProposalDemoModule si está activo
  if (showProfessionalBuilder) {
    console.log('Showing ProposalDemoModule');
    return (
      <ProposalDemoModule
        onBack={() => setShowProfessionalBuilder(false)}
      />
    )
  }

  // Mostrar el nuevo ProfessionalProposalBuilder
  if (showAdvancedProfessionalBuilder) {
    return (
      <ProfessionalProposalBuilder
        onBack={() => setShowAdvancedProfessionalBuilder(false)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Propuestas</h1>
          <p className="text-gray-600 mt-1">Gestiona tus propuestas comerciales y contratos recurrentes</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsNewProposalOpen(true)} 
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Propuesta Rápida
          </Button>
          <Button 
            onClick={() => {
              console.log('Propuesta Avanzada clicked');
              setShowEnhancedBuilder(true);
            }}
            variant="outline"
          >
            <FileText className="h-4 w-4 mr-2" />
            Propuesta Avanzada
          </Button>
          <Button 
            onClick={() => {
              console.log('Propuesta Profesional Simple clicked');
              setShowProfessionalBuilder(true);
            }}
            variant="outline"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Propuesta Profesional
          </Button>
          <Button 
            onClick={() => {
              console.log('Propuesta Profesional Completa clicked');
              setShowAdvancedProfessionalBuilder(true);
            }}
            variant="default"
          >
            <FileText className="h-4 w-4 mr-2" />
            Propuesta Ejecutiva
          </Button>
        </div>
      </div>

      {/* Métricas de Ingresos Recurrentes */}
      <RecurringRevenueMetrics />
      <ProposalMetrics />
      <ProposalFilters filters={filters} onFiltersChange={setFilters} />

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Todas ({filteredProposals.length})</TabsTrigger>
          <TabsTrigger value="recurring">Recurrentes ({recurringProposals.length})</TabsTrigger>
          <TabsTrigger value="onetime">Puntuales ({oneTimeProposals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredProposals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                {proposals.length === 0 ? 'No hay propuestas creadas aún' : 'No se encontraron propuestas con los filtros aplicados'}
              </div>
              {proposals.length === 0 && (
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setIsNewProposalOpen(true)} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Propuesta Rápida
                  </Button>
                  <Button onClick={() => setShowEnhancedBuilder(true)} variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Propuesta Avanzada
                  </Button>
                  <Button onClick={() => setShowProfessionalBuilder(true)} variant="outline">
                    <Calculator className="h-4 w-4 mr-2" />
                    Propuesta Profesional
                  </Button>
                  <Button onClick={() => setShowAdvancedProfessionalBuilder(true)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Propuesta Ejecutiva
                  </Button>
                </div>
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
        </TabsContent>

        <TabsContent value="recurring" className="space-y-4">
          {recurringProposals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                No hay propuestas recurrentes
              </div>
              <Button onClick={() => setIsNewProposalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear propuesta recurrente
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recurringProposals.map(proposal => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  onStatusChange={handleStatusChange}
                  onView={handleViewProposal}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="onetime" className="space-y-4">
          {oneTimeProposals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                No hay propuestas puntuales
              </div>
              <Button onClick={() => setIsNewProposalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear propuesta puntual
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {oneTimeProposals.map(proposal => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  onStatusChange={handleStatusChange}
                  onView={handleViewProposal}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog para nueva propuesta */}
      <RecurringProposalForm
        open={isNewProposalOpen}
        onOpenChange={setIsNewProposalOpen}
        onSubmit={createProposal.mutate}
        isCreating={isCreating}
      />
    </div>
  )
}
