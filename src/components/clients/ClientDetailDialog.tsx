
import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Mail, Phone, Calendar, FolderOpen, Edit, MapPin, 
  User, Building, CreditCard, Languages, MessageCircle,
  FileText, Clock, Euro
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

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

interface Case {
  id: string
  title: string
  status: string
  created_at: string
}

interface ClientNote {
  id: string
  title: string
  content: string | null
  note_type: string
  created_at: string
  user_id: string
  is_private: boolean
}

interface ClientDetailDialogProps {
  client: Client | null
  open: boolean
  onClose: () => void
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

const getContactPreferenceIcon = (preference: string) => {
  switch (preference) {
    case 'email':
      return <Mail className="h-4 w-4" />
    case 'telefono':
      return <Phone className="h-4 w-4" />
    case 'whatsapp':
      return <MessageCircle className="h-4 w-4" />
    case 'presencial':
      return <User className="h-4 w-4" />
    default:
      return <Mail className="h-4 w-4" />
  }
}

export const ClientDetailDialog = ({ client, open, onClose }: ClientDetailDialogProps) => {
  const { user } = useAuth()

  const { data: cases = [] } = useQuery({
    queryKey: ['client-cases', client?.id],
    queryFn: async () => {
      if (!client?.id || !user?.org_id) return []
      
      const { data, error } = await supabase
        .from('cases')
        .select('id, title, status, created_at')
        .eq('client_id', client.id)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching client cases:', error)
        return []
      }
      return data || []
    },
    enabled: !!client?.id && !!user?.org_id,
  })

  const { data: notes = [] } = useQuery({
    queryKey: ['client-notes', client?.id],
    queryFn: async () => {
      if (!client?.id || !user?.org_id) return []
      
      const { data, error } = await supabase
        .from('client_notes')
        .select('id, title, content, note_type, created_at, user_id, is_private')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching client notes:', error)
        return []
      }
      return data || []
    },
    enabled: !!client?.id && !!user?.org_id,
  })

  if (!client) return null

  const hasAddress = client.address_street || client.address_city || client.address_postal_code

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span>Ficha 360º del Cliente</span>
              <Badge className={getStatusColor(client.status || '')}>
                {getStatusLabel(client.status || '')}
              </Badge>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="cases">Casos ({cases.length})</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Header con información principal */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">{client.name}</h2>
                    {client.client_type && (
                      <div className="flex items-center gap-2">
                        {client.client_type === 'empresa' ? 
                          <Building className="h-4 w-4 text-gray-400" /> : 
                          <User className="h-4 w-4 text-gray-400" />
                        }
                        <span className="text-sm text-gray-600 capitalize">{client.client_type}</span>
                      </div>
                    )}
                    {client.business_sector && (
                      <p className="text-sm text-gray-600">{client.business_sector}</p>
                    )}
                  </div>
                  
                  <div className="text-right space-y-2">
                    {client.hourly_rate && (
                      <div className="flex items-center gap-1">
                        <Euro className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{client.hourly_rate}€/h</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {getContactPreferenceIcon(client.contact_preference || 'email')}
                      <span className="text-sm text-gray-600 capitalize">
                        {client.contact_preference || 'Email'}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{client.email}</span>
                    </div>
                  )}
                  
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{client.phone}</span>
                    </div>
                  )}

                  {client.dni_nif && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{client.dni_nif}</span>
                    </div>
                  )}

                  {hasAddress && (
                    <div className="flex items-center gap-2 md:col-span-3">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {[client.address_street, client.address_city, client.address_postal_code, client.address_country]
                          .filter(Boolean)
                          .join(', ')
                        }
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      Cliente desde {new Date(client.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {client.last_contact_date && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        Último contacto: {new Date(client.last_contact_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {client.preferred_language && (
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-gray-400" />
                      <span className="text-sm capitalize">{client.preferred_language}</span>
                    </div>
                  )}
                </div>

                {client.tags && client.tags.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex flex-wrap gap-2">
                      {client.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{cases.length}</div>
                  <div className="text-sm text-gray-600">Casos Total</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {cases.filter(c => c.status === 'open').length}
                  </div>
                  <div className="text-sm text-gray-600">Casos Activos</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {cases.filter(c => c.status === 'closed').length}
                  </div>
                  <div className="text-sm text-gray-600">Casos Cerrados</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{notes.length}</div>
                  <div className="text-sm text-gray-600">Notas</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información Legal */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información Legal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {client.dni_nif && (
                    <div>
                      <span className="font-medium">DNI/NIF/CIF:</span>
                      <span className="ml-2">{client.dni_nif}</span>
                    </div>
                  )}
                  {client.legal_representative && (
                    <div>
                      <span className="font-medium">Representante Legal:</span>
                      <span className="ml-2">{client.legal_representative}</span>
                    </div>
                  )}
                  {hasAddress && (
                    <div>
                      <span className="font-medium">Dirección:</span>
                      <div className="ml-2 text-sm text-gray-600">
                        {client.address_street && <div>{client.address_street}</div>}
                        <div>
                          {[client.address_city, client.address_postal_code].filter(Boolean).join(', ')}
                        </div>
                        {client.address_country && <div>{client.address_country}</div>}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Información Comercial */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información Comercial</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {client.hourly_rate && (
                    <div>
                      <span className="font-medium">Tarifa por Hora:</span>
                      <span className="ml-2">{client.hourly_rate}€</span>
                    </div>
                  )}
                  {client.payment_method && (
                    <div>
                      <span className="font-medium">Método de Pago:</span>
                      <span className="ml-2 capitalize">{client.payment_method}</span>
                    </div>
                  )}
                  {client.how_found_us && (
                    <div>
                      <span className="font-medium">Cómo nos conoció:</span>
                      <span className="ml-2">{client.how_found_us}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {client.internal_notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notas Internas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {client.internal_notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cases" className="space-y-4">
            {cases.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No hay casos registrados para este cliente</p>
                <Button className="mt-4" size="sm">
                  Crear primer caso
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {cases.map((case_) => (
                  <Card key={case_.id}>
                    <CardContent className="p-4">
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            {notes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No hay actividad registrada para este cliente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <Card key={note.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{note.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {note.note_type}
                            </Badge>
                            {note.is_private && (
                              <Badge variant="secondary" className="text-xs">
                                Privada
                              </Badge>
                            )}
                          </div>
                          {note.content && (
                            <p className="text-sm text-gray-600 mb-2">{note.content}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            {new Date(note.created_at).toLocaleDateString()} a las{' '}
                            {new Date(note.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
