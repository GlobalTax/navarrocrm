import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { DetailPageHeader } from '@/components/layout/DetailPageHeader'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { InterviewDetailsPanel } from '@/components/recruitment/InterviewDetailsPanel'
import { useApp } from '@/contexts/AppContext'
import { supabase } from '@/integrations/supabase/client'
import { type Interview } from '@/types/recruitment'

export default function InterviewDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useApp()

  const { data: interview, isLoading } = useQuery({
    queryKey: ['interview', id],
    queryFn: async () => {
      if (!id) throw new Error('ID de la entrevista no proporcionado')
      
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          candidate:candidates(*)
        `)
        .eq('id', id)
        .eq('org_id', user?.org_id)
        .single()
      
      if (error) throw error
      return data as Interview
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

  if (!interview) {
    return (
      <StandardPageContainer>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Entrevista no encontrada</h2>
          <p className="text-gray-600 mt-2">La entrevista que buscas no existe o no tienes permisos para verla.</p>
        </div>
      </StandardPageContainer>
    )
  }

  const candidateName = (interview as any).candidate 
    ? `${(interview as any).candidate.first_name} ${(interview as any).candidate.last_name}`
    : 'Candidato';

  return (
    <StandardPageContainer>
      <DetailPageHeader
        title={`Entrevista - ${candidateName}`}
        subtitle={interview.interview_type || 'Entrevista'}
        breadcrumbItems={[
          { label: 'Reclutamiento', href: '/recruitment' },
          { label: 'Entrevistas' },
          { label: candidateName }
        ]}
        backUrl="/recruitment"
      />
      
      <div className="mt-6">
        <InterviewDetailsPanel interview={interview} />
      </div>
    </StandardPageContainer>
  )
}