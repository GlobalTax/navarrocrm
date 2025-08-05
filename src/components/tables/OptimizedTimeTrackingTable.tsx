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
  Clock, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Play,
  Pause,
  Calendar,
  User,
  DollarSign,
  Timer
} from 'lucide-react'
import { OptimizedVirtualTable } from './OptimizedVirtualTable'
import { TableColumn } from '@/hooks/useVirtualTable'
import { BulkOperation } from '@/hooks/useBulkOperations'

// Assuming TimeEntry interface from time tracking feature
interface TimeEntry {
  id: string
  description: string
  hours: number
  billable: boolean
  status: 'running' | 'stopped' | 'completed'
  created_at: string
  updated_at: string
  user?: {
    id: string
    name: string
    email: string
  }
  case?: {
    id: string
    title: string
  }
  rate?: number
}

interface OptimizedTimeTrackingTableProps {
  timeEntries: TimeEntry[]
  onEditEntry: (entry: TimeEntry) => void
  onDeleteEntry: (entry: TimeEntry) => void
  onStartTimer: (entry: TimeEntry) => void
  onStopTimer: (entry: TimeEntry) => void
  selectedEntries: string[]
  onSelectEntry: (entryId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  isLoading?: boolean
  className?: string
}

export const OptimizedTimeTrackingTable: React.FC<OptimizedTimeTrackingTableProps> = ({
  timeEntries,
  onEditEntry,
  onDeleteEntry,
  onStartTimer,
  onStopTimer,
  selectedEntries,
  onSelectEntry,
  onSelectAll,
  isLoading = false,
  className
}) => {
  // Create selected rows set for performance
  const selectedRows = new Set(selectedEntries)

  // Table column definitions
  const columns: TableColumn<TimeEntry>[] = [
    {
      key: 'description',
      header: 'Descripción',
      accessor: 'description',
      sortable: true,
      width: '30%',
      render: (value, entry) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          {entry.case && (
            <div className="text-sm text-gray-500 mt-0.5">
              Expediente: {entry.case.title}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'user',
      header: 'Usuario',
      accessor: 'user',
      sortable: true,
      width: '20%',
      render: (user) => {
        if (!user) {
          return <span className="text-gray-400 text-sm">Usuario desconocido</span>
        }
        
        const getInitials = (name: string) => {
          return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        }

        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-gray-50 border border-gray-100">
              <AvatarFallback className="bg-gray-50 text-gray-700 text-xs font-medium">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm truncate">{user.name}</div>
              <div className="text-xs text-gray-500 truncate">{user.email}</div>
            </div>
          </div>
        )
      }
    },
    {
      key: 'hours',
      header: 'Horas',
      accessor: 'hours',
      sortable: true,
      width: '10%',
      render: (hours) => (
        <div className="flex items-center gap-1 text-sm font-mono">
          <Clock className="h-3 w-3 text-gray-400" />
          {hours.toFixed(2)}h
        </div>
      )
    },
    {
      key: 'billable',
      header: 'Facturable',
      accessor: 'billable',
      sortable: true,
      width: '10%',
      render: (billable) => (
        <Badge 
          variant="outline" 
          className={`border-0.5 rounded-[10px] ${
            billable 
              ? 'bg-green-100 text-green-800 border-green-200' 
              : 'bg-gray-100 text-gray-800 border-gray-200'
          }`}
        >
          {billable ? 'Sí' : 'No'}
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      accessor: 'status',
      sortable: true,
      width: '10%',
      render: (status) => {
        const getStatusConfig = (status: string) => {
          switch (status) {
            case 'running':
              return {
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                label: 'En curso',
                icon: Timer
              }
            case 'stopped':
              return {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                label: 'Pausado',
                icon: Pause
              }
            case 'completed':
              return {
                color: 'bg-green-100 text-green-800 border-green-200',
                label: 'Completado',
                icon: Clock
              }
            default:
              return {
                color: 'bg-gray-100 text-gray-800 border-gray-200',
                label: status,
                icon: Clock
              }
          }
        }

        const config = getStatusConfig(status)
        const IconComponent = config.icon

        return (
          <Badge 
            variant="outline" 
            className={`border-0.5 rounded-[10px] ${config.color}`}
          >
            <IconComponent className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        )
      }
    },
    {
      key: 'revenue',
      header: 'Ingresos',
      accessor: (entry) => entry.billable && entry.rate ? entry.hours * entry.rate : 0,
      sortable: true,
      width: '10%',
      render: (revenue) => (
        <div className="flex items-center gap-1 text-sm font-mono">
          <DollarSign className="h-3 w-3 text-gray-400" />
          {revenue > 0 ? `€${revenue.toFixed(2)}` : '-'}
        </div>
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
      width: '10%',
      render: (_, entry) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-0.5 border-black rounded-[10px]">
              {entry.status === 'stopped' && (
                <DropdownMenuItem onClick={() => onStartTimer(entry)}>
                  <Play className="mr-2 h-4 w-4" />
                  Reanudar
                </DropdownMenuItem>
              )}
              {entry.status === 'running' && (
                <DropdownMenuItem onClick={() => onStopTimer(entry)}>
                  <Pause className="mr-2 h-4 w-4" />
                  Pausar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEditEntry(entry)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDeleteEntry(entry)}
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
  const bulkOperations: BulkOperation<TimeEntry>[] = [
    {
      id: 'mark-billable',
      label: 'Marcar como facturable',
      icon: DollarSign,
      action: async (entries) => {
        // Implementation would update entries to billable=true
        console.log('Marking as billable:', entries.map(e => e.id))
      },
      disabled: (entries) => entries.every(e => e.billable)
    },
    {
      id: 'mark-non-billable',
      label: 'Marcar como no facturable',
      icon: Clock,
      action: async (entries) => {
        // Implementation would update entries to billable=false
        console.log('Marking as non-billable:', entries.map(e => e.id))
      },
      disabled: (entries) => entries.every(e => !e.billable)
    },
    {
      id: 'delete',
      label: 'Eliminar seleccionados',
      icon: Trash2,
      action: async (entries) => {
        for (const entry of entries) {
          await onDeleteEntry(entry)
        }
      },
      confirmMessage: '¿Estás seguro de que quieres eliminar las entradas de tiempo seleccionadas? Esta acción no se puede deshacer.',
      destructive: true
    }
  ]

  const keyExtractor = (entry: TimeEntry) => entry.id

  const handleRowClick = (entry: TimeEntry) => {
    onEditEntry(entry)
  }

  const handleRowSelect = (entry: TimeEntry, selected: boolean) => {
    onSelectEntry(entry.id, selected)
  }

  return (
    <OptimizedVirtualTable
      data={timeEntries}
      columns={columns}
      keyExtractor={keyExtractor}
      onRowClick={handleRowClick}
      onRowSelect={handleRowSelect}
      selectedRows={selectedRows}
      bulkOperations={bulkOperations}
      className={className}
      containerHeight={600}
      itemHeight={64}
      searchPlaceholder="Buscar entradas de tiempo..."
      enableSearch={true}
      enableBulkOperations={true}
      isLoading={isLoading}
      emptyState={
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Clock className="h-12 w-12 mb-4 text-gray-300" />
          <p className="text-lg font-medium">No hay entradas de tiempo</p>
          <p className="text-sm mt-1">Las entradas de tiempo aparecerán aquí cuando las registres</p>
        </div>
      }
    />
  )
}