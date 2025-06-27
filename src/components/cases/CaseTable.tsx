
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Eye, Edit, Trash2, Archive, MoreHorizontal, Briefcase } from 'lucide-react'
import { Case } from '@/hooks/useCases'

interface CaseTableProps {
  cases: Case[]
  selectedCases: string[]
  onViewCase: (case_: Case) => void
  onOpenWorkspace: (case_: Case) => void
  onEditCase: (case_: Case) => void
  onDeleteCase: (case_: Case) => void
  onArchiveCase: (case_: Case) => void
  onSelectCase: (caseId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
}

export function CaseTable({ 
  cases, 
  selectedCases, 
  onViewCase, 
  onOpenWorkspace,
  onEditCase, 
  onDeleteCase, 
  onArchiveCase, 
  onSelectCase, 
  onSelectAll 
}: CaseTableProps) {
  const [sortField, setSortField] = useState<keyof Case>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: keyof Case) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedCases = [...cases].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'on_hold': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Abierto'
      case 'on_hold': return 'En Espera'
      case 'closed': return 'Cerrado'
      default: return status
    }
  }

  const isAllSelected = cases.length > 0 && selectedCases.length === cases.length
  const isIndeterminate = selectedCases.length > 0 && selectedCases.length < cases.length

  // Determine the checked state for the header checkbox
  const getHeaderCheckboxState = () => {
    if (isAllSelected) return true
    if (isIndeterminate) return "indeterminate"
    return false
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={getHeaderCheckboxState()}
                onCheckedChange={(checked) => onSelectAll(!!checked)}
              />
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('title')}
            >
              Título
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('status')}
            >
              Estado
            </TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Área</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('created_at')}
            >
              Creado
            </TableHead>
            <TableHead className="w-16">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCases.map((case_) => (
            <TableRow key={case_.id} className="hover:bg-gray-50">
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
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {case_.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(case_.status)}>
                  {getStatusLabel(case_.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {case_.contact?.name || 'Sin asignar'}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {case_.practice_area || 'No especificada'}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {new Date(case_.created_at).toLocaleDateString()}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onOpenWorkspace(case_)}>
                      <Briefcase className="h-4 w-4 mr-2" />
                      Abrir Workspace
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onViewCase(case_)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditCase(case_)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onArchiveCase(case_)}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archivar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDeleteCase(case_)}
                      className="text-red-600 hover:text-red-700"
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
    </div>
  )
}
