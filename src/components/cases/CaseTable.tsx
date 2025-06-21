
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Eye, Edit, Trash2, FileText } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Case } from '@/hooks/useCases'

interface CaseTableProps {
  cases: Case[]
  onViewCase: (case_: Case) => void
  onEditCase: (case_: Case) => void
  onDeleteCase?: (case_: Case) => void
  selectedCases: string[]
  onSelectCase: (caseId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'bg-green-100 text-green-800'
    case 'closed': return 'bg-gray-100 text-gray-800'
    case 'on_hold': return 'bg-yellow-100 text-yellow-800'
    case 'archived': return 'bg-red-100 text-red-800'
    default: return 'bg-blue-100 text-blue-800'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'open': return 'Abierto'
    case 'closed': return 'Cerrado'
    case 'on_hold': return 'En espera'
    case 'archived': return 'Archivado'
    default: return status
  }
}

export function CaseTable({ 
  cases, 
  onViewCase, 
  onEditCase, 
  onDeleteCase,
  selectedCases,
  onSelectCase,
  onSelectAll
}: CaseTableProps) {
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
                ref={(el) => {
                  if (el) el.indeterminate = someSelected
                }}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>Nº Expediente</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Área de Práctica</TableHead>
            <TableHead>Abogado Responsable</TableHead>
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
              <TableRow key={case_.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedCases.includes(case_.id)}
                    onCheckedChange={(checked) => onSelectCase(case_.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {case_.matter_number || 'Sin número'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{case_.title}</span>
                  </div>
                </TableCell>
                <TableCell>{case_.client?.name}</TableCell>
                <TableCell>
                  {case_.practice_area && (
                    <Badge variant="outline">{case_.practice_area}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {case_.responsible_solicitor?.email}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(case_.status)}>
                    {getStatusLabel(case_.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {case_.date_opened && format(new Date(case_.date_opened), 'dd/MM/yyyy', { locale: es })}
                </TableCell>
                <TableCell>
                  {case_.estimated_budget && (
                    <span className="font-medium">
                      €{case_.estimated_budget.toLocaleString()}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewCase(case_)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditCase(case_)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
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
