
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Mail, Phone, Calendar, MapPin, User, Building, 
  FileText, Clock, Euro, TrendingUp, Languages, CreditCard
} from 'lucide-react'

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

interface ClientOverviewTabProps {
  client: Client
  cases: Case[]
}

const getContactPreferenceIcon = (preference: string) => {
  switch (preference) {
    case 'email':
      return <Mail className="h-4 w-4" />
    case 'telefono':
      return <Phone className="h-4 w-4" />
    case 'whatsapp':
      return <Phone className="h-4 w-4" />
    case 'presencial':
      return <User className="h-4 w-4" />
    default:
      return <Mail className="h-4 w-4" />
  }
}

export const ClientOverviewTab = ({ client, cases }: ClientOverviewTabProps) => {
  const hasAddress = client.address_street || client.address_city || client.address_postal_code

  return (
    <>
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
            <div className="text-2xl font-bold text-orange-600">0</div>
            <div className="text-sm text-gray-600">Notas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-sm text-gray-600">Valor Cliente</div>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
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
    </>
  )
}
