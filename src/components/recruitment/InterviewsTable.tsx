import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, Plus, MoreHorizontal, Eye, Calendar, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { type Interview, INTERVIEW_TYPE_LABELS, type InterviewType } from '@/types/recruitment'

interface InterviewWithCandidate extends Omit<Interview, 'interview_type'> {
  interview_type: string | InterviewType
  candidate?: {
    first_name: string
    last_name: string
    email: string
  }
}

interface InterviewsTableProps {
  interviews: any[]
  isLoading?: boolean
  onScheduleInterview: () => void
  onViewInterview: (interview: any) => void
  onEditInterview: (interview: any) => void
  onDeleteInterview: (interview: any) => void
}

export function InterviewsTable({
  interviews,
  isLoading,
  onScheduleInterview,
  onViewInterview,
  onEditInterview,
  onDeleteInterview
}: InterviewsTableProps) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredInterviews = interviews.filter(interview => {
    const candidateName = interview.candidate 
      ? `${interview.candidate.first_name} ${interview.candidate.last_name}`.toLowerCase()
      : ''
    const searchLower = searchTerm.toLowerCase()
    
    return candidateName.includes(searchLower) ||
           interview.interview_type?.toLowerCase().includes(searchLower)
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'phone':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'video':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_person':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'technical':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'behavioral':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'final':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleViewInterview = (interview: any) => {
    navigate(`/recruitment/interviews/${interview.id}`)
  }

  if (isLoading) {
    return (
      <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Entrevistas</CardTitle>
          <Button 
            onClick={onScheduleInterview}
            size="sm"
            className="gap-2 border-0.5 border-foreground rounded-[10px]"
          >
            <Plus className="h-4 w-4" />
            Programar Entrevista
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar entrevistas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-0.5 border-foreground rounded-[10px]"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidato</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fecha y Hora</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInterviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-muted-foreground">
                    {searchTerm ? 'No se encontraron entrevistas con ese criterio.' : 'No hay entrevistas programadas.'}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredInterviews.map((interview: any) => (
                <TableRow 
                  key={interview.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleViewInterview(interview)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {interview.candidate 
                          ? `${interview.candidate.first_name} ${interview.candidate.last_name}`
                          : 'Candidato no disponible'
                        }
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {interview.candidate?.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-0.5 rounded-[10px] ${getTypeColor(interview.interview_type)}`}>
                      {INTERVIEW_TYPE_LABELS[interview.interview_type] || interview.interview_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {format(new Date(interview.scheduled_at), 'dd/MM/yyyy', { locale: es })}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(interview.scheduled_at), 'HH:mm', { locale: es })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-0.5 rounded-[10px] ${getStatusColor(interview.status)}`}>
                      {interview.status === 'scheduled' ? 'Programada' :
                       interview.status === 'completed' ? 'Completada' :
                       interview.status === 'cancelled' ? 'Cancelada' :
                       interview.status === 'no_show' ? 'No presentado' : interview.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {interview.duration_minutes ? `${interview.duration_minutes} min` : '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {interview.location || interview.meeting_url ? 
                        (interview.location || 'Video llamada') : '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-0.5 border-foreground rounded-[10px]">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewInterview(interview); }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditInterview(interview); }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => { e.stopPropagation(); onDeleteInterview(interview); }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}