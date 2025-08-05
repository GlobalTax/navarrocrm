import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  User,
  Building
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Case } from '@/features/cases'
import { OptimizedVirtualTable } from './OptimizedVirtualTable'
import { TableColumn } from '@/hooks/useVirtualTable'
import { BulkOperation } from '@/hooks/useBulkOperations'

interface OptimizedCaseTableProps {
  cases: Case[]
  onViewCase: (case_: Case) => void
  onEditCase: (case_: Case) => void
  onDeleteCase: (case_: Case) => void
  onArchiveCase: (case_: Case) => void
  onStagesView?: (case_: Case) => void
  selectedCases: string[]
  onSelectCase: (caseId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  isLoading?: boolean
  className?: string
}

export const OptimizedCaseTable: React.FC<OptimizedCaseTableProps> = ({
  cases,
  onViewCase,
  onEditCase,
  onDeleteCase,
  onArchiveCase,
  onStagesView,
  selectedCases,
  onSelectCase,
  onSelectAll,
  isLoading = false,
  className
}) => {
  const navigate = useNavigate()

  // Create selected rows set for performance
  const selectedRows = new Set(selectedCases)

  // Table column definitions
  const columns: TableColumn<Case>[] = [
    {
      key: 'title',
      header: 'Expediente',
      accessor: 'title',
      sortable: true,
      width: '30%',
      render: (value, case_) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          {case_.description && (
            <div className="text-sm text-gray-500 truncate max-w-xs mt-0.5">
              {case_.description}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Cliente',
      accessor: 'contact',
      sortable: true,
      width: '25%',
      render: (contact) => {
        if (!contact) {
          return <span className="text-gray-400 text-sm">Sin cliente</span>
        }
        
        const getInitials = (name: string) => {
          return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        }

        const getClientTypeIcon = (type: string | null) => {
          switch (type) {
            case 'empresa':
              return <Building className="h-3 w-3" />
            default:
              return <User className="h-3 w-3" />
          }
        }

        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-gray-50 border border-gray-100">
              <AvatarFallback className="bg-gray-50 text-gray-700 text-xs font-medium">
                {getInitials(contact.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                {getClientTypeIcon(contact.client_type)}
                <div className="font-medium text-sm truncate">{contact.name}</div>
              </div>
              {contact.email && (
                <div className="text-xs text-gray-500 truncate">{contact.email}</div>
              )}
            </div>
          </div>
        )
      }
    },
    {
      key: 'status',
      header: 'Estado',
      accessor: 'status',
      sortable: true,
      width: '15%',
      render: (status) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'open':
              return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'on_hold':
              return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'closed':
              return 'bg-green-100 text-green-800 border-green-200'
            default:
              return 'bg-gray-100 text-gray-800 border-gray-200'
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

        return (
          <Badge 
            variant="outline" 
            className={`border-0.5 rounded-[10px] ${getStatusColor(status)}`}
          >
            {getStatusLabel(status)}
          </Badge>
        )
      }
    },
    {
      key: 'practice_area',
      header: 'Área',
      accessor: 'practice_area',
      sortable: true,
      width: '15%',
      render: (area) => (
        <span className="text-sm text-gray-700">
          {area || 'No especificada'}
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'Fecha',
      accessor: 'created_at',
      sortable: true,
      width: '10%',
      render: (date) => (
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Calendar className="h-3 w-3" />
          {new Date(date).toLocaleDateString('es-ES')}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      accessor: () => '',
      width: '5%',
      render: (_, case_) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-0.5 border-black rounded-[10px]">
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
      )
    }
  ]

  // Bulk operations
  const bulkOperations: BulkOperation<Case>[] = [
    {
      id: 'archive',
      label: 'Archivar seleccionados',
      icon: Archive,
      action: async (cases) => {
        for (const case_ of cases) {
          await onArchiveCase(case_)
        }
      },
      confirmMessage: '¿Estás seguro de que quieres archivar los expedientes seleccionados?'
    },
    {
      id: 'delete',
      label: 'Eliminar seleccionados',
      icon: Trash2,
      action: async (cases) => {
        for (const case_ of cases) {
          await onDeleteCase(case_)
        }
      },
      confirmMessage: '¿Estás seguro de que quieres eliminar los expedientes seleccionados? Esta acción no se puede deshacer.',
      destructive: true
    }
  ]

  const keyExtractor = (case_: Case) => case_.id

  const handleRowClick = (case_: Case) => {
    onViewCase(case_)
  }

  const handleRowSelect = (case_: Case, selected: boolean) => {
    onSelectCase(case_.id, selected)
  }

  return (
    <OptimizedVirtualTable
      data={cases}
      columns={columns}
      keyExtractor={keyExtractor}
      onRowClick={handleRowClick}
      onRowSelect={handleRowSelect}
      selectedRows={selectedRows}
      bulkOperations={bulkOperations}
      className={className}
      containerHeight={600}
      itemHeight={72}
      searchPlaceholder="Buscar expedientes..."
      enableSearch={true}
      enableBulkOperations={true}
      isLoading={isLoading}
      emptyState={
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <ListChecks className="h-12 w-12 mb-4 text-gray-300" />
          <p className="text-lg font-medium">No hay expedientes</p>
          <p className="text-sm mt-1">Los expedientes aparecerán aquí cuando los crees</p>
        </div>
      }
    />
  )
}