
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Mail, Phone, Calendar, MapPin, User, Building, 
  FileText, Clock, Euro, Languages, CreditCard, Activity
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
      {/* Executive Summary Card */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {client.client_type === 'empresa' ? 
                  <Building className="h-5 w-5 text-slate-400" /> : 
                  <User className="h-5 w-5 text-slate-400" />
                }
                <div>
                  <h2 className="text-xl font-medium text-slate-900">{client.name}</h2>
                  <span className="text-sm text-slate-600 capitalize">{client.client_type || 'No especificado'}</span>
                </div>
              </div>
              {client.business_sector && (
                <p className="text-slate-600 ml-8">{client.business_sector}</p>
              )}
            </div>
            
            <div className="text-right space-y-2">
              {client.hourly_rate && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Euro className="h-4 w-4 text-slate-400" />
                  <span className="font-medium">{client.hourly_rate}€/h</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                {getContactPreferenceIcon(client.contact_preference || 'email')}
                <span className="capitalize">
                  {client.contact_preference || 'Email'}
                </span>
              </div>
            </div>
          </div>

          <Separator className="mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {client.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-700">{client.email}</span>
              </div>
            )}
            
            {client.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-700">{client.phone}</span>
              </div>
            )}

            {client.dni_nif && (
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-700">{client.dni_nif}</span>
              </div>
            )}

            {hasAddress && (
              <div className="flex items-center gap-3 md:col-span-2 lg:col-span-3">
                <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-700">
                  {[client.address_street, client.address_city, client.address_postal_code, client.address_country]
                    .filter(Boolean)
                    .join(', ')
                  }
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-700">
                Cliente desde {new Date(client.created_at).toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>

            {client.last_contact_date && (
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-700">
                  Último contacto: {new Date(client.last_contact_date).toLocaleDateString('es-ES')}
                </span>
              </div>
            )}

            {client.preferred_language && (
              <div className="flex items-center gap-3">
                <Languages className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-700 capitalize">{client.preferred_language}</span>
              </div>
            )}
          </div>

          {client.tags && client.tags.length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="flex flex-wrap gap-2">
                {client.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-slate-50 text-slate-700 border-slate-300">
                    {tag}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Professional Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Casos Total</p>
                <p className="text-xl font-semibold text-slate-900">{cases.length}</p>
              </div>
              <Activity className="h-5 w-5 text-slate-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Casos Activos</p>
                <p className="text-xl font-semibold text-emerald-700">
                  {cases.filter(c => c.status === 'open').length}
                </p>
              </div>
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Casos Cerrados</p>
                <p className="text-xl font-semibold text-slate-700">
                  {cases.filter(c => c.status === 'closed').length}
                </p>
              </div>
              <div className="h-2 w-2 rounded-full bg-slate-400"></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Documentos</p>
                <p className="text-xl font-semibold text-slate-700">0</p>
              </div>
              <FileText className="h-5 w-5 text-slate-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professional Information Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Legal Information */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium text-slate-900">Información Legal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.dni_nif && (
              <div className="flex justify-between">
                <span className="text-slate-600">DNI/NIF/CIF</span>
                <span className="font-medium text-slate-900">{client.dni_nif}</span>
              </div>
            )}
            {client.legal_representative && (
              <div className="flex justify-between">
                <span className="text-slate-600">Representante Legal</span>
                <span className="font-medium text-slate-900">{client.legal_representative}</span>
              </div>
            )}
            {hasAddress && (
              <div>
                <span className="text-slate-600 block mb-2">Dirección</span>
                <div className="text-sm text-slate-800 bg-slate-50 p-3 rounded-md border">
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

        {/* Commercial Information */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium text-slate-900">Información Comercial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.hourly_rate && (
              <div className="flex justify-between">
                <span className="text-slate-600">Tarifa por Hora</span>
                <span className="font-medium text-slate-900">{client.hourly_rate}€</span>
              </div>
            )}
            {client.payment_method && (
              <div className="flex justify-between">
                <span className="text-slate-600">Método de Pago</span>
                <span className="font-medium text-slate-900 capitalize">{client.payment_method}</span>
              </div>
            )}
            {client.how_found_us && (
              <div className="flex justify-between">
                <span className="text-slate-600">Cómo nos conoció</span>
                <span className="font-medium text-slate-900">{client.how_found_us}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {client.internal_notes && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium text-slate-900">Notas Internas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                {client.internal_notes}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
