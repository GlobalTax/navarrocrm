
import React, { useCallback, useMemo } from 'react'
import { VirtualList } from '@/components/optimization/VirtualList'
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
  hasNextPage?: boolean
  isLoading?: boolean
  onLoadMore?: () => void
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
  onSelectAll,
  hasNextPage,
  isLoading,
  onLoadMore
}) => {
  const navigate = useNavigate()
  
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'on_hold': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }, [])

  const getStatusLabel = useCallback((status: string) => {
    switch (status) {
      case 'open': return 'Abierto'
      case 'on_hold': return 'En Espera'
      case 'closed': return 'Cerrado'
      default: return status
    }
  }, [])

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }, [])

  const renderCaseItem = useCallback((case_: Case, index: number) => (
    <div 
      key={case_.id}
      className="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
    >
      <div className="flex items-center justify-center w-10">
        <Checkbox
          checked={selectedCases.includes(case_.id)}
          onCheckedChange={(checked) => onSelectCase(case_.id, !!checked)}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900">{case_.title}</div>
        {case_.description && (
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {case_.description}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 w-32">
        {case_.contact ? (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <div className="min-w-0">
              <div className="font-medium text-sm truncate">{case_.contact.name}</div>
              {case_.contact.email && (
                <div className="text-xs text-gray-500 truncate">{case_.contact.email}</div>
              )}
            </div>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">Sin cliente</span>
        )}
      </div>
      
      <div className="w-24">
        <Badge variant="outline" className={getStatusColor(case_.status)}>
          {getStatusLabel(case_.status)}
        </Badge>
      </div>
      
      <div className="w-32 text-sm text-gray-600">
        {case_.practice_area || 'No especificada'}
      </div>
      
      <div className="flex items-center gap-1 text-sm text-gray-500 w-24">
        <Calendar className="h-3 w-3" />
        {formatDate(case_.created_at)}
      </div>
      
      <div className="w-12">
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
      </div>
    </div>
  ), [selectedCases, onSelectCase, onEditCase, onDeleteCase, onArchiveCase, onStagesView, navigate, getStatusColor, getStatusLabel, formatDate])

  const getItemKey = useCallback((case_: Case, index: number) => case_.id, [])

  // Header con selección masiva
  const allSelected = cases.length > 0 && selectedCases.length === cases.length
  const someSelected = selectedCases.length > 0 && selectedCases.length < cases.length
  const selectAllState = allSelected ? true : someSelected ? 'indeterminate' : false

  return (
    <div className="border border-gray-200 rounded-[10px] bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-center w-10">
          <Checkbox
            checked={selectAllState}
            onCheckedChange={(checked) => onSelectAll(!!checked)}
          />
        </div>
        <div className="flex-1 font-semibold text-gray-900">Expediente</div>
        <div className="w-32 font-semibold text-gray-900">Cliente</div>
        <div className="w-24 font-semibold text-gray-900">Estado</div>
        <div className="w-32 font-semibold text-gray-900">Área</div>
        <div className="w-24 font-semibold text-gray-900">Fecha</div>
        <div className="w-12 font-semibold text-gray-900">Acciones</div>
      </div>

      {/* Virtualized Content */}
      {cases.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No se encontraron expedientes
        </div>
      ) : (
        <VirtualList
          items={cases}
          renderItem={renderCaseItem}
          itemHeight={90}
          height={500}
          getItemKey={getItemKey}
          hasNextPage={hasNextPage}
          isLoading={isLoading}
          onLoadMore={onLoadMore}
          className="w-full"
        />
      )}
    </div>
  )
}
