import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Eye, Edit, Trash2, FileText, Archive, ArchiveRestore } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Case } from '@/hooks/useCases'

interface CaseTableProps {
  cases: Case[]
  onViewCase: (case_: Case) => void
  onEditCase: (case_: Case) => void
  onDeleteCase?: (case_: Case) => void
  onArchiveCase?: (case_: Case) => void
  selectedCases: string[]
  onSelectCase: (caseId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'bg-green-100 text-green-800'
    case 'closed': return 'bg-gray-100 text-gray-800'
    case 'on_hold': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-blue-100 text-blue-800'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'open': return 'Abierto'
    case 'closed': return 'Cerrado'
    case 'on_hold': return 'En espera'
    default: return status
  }
}

export function CaseTable({ 
  cases, 
  onViewCase, 
  onEditCase, 
  onDeleteCase,
  onArchiveCase,
  selectedCases,
  onSelectCase,
  onSelectAll
}: CaseTableProps) {
  const navigate = useNavigate()
  const allSelected = cases.length > 0 && selectedCases.length === cases.length
  const someSelected = selectedCases.length > 0 && selectedCases.length < cases.length

  const handleRowClick = (case_: Case) => {
    navigate(`/cases/${case_.id}`)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAll}
                className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
              />
            </TableHead>
            <TableHead>Nº Expediente</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Área de Práctica</TableHead>
            <TableHead>Asesor Responsable</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha Apertura</TableHead>
            <TableHead>Presupuesto</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                No se encontraron expedientes
              </TableCell>
            </TableRow>
          ) : (
            cases.map((case_) => (
              <TableRow 
                key={case_.id} 
                className={`${case_.status === 'closed' ? 'opacity-60' : ''} cursor-pointer hover:bg-gray-50`}
                onClick={() => handleRowClick(case_)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedCases.includes(case_.id)}
                    onCheckedChange={(checked) => onSelectCase(case_.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  Sin número
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{case_.title}</span>
                    {case_.status === 'closed' && (
                      <Archive className="h-4 w-4 text-purple-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell>Sin cliente asignado</TableCell>
                <TableCell>
                  {case_.practice_area && (
                    <Badge variant="outline">{case_.practice_area}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  Sin asignar
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(case_.status)}>
                    {getStatusLabel(case_.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {case_.created_at && format(new Date(case_.created_at), 'dd/MM/yyyy', { locale: es })}
                </TableCell>
                <TableCell>
                  {case_.estimated_budget && (
                    <span className="font-medium">
                      €{case_.estimated_budget.toLocaleString()}
                    </span>
                  )}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/cases/${case_.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditCase(case_)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {onArchiveCase && (
                        <DropdownMenuItem onClick={() => onArchiveCase(case_)}>
                          {case_.status === 'closed' ? (
                            <>
                              <ArchiveRestore className="h-4 w-4 mr-2" />
                              Reabrir
                            </>
                          ) : (
                            <>
                              <Archive className="h-4 w-4 mr-2" />
                              Cerrar
                            </>
                          )}
                        </DropdownMenuItem>
                      )}
                      {onDeleteCase && (
                        <DropdownMenuItem 
                          onClick={() => onDeleteCase(case_)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      )}
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
