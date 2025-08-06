import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { DetailPageHeader } from '@/components/layout/DetailPageHeader'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Building, 
  DollarSign, 
  Calendar, 
  Send, 
  Edit, 
  Trash2, 
  Download,
  MapPin,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useApp } from '@/contexts/AppContext'
import { supabase } from '@/integrations/supabase/client'

interface JobOffer {
  id: string
  candidate_id: string
  position: string
  salary: number
  salary_currency: string
  start_date: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  created_at: string
  benefits?: string[]
  work_schedule?: string
  location?: string
  contract_type?: string
  probation_period?: number
  additional_notes?: string
  candidate?: {
    first_name: string
    last_name: string
    email: string
    phone: string
    current_position: string
  }
}

export default function JobOfferDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useApp()

  const { data: jobOffer, isLoading } = useQuery({
    queryKey: ['job-offer', id],
    queryFn: async () => {
      if (!id) throw new Error('ID de la oferta no proporcionado')
      
      const { data, error } = await supabase
        .from('job_offers')
        .select(`
          *,
          candidate:candidates(first_name, last_name, email, phone, current_position)
        `)
        .eq('id', id)
        .eq('org_id', user?.org_id)
        .single()
      
      if (error) throw error
      return data as any
    },
    enabled: !!id && !!user?.org_id
  })

  if (isLoading) {
    return (
      <StandardPageContainer>
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </StandardPageContainer>
    )
  }

  if (!jobOffer) {
    return (
      <StandardPageContainer>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Oferta no encontrada</h2>
          <p className="text-gray-600 mt-2">La oferta que buscas no existe o no tienes permisos para verla.</p>
        </div>
      </StandardPageContainer>
    )
  }

  const candidateName = jobOffer.candidate 
    ? `${jobOffer.candidate.first_name} ${jobOffer.candidate.last_name}`
    : 'Candidato no disponible'

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'expired':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Borrador'
      case 'sent':
        return 'Enviada'
      case 'accepted':
        return 'Aceptada'
      case 'rejected':
        return 'Rechazada'
      case 'expired':
        return 'Expirada'
      default:
        return status
    }
  }

  const formatSalary = (salary: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(salary)
  }

  return (
    <StandardPageContainer>
      <DetailPageHeader
        title={`Oferta para ${candidateName}`}
        subtitle={jobOffer.position}
        breadcrumbItems={[
          { label: 'Reclutamiento', href: '/recruitment' },
          { label: 'Ofertas de Trabajo' },
          { label: candidateName }
        ]}
        backUrl="/recruitment"
      >
        {jobOffer.status === 'draft' && (
          <>
            <Button variant="outline" size="sm" className="gap-2 border-0.5 border-foreground rounded-[10px]">
              <Edit className="h-4 w-4" />
              Editar
            </Button>
            <Button size="sm" className="gap-2 border-0.5 border-foreground rounded-[10px]">
              <Send className="h-4 w-4" />
              Enviar Oferta
            </Button>
          </>
        )}
        <Button variant="outline" size="sm" className="gap-2 border-0.5 border-foreground rounded-[10px]">
          <Download className="h-4 w-4" />
          Descargar PDF
        </Button>
        <Button variant="outline" size="sm" className="gap-2 border-0.5 border-foreground rounded-[10px] text-red-600 hover:text-red-700">
          <Trash2 className="h-4 w-4" />
          Eliminar
        </Button>
      </DetailPageHeader>
      
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Detalles de la Oferta
                </CardTitle>
                <Badge variant="outline" className={`border-0.5 rounded-[10px] ${getStatusColor(jobOffer.status)}`}>
                  {getStatusLabel(jobOffer.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Posición</label>
                  <p className="font-semibold">{jobOffer.position}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Salario</label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{formatSalary(jobOffer.salary, jobOffer.salary_currency)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Inicio</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{jobOffer.start_date ? format(new Date(jobOffer.start_date), 'dd/MM/yyyy', { locale: es }) : 'A convenir'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Tipo de Contrato</label>
                  <span>{jobOffer.contract_type || 'Indefinido'}</span>
                </div>

                {jobOffer.location && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Ubicación</label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{jobOffer.location}</span>
                    </div>
                  </div>
                )}

                {jobOffer.work_schedule && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Horario</label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{jobOffer.work_schedule}</span>
                    </div>
                  </div>
                )}

                {jobOffer.probation_period && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Período de Prueba</label>
                    <span>{jobOffer.probation_period} meses</span>
                  </div>
                )}
              </div>

              {jobOffer.benefits && jobOffer.benefits.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Beneficios</label>
                  <div className="flex flex-wrap gap-2">
                    {jobOffer.benefits.map((benefit, index) => (
                      <Badge key={index} variant="secondary" className="border-0.5 rounded-[10px]">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {jobOffer.additional_notes && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Notas Adicionales</label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{jobOffer.additional_notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel del Candidato */}
        <div className="space-y-6">
          <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Candidato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobOffer.candidate && (
                <>
                  <div>
                    <h3 className="font-semibold text-lg">{candidateName}</h3>
                    <p className="text-sm text-muted-foreground">{jobOffer.candidate.current_position}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Email:</span>
                      <span className="text-sm text-muted-foreground">{jobOffer.candidate.email}</span>
                    </div>
                    {jobOffer.candidate.phone && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Teléfono:</span>
                        <span className="text-sm text-muted-foreground">{jobOffer.candidate.phone}</span>
                      </div>
                    )}
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-0.5 border-foreground rounded-[10px]"
                    onClick={() => window.open(`/recruitment/candidates/${jobOffer.candidate_id}`, '_blank')}
                  >
                    Ver Perfil Completo
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Información de Fechas */}
          <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Fechas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Creada:</span>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(jobOffer.created_at), 'dd/MM/yyyy', { locale: es })}
                </span>
              </div>
              {jobOffer.start_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Inicio:</span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(jobOffer.start_date), 'dd/MM/yyyy', { locale: es })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </StandardPageContainer>
  )
}