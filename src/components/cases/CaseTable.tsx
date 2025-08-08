
import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  const allSelected = cases.length > 0 && selectedCases.length === cases.length
  const someSelected = selectedCases.length > 0 && selectedCases.length < cases.length

  // Determine checkbox state for "select all"
  const selectAllState = allSelected ? true : someSelected ? 'indeterminate' : false

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-primary/10 text-primary border-primary/20'
      case 'on_hold':
        return 'bg-warning/10 text-warning border-warning/20'
      case 'closed':
        return 'bg-success/10 text-success border-success/20'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Abierto'
      case 'on_hold':
        return 'En Espera'
      case 'closed':
        return 'Cerrado'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  return (
    <div className="rounded-[10px] border-[0.5px] border-border bg-background shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-muted/50 border-b-[0.5px] border-border">
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectAllState}
                onCheckedChange={(checked) => onSelectAll(!!checked)}
                className="rounded-[4px] border-[0.5px] border-border"
              />
            </TableHead>
            <TableHead className="font-medium text-foreground">Expediente</TableHead>
            <TableHead className="font-medium text-foreground">Cliente</TableHead>
            <TableHead className="font-medium text-foreground">Estado</TableHead>
            <TableHead className="font-medium text-foreground">Área</TableHead>
            <TableHead className="font-medium text-foreground">Fecha</TableHead>
            <TableHead className="w-[100px] font-medium text-foreground">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                No se encontraron expedientes
              </TableCell>
            </TableRow>
          ) : (
            cases.map((case_) => (
              <TableRow key={case_.id} className="hover:bg-muted/30 transition-colors duration-200 border-b-[0.5px] border-border">
                <TableCell>
                  <Checkbox
                    checked={selectedCases.includes(case_.id)}
                    onCheckedChange={(checked) => onSelectCase(case_.id, !!checked)}
                    className="rounded-[4px] border-[0.5px] border-border"
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-foreground">{case_.title}</div>
                    {case_.description && (
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {case_.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {case_.contact ? (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm text-foreground">{case_.contact.name}</div>
                        {case_.contact.email && (
                          <div className="text-xs text-muted-foreground">{case_.contact.email}</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Sin cliente</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(case_.status)} border-[0.5px] rounded-[10px] font-medium`}
                  >
                    {getStatusLabel(case_.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-foreground">
                    {case_.practice_area || 'No especificada'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(case_.created_at)}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0 rounded-[6px] hover:bg-muted transition-colors duration-200"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-[10px] border-[0.5px] border-border shadow-lg">
                      <DropdownMenuItem 
                        onClick={() => navigate(`/cases/${case_.id}`)}
                        className="rounded-[8px] hover:bg-muted transition-colors duration-200"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onEditCase(case_)}
                        className="rounded-[8px] hover:bg-muted transition-colors duration-200"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      {onStagesView && (
                        <DropdownMenuItem 
                          onClick={() => onStagesView(case_)}
                          className="rounded-[8px] hover:bg-muted transition-colors duration-200"
                        >
                          <ListChecks className="mr-2 h-4 w-4" />
                          Ver etapas
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem 
                        onClick={() => onArchiveCase(case_)}
                        className="rounded-[8px] hover:bg-muted transition-colors duration-200"
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        {case_.status === 'closed' ? 'Reabrir' : 'Archivar'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDeleteCase(case_)}
                        className="text-destructive hover:bg-destructive/10 rounded-[8px] transition-colors duration-200"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
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
    </div>
  )
}
