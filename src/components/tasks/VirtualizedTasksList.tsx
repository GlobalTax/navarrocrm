
import React, { useState, useCallback, useMemo } from 'react'
import { VirtualList } from '@/components/optimization/VirtualList'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Edit, Eye, Check, Trash2, MoreHorizontal, Calendar, ChevronUp, ChevronDown, Users } from 'lucide-react'
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import { BulkTaskAssignmentModal } from './BulkTaskAssignmentModal'

interface VirtualizedTasksListProps {
  tasks: any[]
  onEditTask: (task: any) => void
  hasNextPage?: boolean
  isLoading?: boolean
  onLoadMore?: () => void
}

export const VirtualizedTasksList = ({ 
  tasks, 
  onEditTask, 
  hasNextPage, 
  isLoading, 
  onLoadMore 
}: VirtualizedTasksListProps) => {
  const navigate = useNavigate()
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [isBulkAssignmentOpen, setIsBulkAssignmentOpen] = useState(false)

  const getPriorityBadge = useCallback((priority: string) => {
    switch (priority) {
      case 'high': return { color: 'bg-red-100 text-red-800 border-red-200', label: '🔴 Alta' }
      case 'medium': return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: '🟡 Media' }
      case 'low': return { color: 'bg-green-100 text-green-800 border-green-200', label: '🟢 Baja' }
      default: return { color: 'bg-gray-100 text-gray-800 border-gray-200', label: priority }
    }
  }, [])

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'completed': return { color: 'bg-green-100 text-green-800', label: 'Completada' }
      case 'in_progress': return { color: 'bg-blue-100 text-blue-800', label: 'En Curso' }
      case 'pending': return { color: 'bg-yellow-100 text-yellow-800', label: 'Por Hacer' }
      default: return { color: 'bg-gray-100 text-gray-800', label: status }
    }
  }, [])

  const formatSmartDate = useCallback((dateString: string | null) => {
    if (!dateString) return { text: 'Sin fecha', color: 'text-gray-400' }
    
    const date = new Date(dateString)
    const now = new Date()
    const isOverdue = date < now
    
    if (isToday(date)) return { text: 'Hoy', color: isOverdue ? 'text-red-600' : 'text-blue-600' }
    if (isTomorrow(date)) return { text: 'Mañana', color: 'text-green-600' }
    if (isThisWeek(date)) return { text: format(date, 'EEEE', { locale: es }), color: 'text-gray-600' }
    
    return { 
      text: format(date, 'dd/MM/yyyy', { locale: es }), 
      color: isOverdue ? 'text-red-600' : 'text-gray-600' 
    }
  }, [])

  const sortedTasks = useMemo(() => {
    if (!sortConfig) return tasks
    
    return [...tasks].sort((a, b) => {
      const { key, direction } = sortConfig
      const aValue = a[key]
      const bValue = b[key]
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1
      if (aValue > bValue) return direction === 'asc' ? 1 : -1
      return 0
    })
  }, [tasks, sortConfig])

  const handleSort = useCallback((key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [])

  const handleSelectAll = useCallback((checked: boolean) => {
    setSelectedTasks(checked ? tasks.map(task => task.id) : [])
  }, [tasks])

  const handleSelectTask = useCallback((taskId: string, checked: boolean) => {
    setSelectedTasks(current => 
      checked 
        ? [...current, taskId]
        : current.filter(id => id !== taskId)
    )
  }, [])

  const getSelectedTaskTitles = useCallback(() => {
    return selectedTasks.map(id => {
      const task = tasks.find(t => t.id === id)
      return task?.title || 'Tarea sin título'
    })
  }, [selectedTasks, tasks])

  const renderTaskItem = useCallback((task: any, index: number) => {
    const priorityBadge = getPriorityBadge(task.priority)
    const statusBadge = getStatusBadge(task.status)
    const smartDate = formatSmartDate(task.due_date)
    
    return (
      <div 
        key={task.id}
        className="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="flex items-center justify-center w-10">
          <Checkbox
            checked={selectedTasks.includes(task.id)}
            onCheckedChange={(checked) => handleSelectTask(task.id, !!checked)}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900">{task.title}</div>
          {task.description && (
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {task.description}
            </div>
          )}
        </div>
        
        <div className="w-24">
          <Badge className={statusBadge.color}>
            {statusBadge.label}
          </Badge>
        </div>
        
        <div className="w-24">
          <Badge className={priorityBadge.color}>
            {priorityBadge.label}
          </Badge>
        </div>
        
        <div className="flex items-center w-32">
          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
          <span className={`text-sm ${smartDate.color}`}>
            {smartDate.text}
          </span>
        </div>
        
        <div className="w-12">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/tasks/${task.id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditTask(task)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Check className="h-4 w-4 mr-2" />
                Completar
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }, [selectedTasks, handleSelectTask, getPriorityBadge, getStatusBadge, formatSmartDate, navigate, onEditTask])

  const getItemKey = useCallback((task: any, index: number) => task.id, [])

  const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <div 
      className="flex items-center space-x-1 cursor-pointer hover:bg-gray-100 p-2 rounded select-none"
      onClick={() => handleSort(column)}
    >
      <span className="font-semibold text-gray-900">{children}</span>
      {sortConfig?.key === column && (
        sortConfig.direction === 'asc' 
          ? <ChevronUp className="h-4 w-4" />
          : <ChevronDown className="h-4 w-4" />
      )}
    </div>
  )

  return (
    <>
      <div className="bg-white rounded-[10px] border border-gray-200">
        {selectedTasks.length > 0 && (
          <div className="border-b p-4 bg-blue-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">
                {selectedTasks.length} tarea(s) seleccionada(s)
              </span>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setIsBulkAssignmentOpen(true)}
                >
                  <Users className="h-4 w-4 mr-1" />
                  Asignar Masivamente
                </Button>
                <Button size="sm" variant="outline">
                  <Check className="h-4 w-4 mr-1" />
                  Completar
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-center w-10">
            <Checkbox
              checked={selectedTasks.length === tasks.length && tasks.length > 0}
              onCheckedChange={handleSelectAll}
            />
          </div>
          <div className="flex-1"><SortableHeader column="title">Tarea</SortableHeader></div>
          <div className="w-24"><SortableHeader column="status">Estado</SortableHeader></div>
          <div className="w-24"><SortableHeader column="priority">Prioridad</SortableHeader></div>
          <div className="w-32"><SortableHeader column="due_date">Vencimiento</SortableHeader></div>
          <div className="w-12 font-semibold text-gray-900">Acciones</div>
        </div>

        {/* Virtualized Content */}
        <VirtualList
          items={sortedTasks}
          renderItem={renderTaskItem}
          itemHeight={70}
          height={700}
          getItemKey={getItemKey}
          hasNextPage={hasNextPage}
          isLoading={isLoading}
          onLoadMore={onLoadMore}
          className="w-full"
        />
      </div>

      <BulkTaskAssignmentModal
        isOpen={isBulkAssignmentOpen}
        onClose={() => setIsBulkAssignmentOpen(false)}
        selectedTaskIds={selectedTasks}
        taskTitles={getSelectedTaskTitles()}
      />
    </>
  )
}
