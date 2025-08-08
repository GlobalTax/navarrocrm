import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Eye, 
  Edit, 
  Archive, 
  Trash2, 
  MoreHorizontal,
  ListChecks,
  Calendar,
  User
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Case } from '@/features/cases'

interface CaseTableProps {
  cases: Case[]
  onViewCase: (case_: Case) => void
  onEditCase: (case_: Case) => void
  onDeleteCase: (case_: Case) => void
  onArchiveCase: (case_: Case) => void
  onStagesView?: (case_: Case) => void
  selectedCases: string[]
  onSelectCase: (caseId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
}

export const CaseTable: React.FC<CaseTableProps> = ({
  cases,
  onViewCase,
  onEditCase,
  onDeleteCase,
  onArchiveCase,
  onStagesView,
  selectedCases,
  onSelectCase,
  onSelectAll
}) => {
  const navigate = useNavigate()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      case 'archived': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo'
      case 'pending': return 'Pendiente'
      case 'closed': return 'Cerrado'
      case 'archived': return 'Archivado'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const handleSelectAll = (checked: boolean) => {
    onSelectAll(checked)
  }

  const handleSelectCase = (caseId: string, checked: boolean) => {
    onSelectCase(caseId, checked)
  }

  const allSelected = cases.length > 0 && selectedCases.length === cases.length
  const someSelected = selectedCases.length > 0 && selectedCases.length < cases.length

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Expediente</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Área</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead>Fecha Inicio</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((case_) => (
            <TableRow key={case_.id} className="cursor-pointer hover:bg-gray-50">
              <TableCell>
                <Checkbox
                  checked={selectedCases.includes(case_.id)}
                  onCheckedChange={(checked) => 
                    handleSelectCase(case_.id, checked as boolean)
                  }
                  onClick={(e) => e.stopPropagation()}
                />
              </TableCell>
              <TableCell onClick={() => onViewCase(case_)}>
                <div>
                  <div className="font-medium">{case_.title}</div>
                  <div className="text-sm text-gray-500">{case_.id}</div>
                </div>
              </TableCell>
              <TableCell onClick={() => onViewCase(case_)}>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>{'Sin cliente'}</span>
                </div>
              </TableCell>
              <TableCell onClick={() => onViewCase(case_)}>
                <Badge variant="secondary" className={getStatusColor(case_.status)}>
                  {getStatusText(case_.status)}
                </Badge>
              </TableCell>
              <TableCell onClick={() => onViewCase(case_)}>
                {case_.practice_area || 'No especificada'}
              </TableCell>
              <TableCell onClick={() => onViewCase(case_)}>
                {case_.responsible_solicitor_id || 'Sin asignar'}
              </TableCell>
              <TableCell onClick={() => onViewCase(case_)}>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{formatDate(case_.created_at)}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewCase(case_)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver expediente
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditCase(case_)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    {onStagesView && (
                      <DropdownMenuItem onClick={() => onStagesView(case_)}>
                        <ListChecks className="mr-2 h-4 w-4" />
                        Ver etapas
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onArchiveCase(case_)}>
                      <Archive className="mr-2 h-4 w-4" />
                      {case_.status === 'closed' ? 'Reabrir' : 'Cerrar'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDeleteCase(case_)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}