
import { useState } from 'react'

interface TasksFilters {
  status: string
  priority: string
  assignee: string
  search: string
}

export const useTasksFilters = () => {
  const [filters, setFilters] = useState<TasksFilters>({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    search: ''
  })

  const statusOptions = [
    { label: 'Todos los estados', value: 'all' },
    { label: 'Pendiente', value: 'pending' },
    { label: 'En progreso', value: 'in_progress' },
    { label: 'Completada', value: 'completed' }
  ]

  const priorityOptions = [
    { label: 'Todas las prioridades', value: 'all' },
    { label: 'Baja', value: 'low' },
    { label: 'Media', value: 'medium' },
    { label: 'Alta', value: 'high' },
    { label: 'Urgente', value: 'urgent' }
  ]

  const hasActiveFilters = Boolean(
    filters.status !== 'all' || 
    filters.priority !== 'all' || 
    filters.assignee !== 'all' || 
    filters.search
  )

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      assignee: 'all',
      search: ''
    })
  }

  const filterTasks = (tasks: any[]) => {
    const safeTasks = Array.isArray(tasks) ? tasks : []
    
    return safeTasks.filter(task => {
      if (!task || !task.id) {
        console.warn('⚠️ Filtering out invalid task:', task)
        return false
      }

      if (filters.status !== 'all' && task.status !== filters.status) return false
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false
      if (filters.search && !task.title?.toLowerCase().includes(filters.search.toLowerCase())) return false
      return true
    })
  }

  return {
    filters,
    setFilters,
    statusOptions,
    priorityOptions,
    hasActiveFilters,
    handleClearFilters,
    filterTasks
  }
}
