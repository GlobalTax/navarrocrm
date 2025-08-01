import React from 'react'
import { JobOfferFormData } from '@/types/job-offers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Clock, Euro, Users, CheckCircle } from 'lucide-react'
import { TemplatePreview } from './templates/TemplatePreview'

interface JobOfferPreviewProps {
  data: JobOfferFormData
}

export function JobOfferPreview({ data }: JobOfferPreviewProps) {
  const formatSalary = () => {
    const amount = data.salary_amount || 0
    const currency = data.salary_currency === 'EUR' ? '€' : '$'
    const period = data.salary_period === 'annual' ? 'anuales' : 'mensuales'
    return `${amount.toLocaleString()} ${currency} ${period}`
  }

  const formatWorkSchedule = () => {
    switch (data.work_schedule) {
      case 'full_time': return 'Tiempo Completo'
      case 'part_time': return 'Tiempo Parcial'
      case 'hybrid': return 'Híbrido'
      default: return data.work_schedule
    }
  }

  const formatPositionLevel = () => {
    switch (data.position_level) {
      case 'junior': return 'Junior'
      case 'senior': return 'Senior'
      case 'manager': return 'Manager'
      case 'director': return 'Director'
      default: return data.position_level
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Encabezado */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl font-bold mb-2">
                {data.title || 'Título del Puesto'}
              </CardTitle>
              <div className="flex items-center gap-4 text-muted-foreground">
                {data.department && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{data.department}</span>
                  </div>
                )}
                <Badge variant="secondary">
                  {formatPositionLevel()}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Euro className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Salario</p>
                <p className="font-semibold">{formatSalary()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Jornada</p>
                <p className="font-semibold">{formatWorkSchedule()}</p>
              </div>
            </div>
            
            {data.work_location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Ubicación</p>
                  <p className="font-semibold">{data.work_location}</p>
                </div>
              </div>
            )}
            
            {data.start_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Inicio</p>
                  <p className="font-semibold">
                    {new Date(data.start_date).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Información del Candidato */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Dirigida a</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-lg font-semibold">{data.candidate_name || 'Nombre del Candidato'}</p>
            <p className="text-muted-foreground">{data.candidate_email || 'email@ejemplo.com'}</p>
            {data.candidate_phone && (
              <p className="text-muted-foreground">{data.candidate_phone}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Responsabilidades */}
      {data.responsibilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Responsabilidades</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.responsibilities.map((responsibility, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{responsibility}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Requisitos */}
      {data.requirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Requisitos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{requirement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Beneficios */}
      {data.benefits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Beneficios</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Condiciones Adicionales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Condiciones de Trabajo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Días de vacaciones</p>
              <p className="font-semibold">{data.vacation_days} días anuales</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Período de prueba</p>
              <p className="font-semibold">{data.probation_period_months} meses</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trabajo remoto</p>
              <p className="font-semibold">
                {data.remote_work_allowed ? 'Permitido' : 'No permitido'}
              </p>
            </div>
          </div>
          
          {data.additional_notes && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Notas adicionales</p>
              <p className="text-sm">{data.additional_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plantillas de Integración */}
      <TemplatePreview data={data} />
    </div>
  )
}