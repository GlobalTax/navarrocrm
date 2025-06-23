
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
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'inactivo':
      return 'bg-slate-50 text-slate-600 border-slate-200'
    case 'prospecto':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'bloqueado':
      return 'bg-red-50 text-red-700 border-red-200'
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200'
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      </StandardPageContainer>
    )
  }

  if (error || !client) {
    return (
      <StandardPageContainer>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-slate-900 mb-2">Cliente no encontrado</h3>
          <p className="text-slate-600 mb-4">El cliente que buscas no existe o no tienes permisos para verlo.</p>
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
      {/* Header Executive Style */}
      <div className="border-b border-slate-200 pb-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/contacts')}
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div className="border-l border-slate-200 pl-4">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-medium text-slate-900">{client.name}</h1>
                <Badge className={`${getStatusColor(client.status || '')} font-medium border`}>
                  {getStatusLabel(client.status || '')}
                </Badge>
              </div>
              {client.business_sector && (
                <p className="text-slate-600">{client.business_sector}</p>
              )}
            </div>
          </div>
          
          <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50">
            <Edit className="h-4 w-4 mr-2" />
            Editar Cliente
          </Button>
        </div>
      </div>

      {/* Professional Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-slate-50 border border-slate-200">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600">
            Resumen
          </TabsTrigger>
          <TabsTrigger value="services" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600">
            Servicios
          </TabsTrigger>
          <TabsTrigger value="communications" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600">
            Comunicaciones
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600">
            Documentos
          </TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="cases" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600">
            Casos ({cases.length})
          </TabsTrigger>
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
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-600 mb-4">No hay casos registrados para este cliente</p>
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800">
                Crear primer caso
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {cases.map((case_) => (
                <div key={case_.id} className="border border-slate-200 rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-900">{case_.title}</h4>
                      <p className="text-sm text-slate-500">
                        Creado el {new Date(case_.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(case_.status)} font-medium border`}>
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
