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
import { Case } from '@/hooks/useCases'
import { VirtualList } from '@/components/ui/virtual-list'

interface VirtualizedCaseTableProps {
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

export const VirtualizedCaseTable: React.FC<VirtualizedCaseTableProps> = ({
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
  const selectAllState = allSelected ? true : someSelected ? 'indeterminate' : false

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800'
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800'
      case 'closed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  const renderCaseRow = (case_: Case, index: number) => (
    <TableRow key={case_.id} className="hover:bg-gray-50 border-b border-gray-100">
      <TableCell className="w-[50px] py-3 px-4">
        <Checkbox
          checked={selectedCases.includes(case_.id)}
          onCheckedChange={(checked) => onSelectCase(case_.id, !!checked)}
        />
      </TableCell>
      <TableCell className="py-3 px-4">
        <div>
          <div className="font-medium">{case_.title}</div>
          {case_.description && (
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {case_.description}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="py-3 px-4">
        {case_.contact ? (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <div>
              <div className="font-medium text-sm">{case_.contact.name}</div>
              {case_.contact.email && (
                <div className="text-xs text-gray-500">{case_.contact.email}</div>
              )}
            </div>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">Sin cliente</span>
        )}
      </TableCell>
      <TableCell className="py-3 px-4">
        <Badge variant="outline" className={getStatusColor(case_.status)}>
          {getStatusLabel(case_.status)}
        </Badge>
      </TableCell>
      <TableCell className="py-3 px-4">
        <span className="text-sm">
          {case_.practice_area || 'No especificada'}
        </span>
      </TableCell>
      <TableCell className="py-3 px-4">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Calendar className="h-3 w-3" />
          {formatDate(case_.created_at)}
        </div>
      </TableCell>
      <TableCell className="w-[100px] py-3 px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/cases/${case_.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver detalles
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
              {case_.status === 'closed' ? 'Reabrir' : 'Archivar'}
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
  )

  const emptyState = (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-12 text-gray-500">
        No se encontraron expedientes
      </TableCell>
    </TableRow>
  )

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectAllState}
                onCheckedChange={(checked) => onSelectAll(!!checked)}
              />
            </TableHead>
            <TableHead>Expediente</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Área</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
      
      <div className="border-t">
        <VirtualList
          items={cases}
          itemHeight={73}
          containerHeight={600}
          threshold={25}
          renderItem={renderCaseRow}
          emptyState={
            <div className="flex justify-center py-12">
              <div className="text-center text-gray-500">
                No se encontraron expedientes
              </div>
            </div>
          }
          className="w-full"
        />
      </div>
    </div>
  )
}