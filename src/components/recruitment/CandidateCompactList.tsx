import { useState } from 'react'
import { Search, Plus, Eye, Calendar, Briefcase } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { type Candidate } from '@/types/recruitment'
import { cn } from '@/lib/utils'

interface CandidateCompactListProps {
  candidates: Candidate[]
  isLoading: boolean
  selectedCandidate: Candidate | null
  onSelectCandidate: (candidate: Candidate) => void
  onScheduleInterview: (candidate: Candidate) => void
  onCreateOffer: (candidate: Candidate) => void
  onAddCandidate: () => void
}

export function CandidateCompactList({
  candidates,
  isLoading,
  selectedCandidate,
  onSelectCandidate,
  onScheduleInterview,
  onCreateOffer,
  onAddCandidate
}: CandidateCompactListProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCandidates = candidates.filter(candidate =>
    `${candidate.first_name} ${candidate.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.current_position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.current_company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'new': 'bg-blue-100 text-blue-800 border-blue-200',
      'screening': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'interviewing': 'bg-purple-100 text-purple-800 border-purple-200',
      'offer_sent': 'bg-orange-100 text-orange-800 border-orange-200',
      'hired': 'bg-green-100 text-green-800 border-green-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200',
      'withdrawn': 'bg-gray-100 text-gray-800 border-gray-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'new': 'Nuevo',
      'screening': 'Evaluación',
      'interviewing': 'Entrevistas',
      'offer_sent': 'Oferta Enviada',
      'hired': 'Contratado',
      'rejected': 'Rechazado',
      'withdrawn': 'Se retiró'
    }
    return labels[status] || status
  }

  if (isLoading) {
    return (
      <Card className="border-0.5 border-foreground rounded-[10px] h-full">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle>Candidatos</CardTitle>
            <Button size="sm" className="rounded-[10px] border-0.5 border-foreground" disabled>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0.5 border-foreground rounded-[10px] h-full">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle>Candidatos ({candidates.length})</CardTitle>
          <Button 
            size="sm" 
            className="rounded-[10px] border-0.5 border-foreground"
            onClick={onAddCandidate}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Búsqueda */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar candidatos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-[10px] border-0.5 border-foreground"
          />
        </div>

        {/* Lista de candidatos */}
        <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto">
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? 'No se encontraron candidatos' : 'No hay candidatos registrados'}
              </p>
            </div>
          ) : (
            filteredCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className={cn(
                  "p-3 border rounded-[10px] cursor-pointer transition-all duration-200 hover:shadow-md",
                  selectedCandidate?.id === candidate.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => onSelectCandidate(candidate)}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs">
                      {candidate.first_name[0]}{candidate.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {candidate.first_name} {candidate.last_name}
                    </h4>
                    
                    {candidate.current_position && (
                      <p className="text-xs text-muted-foreground truncate">
                        {candidate.current_position}
                        {candidate.current_company && ` en ${candidate.current_company}`}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs border-0.5 rounded-[6px]", getStatusColor(candidate.status))}
                      >
                        {getStatusLabel(candidate.status)}
                      </Badge>
                      
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            onScheduleInterview(candidate)
                          }}
                          title="Programar entrevista"
                        >
                          <Calendar className="w-3 h-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            onCreateOffer(candidate)
                          }}
                          title="Crear oferta"
                        >
                          <Briefcase className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}