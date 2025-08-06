import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { DetailPageHeader } from '@/components/layout/DetailPageHeader'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { CandidateDetailsPanel } from '@/components/recruitment/CandidateDetailsPanel'
import { useApp } from '@/contexts/AppContext'
import { supabase } from '@/integrations/supabase/client'
import { type Candidate } from '@/types/recruitment'

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useApp()

  const { data: candidate, isLoading } = useQuery({
    queryKey: ['candidate', id],
    queryFn: async () => {
      if (!id) throw new Error('ID del candidato no proporcionado')
      
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', id)
        .eq('org_id', user?.org_id)
        .single()
      
      if (error) throw error
      return data as Candidate
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

  if (!candidate) {
    return (
      <StandardPageContainer>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Candidato no encontrado</h2>
          <p className="text-gray-600 mt-2">El candidato que buscas no existe o no tienes permisos para verlo.</p>
        </div>
      </StandardPageContainer>
    )
  }

  const candidateName = `${candidate.first_name} ${candidate.last_name}`

  return (
    <StandardPageContainer>
      <DetailPageHeader
        title={candidateName}
        subtitle={candidate.current_position || 'Candidato'}
        breadcrumbItems={[
          { label: 'Reclutamiento', href: '/recruitment' },
          { label: 'Candidatos' },
          { label: candidateName }
        ]}
        backUrl="/recruitment"
      />
      
      <div className="mt-6">
        <CandidateDetailsPanel candidate={candidate} />
      </div>
    </StandardPageContainer>
  )
}