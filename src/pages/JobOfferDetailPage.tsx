import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { DetailPageHeader } from '@/components/layout/DetailPageHeader'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { JobOfferDetailsPanel } from '@/components/recruitment/JobOfferDetailsPanel'
import { useApp } from '@/contexts/AppContext'
import { supabase } from '@/integrations/supabase/client'

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
          candidate:candidates(*)
        `)
        .eq('id', id)
        .eq('org_id', user?.org_id)
        .single()
      
      if (error) throw error
      return data
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
    : 'Candidato';

  return (
    <StandardPageContainer>
      <DetailPageHeader
        title={`Oferta - ${candidateName}`}
        subtitle={'Oferta de trabajo'}
        breadcrumbItems={[
          { label: 'Reclutamiento', href: '/recruitment' },
          { label: 'Ofertas' },
          { label: candidateName }
        ]}
        backUrl="/recruitment"
      />
      
      <div className="mt-6">
        <JobOfferDetailsPanel jobOffer={jobOffer} />
      </div>
    </StandardPageContainer>
  )
}