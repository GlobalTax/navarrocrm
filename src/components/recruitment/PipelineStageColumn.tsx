import { Users, Phone, Mail, MapPin, Clock, Star, Calendar, Euro, Briefcase, Code } from 'lucide-react'
import { Candidate } from '@/types/recruitment'
import { cn } from '@/lib/utils'

interface PipelineStageColumnProps {
  stage: {
    id: string
    name: string
    color: string
  }
  candidates: Candidate[]
  onCandidateClick: (candidate: Candidate) => void
}

export function PipelineStageColumn({ 
  stage, 
  candidates, 
  onCandidateClick
}: PipelineStageColumnProps) {
  return (
    <div className="min-w-[300px] max-w-[320px]">
      {/* Header */}
      <div className="crm-card p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="crm-card-title">{stage.name}</h3>
          <span className="text-sm font-medium text-muted-foreground">
            {candidates.length}
          </span>
        </div>
      </div>

      {/* Lista de candidatos */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {candidates.map((candidate) => (
          <CandidateCard 
            key={candidate.id} 
            candidate={candidate} 
            onClick={() => onCandidateClick(candidate)} 
          />
        ))}
        
        {candidates.length === 0 && (
          <div className="crm-card p-6 text-center">
            <p className="text-muted-foreground">Sin candidatos</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface CandidateCardProps {
  candidate: Candidate
  onClick: () => void
}

function CandidateCard({ candidate, onClick }: CandidateCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'hsl(var(--violet-500))'
      case 'screening': return 'hsl(var(--sky-500))'
      case 'interviewing': return 'hsl(var(--emerald-500))'
      case 'offer': return 'hsl(var(--amber-500))'
      case 'hired': return 'hsl(var(--green-500))'
      case 'rejected': return 'hsl(var(--red-500))'
      default: return 'hsl(var(--slate-400))'
    }
  }

  return (
    <div 
      className={cn(
        "crm-card p-4 cursor-pointer hover:crm-card-hover transition-all duration-200",
        "border-l-4 relative"
      )}
      style={{ borderLeftColor: getStatusColor(candidate.status) }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-base leading-tight mb-1">
            {candidate.first_name} {candidate.last_name}
          </h4>
          {candidate.current_position && (
            <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
              <Briefcase className="h-3 w-3 flex-shrink-0" />
              {candidate.current_position}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-3 w-3 flex-shrink-0" />
          <span className="truncate flex-1">{candidate.email}</span>
        </div>
        
        {candidate.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3 w-3 flex-shrink-0" />
            <span>{candidate.phone}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{new Date(candidate.created_at).toLocaleDateString('es-ES')}</span>
        </div>
        
        {candidate.expected_salary && (
          <div className="flex items-center gap-1 text-sm font-medium">
            <Euro className="h-3 w-3" />
            <span>{candidate.expected_salary.toLocaleString()}€</span>
          </div>
        )}
      </div>
    </div>
  )
}