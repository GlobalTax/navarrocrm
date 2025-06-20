
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Eye, User, Calendar } from 'lucide-react'
import { Case } from '@/hooks/useCases'

interface CaseTableProps {
  cases: Case[]
  onViewCase: (case_: Case) => void
  onEditCase: (case_: Case) => void
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'open':
      return <Badge className="bg-blue-100 text-blue-800">Abierto</Badge>
    case 'in_progress':
      return <Badge className="bg-yellow-100 text-yellow-800">En Progreso</Badge>
    case 'pending':
      return <Badge className="bg-orange-100 text-orange-800">Pendiente</Badge>
    case 'closed':
      return <Badge className="bg-green-100 text-green-800">Cerrado</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export const CaseTable = ({ cases, onViewCase, onEditCase }: CaseTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Caso</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha Creación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((case_) => (
            <TableRow key={case_.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{case_.title}</div>
                  {case_.description && (
                    <div className="text-sm text-gray-500 truncate max-w-[300px]">
                      {case_.description}
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {case_.client?.name || 'Cliente no encontrado'}
                  </span>
                </div>
              </TableCell>
              
              <TableCell>
                {getStatusBadge(case_.status)}
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {new Date(case_.created_at).toLocaleDateString()}
                  </span>
                </div>
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onViewCase(case_)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEditCase(case_)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
