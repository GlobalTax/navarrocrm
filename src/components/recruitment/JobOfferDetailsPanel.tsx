import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, DollarSign, Calendar, Building, FileText } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface JobOfferDetailsPanelProps {
  jobOffer: any
}

export function JobOfferDetailsPanel({ jobOffer }: JobOfferDetailsPanelProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'draft': 'bg-muted',
      'sent': 'bg-primary',
      'accepted': 'bg-success',
      'rejected': 'bg-destructive',
      'expired': 'bg-warning'
    }
    return colors[status] || 'bg-muted'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Información del candidato */}
      <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Candidato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {jobOffer.candidate && (
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src="" />
                <AvatarFallback>
                  {jobOffer.candidate.first_name?.[0]}{jobOffer.candidate.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {jobOffer.candidate.first_name} {jobOffer.candidate.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">{jobOffer.candidate.email}</p>
                {jobOffer.candidate.current_position && (
                  <p className="text-sm text-muted-foreground">
                    {jobOffer.candidate.current_position}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detalles de la oferta */}
      <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalles de la Oferta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estado</label>
                <div className="mt-1">
                  <Badge className={getStatusColor(jobOffer.status)}>
                    {jobOffer.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Posición</label>
                <p className="mt-1 text-sm font-medium">{jobOffer.job_title || jobOffer.position}</p>
              </div>

              {jobOffer.department && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Departamento</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{jobOffer.department}</span>
                  </div>
                </div>
              )}

              {jobOffer.start_date && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de inicio</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(jobOffer.start_date).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {jobOffer.salary_amount && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Salario</label>
                  <div className="mt-1 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {jobOffer.salary_amount.toLocaleString()} {jobOffer.salary_currency || 'EUR'}
                      {jobOffer.salary_frequency && ` / ${jobOffer.salary_frequency}`}
                    </span>
                  </div>
                </div>
              )}

              {jobOffer.work_type && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo de trabajo</label>
                  <p className="mt-1 text-sm">{jobOffer.work_type}</p>
                </div>
              )}

              {jobOffer.contract_type && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo de contrato</label>
                  <p className="mt-1 text-sm">{jobOffer.contract_type}</p>
                </div>
              )}

              {jobOffer.expiry_date && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de expiración</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(jobOffer.expiry_date).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {jobOffer.benefits && jobOffer.benefits.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Beneficios</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {jobOffer.benefits.map((benefit: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {jobOffer.description && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Descripción</label>
              <div className="mt-1 p-3 bg-muted rounded-[10px]">
                <p className="text-sm">{jobOffer.description}</p>
              </div>
            </div>
          )}

          {jobOffer.notes && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Notas internas</label>
              <div className="mt-1 p-3 bg-muted rounded-[10px]">
                <p className="text-sm">{jobOffer.notes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}