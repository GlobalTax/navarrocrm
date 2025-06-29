import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Edit, Mail, Phone, Building, User, MapPin, Calendar, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { Contact } from '@/hooks/useContacts'
import { Case } from '@/hooks/useCases'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'

// Definir el tipo de caso simplificado para esta página
interface CaseForContact {
  id: string
  title: string
  description: string | null
  status: 'open' | 'on_hold' | 'closed'
  practice_area: string | null
  created_at: string
  contact?: {
    id: string
    name: string
    email: string | null
  }
}

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useApp()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Fetch contact data
  const { data: contact, isLoading: contactLoading, error: contactError } = useQuery({
    queryKey: ['contact', id],
    queryFn: async (): Promise<Contact> => {
      if (!id || !user?.org_id) throw new Error('Missing ID or org_id')
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .eq('org_id', user.org_id)
        .single()

      if (error) throw error
      return data as Contact
    },
    enabled: !!id && !!user?.org_id,
  })

  // Fetch related cases
  const { data: relatedCases = [], isLoading: casesLoading } = useQuery({
    queryKey: ['contact-cases', id],
    queryFn: async (): Promise<CaseForContact[]> => {
      if (!id || !user?.org_id) return []
      
      const { data, error } = await supabase
        .from('cases')
        .select(`
          id,
          title,
          description,
          status,
          practice_area,
          created_at,
          contact:contacts(id, name, email)
        `)
        .eq('contact_id', id)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as CaseForContact[]
    },
    enabled: !!id && !!user?.org_id,
  })

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'activo': return 'bg-green-100 text-green-800 border-green-200'
      case 'inactivo': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'prospecto': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'bloqueado': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRelationshipTypeColor = (type: string) => {
    switch (type) {
      case 'cliente': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'prospecto': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'ex_cliente': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getClientTypeIcon = (type: string | null) => {
    switch (type) {
      case 'empresa': return <Building className="h-4 w-4" />
      case 'particular':
      case 'autonomo': return <User className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (contactLoading) {
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

  if (contactError || !contact) {
    return (
      <StandardPageContainer>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Contacto no encontrado</h2>
          <p className="text-gray-600 mb-4">El contacto que buscas no existe o no tienes permisos para verlo.</p>
          <Button onClick={() => navigate('/contacts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Contactos
          </Button>
        </div>
      </StandardPageContainer>
    )
  }

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title={contact.name}
        description={`Detalle completo del contacto`}
        badges={[
          {
            label: contact.relationship_type?.replace('_', ' ') || 'Sin definir',
            variant: 'outline',
            color: getRelationshipTypeColor(contact.relationship_type || '')
          },
          {
            label: contact.status || 'Sin estado',
            variant: 'outline', 
            color: getStatusColor(contact.status)
          }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/contacts')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <Button onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-lg">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="cases">Casos</TabsTrigger>
          <TabsTrigger value="communications">Comunicaciones</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información principal */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{contact.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getClientTypeIcon(contact.client_type)}
                        <span className="text-sm text-gray-600 capitalize">
                          {contact.client_type || 'No especificado'}
                        </span>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contact.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{contact.phone}</span>
                      </div>
                    )}
                    {(contact.address_street || contact.address_city) && (
                      <div className="flex items-start gap-2 md:col-span-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div className="text-sm">
                          {contact.address_street && <div>{contact.address_street}</div>}
                          {contact.address_city && (
                            <div>
                              {contact.address_city}
                              {contact.address_postal_code && `, ${contact.address_postal_code}`}
                              {contact.address_country && `, ${contact.address_country}`}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {contact.business_sector && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Sector Empresarial</h4>
                      <p className="text-sm">{contact.business_sector}</p>
                    </div>
                  )}

                  {contact.tags && contact.tags.length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        Etiquetas
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Información adicional */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información Adicional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">DNI/NIF:</span>
                    <p className="text-sm mt-1">{contact.dni_nif || 'No especificado'}</p>
                  </div>
                  
                  {contact.hourly_rate && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Tarifa por hora:</span>
                      <p className="text-sm mt-1 font-semibold text-green-600">
                        €{contact.hourly_rate}/hora
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-sm font-medium text-gray-700">Método de pago:</span>
                    <p className="text-sm mt-1 capitalize">
                      {contact.payment_method || 'No especificado'}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-700">Idioma preferido:</span>
                    <p className="text-sm mt-1">
                      {contact.preferred_language === 'es' ? 'Español' : 
                       contact.preferred_language === 'en' ? 'Inglés' : 
                       contact.preferred_language || 'No especificado'}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-700">Creado:</span>
                    <p className="text-sm mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(contact.created_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {contact.internal_notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notas Internas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {contact.internal_notes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cases" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Casos Relacionados</CardTitle>
              <CardDescription>
                Expedientes asociados a este contacto
              </CardDescription>
            </CardHeader>
            <CardContent>
              {casesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : relatedCases.length > 0 ? (
                <div className="space-y-3">
                  {relatedCases.map((case_) => (
                    <div
                      key={case_.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/case/${case_.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{case_.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {case_.practice_area} • {formatDate(case_.created_at)}
                          </p>
                        </div>
                        <Badge 
                          variant="outline"
                          className={
                            case_.status === 'open' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            case_.status === 'closed' ? 'bg-green-50 text-green-700 border-green-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }
                        >
                          {case_.status === 'open' ? 'Abierto' :
                           case_.status === 'closed' ? 'Cerrado' : 'En Espera'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay casos asociados a este contacto</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications">
          <Card>
            <CardHeader>
              <CardTitle>Comunicaciones</CardTitle>
              <CardDescription>
                Historial de comunicaciones con este contacto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>Funcionalidad de comunicaciones en desarrollo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>
                Documentos asociados a este contacto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>Gestión de documentos en desarrollo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>
                Cronología de actividades y eventos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>Timeline de actividades en desarrollo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </StandardPageContainer>
  )
}
