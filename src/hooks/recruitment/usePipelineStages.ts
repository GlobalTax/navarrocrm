import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export interface PipelineStage {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  sort_order: number
  is_active: boolean
  is_default: boolean
  org_id: string
  created_at: string
  updated_at: string
}

export function usePipelineStages() {
  const queryClient = useQueryClient()

  const { data: stages = [], isLoading } = useQuery({
    queryKey: ['recruitment-pipeline-stages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recruitment_pipeline_stages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) throw error
      return data as PipelineStage[]
    }
  })

  const updateCandidateStage = useMutation({
    mutationFn: async ({ candidateId, newStage }: { candidateId: string; newStage: string }) => {
      // Map stage names to status values
      const stageToStatus: Record<string, string> = {
        'Nuevos': 'new',
        'Screening': 'screening', 
        'Entrevista Técnica': 'interviewing',
        'Entrevista Final': 'interviewing',
        'Oferta': 'offer',
        'Contratado': 'hired',
        'Rechazado': 'rejected'
      }

      const status = stageToStatus[newStage] || 'new'

      const { error } = await supabase
        .from('candidates')
        .update({ status })
        .eq('id', candidateId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      toast.success('Candidato movido exitosamente')
    },
    onError: () => {
      toast.error('Error al mover el candidato')
    }
  })

  // Get stage name by candidate status
  const getStageByStatus = (status: string): PipelineStage | undefined => {
    const statusToStage: Record<string, string> = {
      'new': 'Nuevos',
      'screening': 'Screening',
      'interviewing': 'Entrevista Técnica', // Default for interviewing
      'offer': 'Oferta',
      'hired': 'Contratado',
      'rejected': 'Rechazado'
    }

    const stageName = statusToStage[status]
    return stages.find(stage => stage.name === stageName)
  }

  // Get candidates by stage
  const getCandidatesByStage = (stageName: string, candidates: any[]) => {
    const stageToStatus: Record<string, string[]> = {
      'Nuevos': ['new'],
      'Screening': ['screening'],
      'Entrevista Técnica': ['interviewing'],
      'Entrevista Final': ['interviewing'],
      'Oferta': ['offer'],
      'Contratado': ['hired'],
      'Rechazado': ['rejected']
    }

    const validStatuses = stageToStatus[stageName] || []
    return candidates.filter(candidate => validStatuses.includes(candidate.status))
  }

  return {
    stages,
    isLoading,
    updateCandidateStage,
    getStageByStatus,
    getCandidatesByStage
  }
}