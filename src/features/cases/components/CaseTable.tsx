import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MoreHorizontal, Eye, Edit, Archive, ArchiveRestore, Trash2, Layers3 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Case } from '@/features/cases'

interface CaseTableProps {
  cases: Case[]
  onView: (case_: Case) => void
  onEdit: (case_: Case) => void
  onDelete: (case_: Case) => void
  onArchive: (case_: Case) => void
  onStagesView: (case_: Case) => void
  selectedCases: string[]
  onSelectCase: (caseId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
}

export function CaseTable({
  cases,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onStagesView,
  selectedCases,
  onSelectCase,
  onSelectAll
}: CaseTableProps) {
  const allSelected = cases.length > 0 && selectedCases.length === cases.length
  const someSelected = selectedCases.length > 0 && selectedCases.length < cases.length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-200'
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'on_hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es })
    } catch {
      return dateString
    }
  }

  if (cases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expedientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay expedientes
            </h3>
            <p className="text-gray-500">
              Comienza creando tu primer expediente para ver los datos aquí.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Expedientes ({cases.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el) (el as any).indeterminate = someSelected
                  }}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                />
              </TableHead>
              <TableHead>Expediente</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((case_) => (
              <TableRow key={case_.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedCases.includes(case_.id)}
                    onCheckedChange={(checked) => onSelectCase(case_.id, !!checked)}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{case_.title}</div>
                    {case_.description && (
                      <div className="text-sm text-muted-foreground">
                        {case_.description.length > 100 
                          ? `${case_.description.substring(0, 100)}...` 
                          : case_.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {(case_ as any).client?.name || 'Sin cliente'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(case_.status)}>
                    {getStatusLabel(case_.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {case_.practice_area || 'Sin área'}
                </TableCell>
                <TableCell>
                  {case_.created_at ? formatDate(case_.created_at) : '-'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(case_)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(case_)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onStagesView(case_)}>
                        <Layers3 className="h-4 w-4 mr-2" />
                        Ver etapas
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onArchive(case_)}>
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
                      <DropdownMenuItem 
                        onClick={() => onDelete(case_)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}