import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Edit, Archive, MoreHorizontal, Send, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { DetailPageHeader } from '@/components/layout/DetailPageHeader'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { Proposal } from '@/types/proposals'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'
import { useProposals } from '@/hooks/useProposals'
import { ProposalPricingTab } from '@/components/proposals/ProposalPricingTab'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-muted/50 text-muted-foreground border-border'
    case 'sent':
      return 'bg-chart-1/10 text-chart-1 border-chart-1/20'
    case 'negotiating':
      return 'bg-chart-4/10 text-chart-4 border-chart-4/20'
    case 'won':
      return 'bg-chart-2/10 text-chart-2 border-chart-2/20'
    case 'lost':
      return 'bg-destructive/10 text-destructive border-destructive/20'
    case 'expired':
      return 'bg-chart-3/10 text-chart-3 border-chart-3/20'
    default:
      return 'bg-muted/50 text-muted-foreground border-border'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'draft':
      return 'Borrador'
    case 'sent':
      return 'Enviada'
    case 'negotiating':
      return 'Negociando'
    case 'won':
      return 'Ganada'
    case 'lost':
      return 'Perdida'
    case 'expired':
      return 'Expirada'
    default:
      return status
  }
}

export default function ProposalDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useApp()
  const { updateProposalStatus: updateStatus, isUpdating } = useProposals()

  // Fetch proposal data
  const { data: proposal, isLoading: proposalLoading, error: proposalError, refetch } = useQuery({
    queryKey: ['proposal', id],
    queryFn: async (): Promise<Proposal> => {
      if (!id || !user?.org_id) throw new Error('Missing ID or org_id')
      
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          client:contacts(
            id,
            name,
            email,
            phone
          )
        `)
        .eq('id', id)
        .eq('org_id', user.org_id)
        .maybeSingle()

      if (error) throw error
      return data as any
    },
    enabled: !!id && !!user?.org_id,
  })

  const handleEdit = () => {
    // TODO: Implementar edición de propuesta
    console.log('Editar propuesta:', proposal?.id)
  }

  const handleSend = () => {
    if (!proposal?.id) return
    updateStatus.mutate({ id: proposal.id, status: 'sent' })
  }

  const handleAccept = () => {
    if (!proposal?.id) return
    updateStatus.mutate({ id: proposal.id, status: 'won' })
  }

  const handleReject = () => {
    if (!proposal?.id) return
    updateStatus.mutate({ id: proposal.id, status: 'lost' })
  }

  const handleArchive = () => {
    if (!proposal?.id) return
    updateStatus.mutate({ id: proposal.id, status: 'archived' })
  }

  if (proposalLoading) {
    return (
      <StandardPageContainer>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </StandardPageContainer>
    )
  }

  if (proposalError || !proposal) {
    return (
      <StandardPageContainer>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Propuesta no encontrada</h2>
          <p className="text-gray-600 mb-4">La propuesta que buscas no existe o no tienes permisos para verla.</p>
          <Button onClick={() => navigate('/proposals')}>
            Volver a Propuestas
          </Button>
        </div>
      </StandardPageContainer>
    )
  }

  const breadcrumbItems = [
    { label: 'Propuestas', href: '/proposals' },
    { label: proposal.title }
  ]

  const subtitle = `Creada el ${new Date(proposal.created_at).toLocaleDateString('es-ES')}${proposal.proposal_number ? ` • ${proposal.proposal_number}` : ''}`

    return (
      <div className="min-h-screen bg-background">
        <DetailPageHeader
        title={proposal.title}
        subtitle={subtitle}
        breadcrumbItems={breadcrumbItems}
        backUrl="/proposals"
      >
        <Badge variant="outline" className={getStatusColor(proposal.status)}>
          {getStatusLabel(proposal.status)}
        </Badge>
        
        {proposal.status === 'draft' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSend}
            disabled={isUpdating}
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar
          </Button>
        )}
        
        {proposal.status === 'sent' && (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAccept}
              disabled={isUpdating}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Aceptar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReject}
              disabled={isUpdating}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rechazar
            </Button>
          </>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleEdit}
          disabled={isUpdating}
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={handleArchive}
              disabled={isUpdating}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archivar Propuesta
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Eliminar Propuesta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DetailPageHeader>

      <div className="max-w-7xl mx-auto p-6">
        <StandardPageContainer>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="pricing">Precios</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              <TabsContent value="overview" className="space-y-6">
                {/* Información básica de la propuesta */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="bg-card p-6 rounded-lg border shadow-sm">
                      <h3 className="text-lg font-semibold mb-4 text-card-foreground">Información de la Propuesta</h3>
                      <div className="space-y-4">
                        <div>
                          <span className="font-medium text-muted-foreground">Título:</span>
                          <span className="ml-2 text-card-foreground">{proposal.title}</span>
                        </div>
                        {proposal.description && (
                          <div>
                            <span className="font-medium text-muted-foreground">Descripción:</span>
                            <p className="mt-1 text-card-foreground">{proposal.description}</p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-muted-foreground">Tipo:</span>
                          <span className="ml-2 text-card-foreground">{proposal.proposal_type}</span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Importe total:</span>
                          <span className="ml-2 font-semibold text-card-foreground">€{proposal.total_amount.toLocaleString()}</span>
                        </div>
                        {proposal.valid_until && (
                          <div>
                            <span className="font-medium text-muted-foreground">Válida hasta:</span>
                            <span className="ml-2 text-card-foreground">{new Date(proposal.valid_until).toLocaleDateString('es-ES')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="bg-card p-6 rounded-lg border shadow-sm">
                      <h3 className="text-lg font-semibold mb-4 text-card-foreground">Cliente</h3>
                      {proposal.client ? (
                        <div className="space-y-2">
                          <div className="font-medium text-card-foreground">{proposal.client.name}</div>
                          {proposal.client.email && (
                            <div className="text-sm text-muted-foreground">{proposal.client.email}</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-muted-foreground">Sin cliente asignado</div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-6">
                {/* Información completa de la propuesta */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Información básica expandida */}
                  <div className="bg-card p-6 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-card-foreground">Información General</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium text-muted-foreground">Número:</span>
                        <span className="col-span-2 text-card-foreground">{proposal.proposal_number || 'No asignado'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium text-muted-foreground">Tipo:</span>
                        <span className="col-span-2 text-card-foreground">{proposal.proposal_type}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium text-muted-foreground">Estado:</span>
                        <span className="col-span-2">
                          <Badge variant="outline" className={getStatusColor(proposal.status)}>
                            {getStatusLabel(proposal.status)}
                          </Badge>
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium text-muted-foreground">Moneda:</span>
                        <span className="col-span-2 text-card-foreground">{proposal.currency || 'EUR'}</span>
                      </div>
                      {proposal.introduction && (
                        <div>
                          <span className="font-medium text-muted-foreground block mb-2">Introducción:</span>
                          <p className="text-sm text-card-foreground bg-muted/50 p-3 rounded">{proposal.introduction}</p>
                        </div>
                      )}
                      {proposal.scope_of_work && (
                        <div>
                          <span className="font-medium text-muted-foreground block mb-2">Alcance del trabajo:</span>
                          <p className="text-sm text-card-foreground bg-muted/50 p-3 rounded">{proposal.scope_of_work}</p>
                        </div>
                      )}
                      {proposal.timeline && (
                        <div>
                          <span className="font-medium text-muted-foreground block mb-2">Cronograma:</span>
                          <p className="text-sm text-card-foreground bg-muted/50 p-3 rounded">{proposal.timeline}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Configuración recurrente si aplica */}
                  {proposal.is_recurring && (
                    <div className="bg-card p-6 rounded-lg border shadow-sm">
                      <h3 className="text-lg font-semibold mb-4 text-card-foreground">Configuración Recurrente</h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium text-muted-foreground">Frecuencia:</span>
                          <span className="col-span-2 text-card-foreground">
                            {proposal.recurring_frequency === 'monthly' && 'Mensual'}
                            {proposal.recurring_frequency === 'quarterly' && 'Trimestral'}
                            {proposal.recurring_frequency === 'yearly' && 'Anual'}
                          </span>
                        </div>
                        {proposal.billing_day && (
                          <div className="grid grid-cols-3 gap-2">
                            <span className="font-medium text-muted-foreground">Día facturación:</span>
                            <span className="col-span-2 text-card-foreground">{proposal.billing_day}</span>
                          </div>
                        )}
                        {proposal.contract_start_date && (
                          <div className="grid grid-cols-3 gap-2">
                            <span className="font-medium text-muted-foreground">Inicio contrato:</span>
                            <span className="col-span-2 text-card-foreground">
                              {new Date(proposal.contract_start_date).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        )}
                        {proposal.contract_end_date && (
                          <div className="grid grid-cols-3 gap-2">
                            <span className="font-medium text-muted-foreground">Fin contrato:</span>
                            <span className="col-span-2 text-card-foreground">
                              {new Date(proposal.contract_end_date).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        )}
                        {proposal.retainer_amount > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            <span className="font-medium text-muted-foreground">Retainer:</span>
                            <span className="col-span-2 text-card-foreground font-semibold">
                              €{proposal.retainer_amount.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {proposal.included_hours > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            <span className="font-medium text-muted-foreground">Horas incluidas:</span>
                            <span className="col-span-2 text-card-foreground">{proposal.included_hours}h</span>
                          </div>
                        )}
                        {proposal.hourly_rate_extra > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            <span className="font-medium text-muted-foreground">Tarifa extra/hora:</span>
                            <span className="col-span-2 text-card-foreground">€{proposal.hourly_rate_extra}</span>
                          </div>
                        )}
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium text-muted-foreground">Auto-renovación:</span>
                          <span className="col-span-2 text-card-foreground">{proposal.auto_renewal ? 'Sí' : 'No'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Términos y notas */}
                  <div className="bg-card p-6 rounded-lg border shadow-sm lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4 text-card-foreground">Términos y Notas</h3>
                    <div className="space-y-3">
                      {proposal.notes && (
                        <div>
                          <span className="font-medium text-muted-foreground block mb-2">Notas internas:</span>
                          <p className="text-sm text-card-foreground bg-muted/50 p-3 rounded">{proposal.notes}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium text-muted-foreground">Validez:</span>
                          <span className="col-span-2 text-card-foreground">
                            {proposal.valid_until ? 
                              `${Math.ceil((new Date(proposal.valid_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días` :
                              'Sin límite'
                            }
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium text-muted-foreground">Creado por:</span>
                          <span className="col-span-2 text-card-foreground">{proposal.created_by}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="pricing" className="space-y-6">
                {/* Consultar line items */}
                <ProposalPricingTab proposalId={proposal.id} totalAmount={proposal.total_amount} currency={proposal.currency} />
              </TabsContent>
              
              <TabsContent value="documents">
                <div className="bg-card p-12 rounded-lg border shadow-sm text-center">
                  <div className="text-lg font-medium mb-2 text-card-foreground">Documentos</div>
                  <p className="text-sm text-muted-foreground">Esta funcionalidad estará disponible próximamente</p>
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="bg-card p-12 rounded-lg border shadow-sm text-center">
                  <div className="text-lg font-medium mb-2 text-card-foreground">Historial de Cambios</div>
                  <p className="text-sm text-muted-foreground">Esta funcionalidad estará disponible próximamente</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </StandardPageContainer>
      </div>
    </div>
  )
}