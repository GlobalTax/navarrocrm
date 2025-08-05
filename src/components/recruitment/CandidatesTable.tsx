import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Search, MoreHorizontal, Plus, Eye, UserPlus, Calendar } from 'lucide-react'
import { type Candidate, CANDIDATE_STATUS_LABELS } from '@/types/recruitment'

interface CandidatesTableProps {
  candidates: Candidate[]
  isLoading: boolean
  onViewCandidate: (candidate: Candidate) => void
  onScheduleInterview: (candidate: Candidate) => void
  onCreateOffer: (candidate: Candidate) => void
  onAddCandidate: () => void
}

export function CandidatesTable({
  candidates,
  isLoading,
  onViewCandidate,
  onScheduleInterview,
  onCreateOffer,
  onAddCandidate
}: CandidatesTableProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCandidates = candidates.filter(candidate =>
    candidate.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.current_position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.current_company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'screening': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'interviewing': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'offer_sent': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'hired': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'linkedin': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'job_board': return 'bg-green-50 text-green-700 border-green-200'
      case 'referral': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'website': return 'bg-orange-50 text-orange-700 border-orange-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded-[10px]" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Candidatos</CardTitle>
          <Button 
            onClick={onAddCandidate}
            className="rounded-[10px] border-0.5 border-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir Candidato
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar candidatos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-0.5 border-foreground rounded-[10px]"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidato</TableHead>
                <TableHead>Posición Actual</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fuente</TableHead>
                <TableHead>Experiencia</TableHead>
                <TableHead>Fecha Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.map((candidate) => (
                <TableRow key={candidate.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {candidate.first_name} {candidate.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {candidate.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {candidate.current_position || 'No especificado'}
                      </div>
                      {candidate.current_company && (
                        <div className="text-sm text-muted-foreground">
                          {candidate.current_company}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`rounded-[10px] border-0.5 ${getStatusColor(candidate.status)}`}
                    >
                      {CANDIDATE_STATUS_LABELS[candidate.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={`rounded-[10px] border-0.5 ${getSourceColor(candidate.source)}`}
                    >
                      {candidate.source === 'manual' ? 'Manual' :
                       candidate.source === 'linkedin' ? 'LinkedIn' :
                       candidate.source === 'job_board' ? 'Portal empleos' :
                       candidate.source === 'referral' ? 'Referencia' :
                       candidate.source === 'website' ? 'Web' : candidate.source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {candidate.years_experience} año{candidate.years_experience !== 1 ? 's' : ''}
                  </TableCell>
                  <TableCell>
                    {format(new Date(candidate.created_at), 'dd MMM yyyy', { locale: es })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="rounded-[10px]">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-0.5 border-foreground rounded-[10px]">
                        <DropdownMenuItem 
                          onClick={() => onViewCandidate(candidate)}
                          className="rounded-[8px]"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onScheduleInterview(candidate)}
                          className="rounded-[8px]"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Programar entrevista
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onCreateOffer(candidate)}
                          className="rounded-[8px]"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Crear oferta
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredCandidates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No se encontraron candidatos que coincidan con la búsqueda' : 'No hay candidatos registrados'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}