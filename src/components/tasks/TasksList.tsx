import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Edit, Eye, Check, Trash2, MoreHorizontal, Calendar, ChevronUp, ChevronDown, Users } from 'lucide-react'
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import { BulkTaskAssignmentModal } from './BulkTaskAssignmentModal'

interface TasksListProps {
  tasks: any[]
  onEditTask: (task: any) => void
}

export const TasksList = ({ tasks, onEditTask }: TasksListProps) => {
  const navigate = useNavigate()
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [isBulkAssignmentOpen, setIsBulkAssignmentOpen] = useState(false)

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return { color: 'bg-red-100 text-red-800 border-red-200', label: '🔴 Alta' }
      case 'medium': return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: '🟡 Media' }
      case 'low': return { color: 'bg-green-100 text-green-800 border-green-200', label: '🟢 Baja' }
      default: return { color: 'bg-gray-100 text-gray-800 border-gray-200', label: priority }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return { color: 'bg-green-100 text-green-800', label: 'Completada' }
      case 'in_progress': return { color: 'bg-blue-100 text-blue-800', label: 'En Curso' }
      case 'pending': return { color: 'bg-yellow-100 text-yellow-800', label: 'Por Hacer' }
      default: return { color: 'bg-gray-100 text-gray-800', label: status }
    }
  }

  const formatSmartDate = (dateString: string | null) => {
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
  }

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (!sortConfig) return 0
    
    const { key, direction } = sortConfig
    const aValue = a[key]
    const bValue = b[key]
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1
    if (aValue > bValue) return direction === 'asc' ? 1 : -1
    return 0
  })

  const handleSelectAll = (checked: boolean) => {
    setSelectedTasks(checked ? tasks.map(task => task.id) : [])
  }

  const handleSelectTask = (taskId: string, checked: boolean) => {
    setSelectedTasks(current => 
      checked 
        ? [...current, taskId]
        : current.filter(id => id !== taskId)
    )
  }

  const getSelectedTaskTitles = () => {
    return selectedTasks.map(id => {
      const task = tasks.find(t => t.id === id)
      return task?.title || 'Tarea sin título'
    })
  }

  const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-gray-50 select-none"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortConfig?.key === column && (
          sortConfig.direction === 'asc' 
            ? <ChevronUp className="h-4 w-4" />
            : <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </TableHead>
  )

  return (
    <>
      <div className="bg-white rounded-[10px] border-0.5 border-black shadow-sm animate-fade-in">
        {selectedTasks.length > 0 && (
          <div className="border-b-0.5 border-black/10 p-4 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-black">
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
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedTasks.length === tasks.length && tasks.length > 0}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
              </TableHead>
              <SortableHeader column="title">Tarea</SortableHeader>
              <SortableHeader column="status">Estado</SortableHeader>
              <SortableHeader column="priority">Prioridad</SortableHeader>
              <SortableHeader column="due_date">Vencimiento</SortableHeader>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.map((task) => {
              const priorityBadge = getPriorityBadge(task.priority)
              const statusBadge = getStatusBadge(task.status)
              const smartDate = formatSmartDate(task.due_date)
              
              return (
                <TableRow key={task.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Checkbox
                      checked={selectedTasks.includes(task.id)}
                      onCheckedChange={(checked) => handleSelectTask(task.id, !!checked)}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <div>
                      <div className="font-medium text-black">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-black/60 truncate max-w-xs">
                          {task.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline" className="border-0.5 border-black rounded-[10px]">
                      {statusBadge.label}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline" className="border-0.5 border-black rounded-[10px]">
                      {priorityBadge.label}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      <span className={`text-sm ${smartDate.color}`}>
                        {smartDate.text}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
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
