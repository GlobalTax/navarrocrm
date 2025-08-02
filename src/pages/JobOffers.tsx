import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { JobOfferBuilder } from '@/components/job-offers/JobOfferBuilder'
import { useJobOffers } from '@/hooks/useJobOffers'
import { JobOfferFormData, JobOfferStatus } from '@/types/job-offers'
import { Plus, Send, Eye, Trash2, Calendar, FileSignature } from 'lucide-react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'

export default function JobOffers() {
  const { jobOffers, isLoading, isCreating, createJobOffer, sendJobOffer, deleteJobOffer, createSignatureRequest } = useJobOffers()
  const [showBuilder, setShowBuilder] = useState(false)

  const handleCreateOffer = async (data: JobOfferFormData) => {
    const offer = await createJobOffer({
      title: data.title,
      department: data.department,
      position_level: data.position_level,
      candidate_name: data.candidate_name,
      candidate_email: data.candidate_email,
      candidate_phone: data.candidate_phone,
      salary_amount: data.salary_amount,
      salary_currency: data.salary_currency,
      salary_period: data.salary_period,
      start_date: data.start_date,
      probation_period_months: data.probation_period_months,
      vacation_days: data.vacation_days,
      work_schedule: data.work_schedule,
      work_location: data.work_location,
      remote_work_allowed: data.remote_work_allowed,
      benefits: data.benefits,
      requirements: data.requirements,
      responsibilities: data.responsibilities,
      additional_notes: data.additional_notes,
      expires_at: new Date(Date.now() + data.expires_in_days * 24 * 60 * 60 * 1000).toISOString()
    })

    if (offer) {
      setShowBuilder(false)
    }
  }

  const getStatusBadge = (status: JobOfferStatus) => {
    const variants: Record<JobOfferStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'outline',
      sent: 'default',
      viewed: 'secondary',
      accepted: 'default',
      declined: 'destructive',
      expired: 'secondary'
    }
    return <Badge variant={variants[status]}>{status}</Badge>
  }

  if (isLoading) {
    return (
      <StandardPageContainer>
        <div className="flex items-center justify-center h-64">
          <p>Cargando ofertas...</p>
        </div>
      </StandardPageContainer>
    )
  }

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Ofertas de Trabajo"
        description="Gestiona las propuestas de incorporación para candidatos"
        actions={
          <Button onClick={() => setShowBuilder(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Oferta
          </Button>
        }
      />

      <div className="grid gap-6">
        {jobOffers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">No hay ofertas de trabajo creadas</p>
              <Button onClick={() => setShowBuilder(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Crear Primera Oferta
              </Button>
            </CardContent>
          </Card>
        ) : (
          jobOffers.map((offer) => (
            <Card key={offer.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{offer.title}</CardTitle>
                    <p className="text-muted-foreground">
                      Para: {offer.candidate_name} • {offer.candidate_email}
                    </p>
                  </div>
                  {getStatusBadge(offer.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Salario</p>
                    <p className="font-semibold">
                      {offer.salary_amount?.toLocaleString()} {offer.salary_currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Departamento</p>
                    <p className="font-semibold">{offer.department || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Creada</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(offer.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {offer.status === 'draft' && (
                    <Button 
                      size="sm" 
                      onClick={() => sendJobOffer(offer.id)}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Enviar
                    </Button>
                  )}
                  {(offer.status === 'sent' || offer.status === 'viewed') && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => createSignatureRequest(offer.id)}
                      className="flex items-center gap-2"
                    >
                      <FileSignature className="h-4 w-4" />
                      Crear Enlace Firma
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Ver Detalles
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => deleteJobOffer(offer.id)}
                    className="flex items-center gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <JobOfferBuilder
        open={showBuilder}
        onOpenChange={setShowBuilder}
        onSave={handleCreateOffer}
        isSaving={isCreating}
      />
    </StandardPageContainer>
  )
}