
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Edit } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { ClientOverviewTab } from '@/components/clients/ClientOverviewTab'
import { ClientServicesSection } from '@/components/clients/ClientServicesSection'
import { ClientCommunicationsSection } from '@/components/clients/ClientCommunicationsSection'
import { ClientDocumentsSection } from '@/components/clients/ClientDocumentsSection'
import { ClientTimelineSection } from '@/components/clients/ClientTimelineSection'

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  created_at: string
  dni_nif: string | null
  address_street: string | null
  address_city: string | null
  address_postal_code: string | null
  address_country: string | null
  legal_representative: string | null
  client_type: string | null
  business_sector: string | null
  how_found_us: string | null
  contact_preference: string | null
  preferred_language: string | null
  hourly_rate: number | null
  payment_method: string | null
  status: string | null
  tags: string[] | null
  internal_notes: string | null
  last_contact_date: string | null
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'activo':
      return 'bg-green-100 text-green-800'
    case 'inactivo':
      return 'bg-gray-100 text-gray-800'
    case 'prospecto':
      return 'bg-blue-100 text-blue-800'
    case 'bloqueado':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'activo':
      return 'Activo'
    case 'inactivo':
      return 'Inactivo'
    case 'prospecto':
      return 'Prospecto'
    case 'bloqueado':
      return 'Bloqueado'
    default:
      return status
  }
}

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useApp()

  const { data: client, isLoading, error } = useQuery({
    queryKey: ['client-detail', id],
    queryFn: async () => {
      if (!id || !user?.org_id) return null

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .eq('org_id', user.org_id)
        .single()

      if (error) {
        console.error('Error fetching client:', error)
        throw error
      }

      return data as Client
    },
    enabled: !!id && !!user?.org_id
  })

  const { data: cases = [] } = useQuery({
    queryKey: ['client-cases', id],
    queryFn: async () => {
      if (!id || !user?.org_id) return []
      
      const { data, error } = await supabase
        .from('cases')
        .select('id, title, status, created_at')
        .eq('contact_id', id)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching client cases:', error)
        return []
      }
      return data || []
    },
    enabled: !!id && !!user?.org_id,
  })

  if (isLoading) {
    return (
      <StandardPageContainer>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </StandardPageContainer>
    )
  }

  if (error || !client) {
    return (
      <StandardPageContainer>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Cliente no encontrado</h3>
          <p className="text-gray-600 mb-4">El cliente que buscas no existe o no tienes permisos para verlo.</p>
          <Button onClick={() => navigate('/contacts')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Contactos
          </Button>
        </div>
      </StandardPageContainer>
    )
  }

  return (
    <StandardPageContainer>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/contacts')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
              <Badge className={getStatusColor(client.status || '')}>
                {getStatusLabel(client.status || '')}
              </Badge>
            </div>
            {client.business_sector && (
              <p className="text-gray-600 mt-1">{client.business_sector}</p>
            )}
          </div>
        </div>
        
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Editar Cliente
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
          <TabsTrigger value="communications">Comunicaciones</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="cases">Casos ({cases.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <ClientOverviewTab client={client} cases={cases} />
        </TabsContent>

        <TabsContent value="services" className="space-y-6 mt-6">
          <ClientServicesSection clientId={client.id} />
        </TabsContent>

        <TabsContent value="communications" className="space-y-6 mt-6">
          <ClientCommunicationsSection clientId={client.id} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6 mt-6">
          <ClientDocumentsSection clientId={client.id} />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6 mt-6">
          <ClientTimelineSection clientId={client.id} />
        </TabsContent>

        <TabsContent value="cases" className="space-y-4 mt-6">
          {cases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay casos registrados para este cliente</p>
              <Button className="mt-4" size="sm">
                Crear primer caso
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {cases.map((case_) => (
                <div key={case_.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{case_.title}</h4>
                      <p className="text-sm text-gray-500">
                        Creado el {new Date(case_.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(case_.status)}>
                      {getStatusLabel(case_.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </StandardPageContainer>
  )
}

export default ClientDetail
