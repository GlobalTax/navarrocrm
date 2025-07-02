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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    case 'sent':
      return 'bg-blue-100 text-blue-800'
    case 'negotiating':
      return 'bg-yellow-100 text-yellow-800'
    case 'won':
      return 'bg-green-100 text-green-800'
    case 'lost':
      return 'bg-red-100 text-red-800'
    case 'expired':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
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
    <div className="min-h-screen bg-gray-50">
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
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <h3 className="text-lg font-semibold mb-4">Información de la Propuesta</h3>
                      <div className="space-y-4">
                        <div>
                          <span className="font-medium text-gray-700">Título:</span>
                          <span className="ml-2">{proposal.title}</span>
                        </div>
                        {proposal.description && (
                          <div>
                            <span className="font-medium text-gray-700">Descripción:</span>
                            <p className="mt-1 text-gray-600">{proposal.description}</p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-700">Tipo:</span>
                          <span className="ml-2">{proposal.proposal_type}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Importe total:</span>
                          <span className="ml-2 font-semibold">€{proposal.total_amount.toLocaleString()}</span>
                        </div>
                        {proposal.valid_until && (
                          <div>
                            <span className="font-medium text-gray-700">Válida hasta:</span>
                            <span className="ml-2">{new Date(proposal.valid_until).toLocaleDateString('es-ES')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <h3 className="text-lg font-semibold mb-4">Cliente</h3>
                      {proposal.client ? (
                        <div className="space-y-2">
                          <div className="font-medium">{proposal.client.name}</div>
                          {proposal.client.email && (
                            <div className="text-sm text-gray-600">{proposal.client.email}</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-500">Sin cliente asignado</div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="details">
                <div className="bg-white p-12 rounded-lg border shadow-sm text-center">
                  <div className="text-lg font-medium mb-2">Detalles de la Propuesta</div>
                  <p className="text-sm text-gray-600">Esta funcionalidad estará disponible próximamente</p>
                </div>
              </TabsContent>
              
              <TabsContent value="pricing">
                <div className="bg-white p-12 rounded-lg border shadow-sm text-center">
                  <div className="text-lg font-medium mb-2">Estructura de Precios</div>
                  <p className="text-sm text-gray-600">Esta funcionalidad estará disponible próximamente</p>
                </div>
              </TabsContent>
              
              <TabsContent value="documents">
                <div className="bg-white p-12 rounded-lg border shadow-sm text-center">
                  <div className="text-lg font-medium mb-2">Documentos</div>
                  <p className="text-sm text-gray-600">Esta funcionalidad estará disponible próximamente</p>
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="bg-white p-12 rounded-lg border shadow-sm text-center">
                  <div className="text-lg font-medium mb-2">Historial de Cambios</div>
                  <p className="text-sm text-gray-600">Esta funcionalidad estará disponible próximamente</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </StandardPageContainer>
      </div>
    </div>
  )
}