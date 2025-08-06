import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { PipelineStageColumn } from './PipelineStageColumn'
import { PipelineMetrics } from './PipelineMetrics'
import { PipelineStagesEditor } from './PipelineStagesEditor'
import { usePipelineAnalytics } from '@/hooks/recruitment/usePipelineAnalytics'
import { usePipelineStages } from '@/hooks/recruitment/usePipelineStages'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Candidate } from '@/types/recruitment'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, BarChart3, Grid3x3, Settings } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface RecruitmentPipelineProps {
  onSelectCandidate?: (candidate: Candidate) => void
  onScheduleInterview?: (candidate: Candidate) => void  
  onCreateOffer?: (candidate: Candidate) => void
}

export function RecruitmentPipeline({ 
  onSelectCandidate,
  onScheduleInterview, 
  onCreateOffer
}: RecruitmentPipelineProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSource, setSelectedSource] = useState<string>('all')
  const [selectedExperience, setSelectedExperience] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'pipeline' | 'analytics' | 'settings'>('pipeline')
  const queryClient = useQueryClient()

  // Fetch pipeline analytics and stages
  const { data: metrics } = usePipelineAnalytics()
  const { stages, updateCandidateStage, getCandidatesByStage } = usePipelineStages()

  // Fetch candidates
  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Candidate[]
    }
  })

  // Filter candidates based on search and filters
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = searchTerm === '' || 
      `${candidate.first_name} ${candidate.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.current_position?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSource = selectedSource === 'all' || candidate.source === selectedSource
    
    const matchesExperience = selectedExperience === 'all' || 
      (selectedExperience === 'junior' && (candidate.years_experience || 0) <= 2) ||
      (selectedExperience === 'mid' && (candidate.years_experience || 0) > 2 && (candidate.years_experience || 0) <= 5) ||
      (selectedExperience === 'senior' && (candidate.years_experience || 0) > 5)

    return matchesSearch && matchesSource && matchesExperience
  })

  // Handle drag and drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result
    
    if (source.droppableId !== destination.droppableId) {
      // Moving between stages
      updateCandidateStage.mutate({
        candidateId: draggableId,
        newStage: destination.droppableId
      })
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Cargando pipeline...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar candidatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Select value={selectedSource} onValueChange={setSelectedSource}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Fuente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="website">Web</SelectItem>
              <SelectItem value="referral">Referido</SelectItem>
              <SelectItem value="job_board">Portal</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedExperience} onValueChange={setSelectedExperience}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Experiencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="junior">Junior</SelectItem>
              <SelectItem value="mid">Mid</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'pipeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('pipeline')}
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            Pipeline
          </Button>
          <Button
            variant={viewMode === 'analytics' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('analytics')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button
            variant={viewMode === 'settings' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('settings')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'analytics' ? (
        <div className="mt-6">
          {metrics && <PipelineMetrics metrics={metrics} />}
        </div>
      ) : viewMode === 'settings' ? (
        <div className="mt-6">
          <PipelineStagesEditor />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-6 min-w-max pb-4">
              {stages.map((stage) => {
                const stageCandidates = getCandidatesByStage(stage.name, filteredCandidates)
                return (
                  <PipelineStageColumn
                    key={stage.id}
                    stage={{
                      id: stage.name, // Use stage name as ID for drag/drop
                      name: stage.name,
                      color: stage.color
                    }}
                    candidates={stageCandidates}
                    onCandidateClick={(candidate) => {
                      onSelectCandidate?.(candidate)
                    }}
                  />
                )
              })}
            </div>
          </DragDropContext>
        </div>
      )}
    </div>
  )
}