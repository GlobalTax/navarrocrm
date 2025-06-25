
import { useState, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { useTasks } from '@/hooks/useTasks'
import { useFormCache } from '@/hooks/cache'

interface TaskFormData {
  title: string
  description: string
  priority: string
  status: string
  due_date: string
  start_date: string
  estimated_hours: number
  case_id: string
  client_id: string
  assigned_users: string[]
}

interface UseTaskFormProps {
  task?: any
  isOpen: boolean
  onClose: () => void
}

export const useTaskFormWithCache = ({ task, isOpen, onClose }: UseTaskFormProps) => {
  const { user } = useApp()
  const { createTask, updateTask, assignTask, isCreating, isUpdating } = useTasks()
  
  // Form cache with auto-save
  const formCache = useFormCache<TaskFormData>(`task_${task?.id || 'new'}`)

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    due_date: '',
    start_date: '',
    estimated_hours: 0,
    case_id: '',
    client_id: '',
    assigned_users: []
  })

  useEffect(() => {
    if (task) {
      // Editing existing task - load from task data
      const taskData = {
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        start_date: task.start_date ? task.start_date.split('T')[0] : '',
        estimated_hours: task.estimated_hours || 0,
        case_id: task.case_id || '',
        client_id: task.client_id || '',
        assigned_users: task.task_assignments?.map((assignment: any) => assignment.user_id) || []
      }
      setFormData(taskData)
    } else if (isOpen) {
      // New task - try to load from cache first
      const cachedData = formCache.loadFormData()
      if (cachedData) {
        console.log('📂 Restored form data from cache')
        setFormData(cachedData)
      } else {
        // Reset to default values
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          status: 'pending',
          due_date: '',
          start_date: '',
          estimated_hours: 0,
          case_id: '',
          client_id: '',
          assigned_users: []
        })
      }
    }
  }, [task, isOpen, formCache])

  const handleInputChange = (field: string, value: string | number | string[]) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    
    // Auto-save for new tasks only (not when editing existing tasks)
    if (!task) {
      formCache.saveFormData(newFormData)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const taskData = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority as any,
      status: formData.status as any,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      estimated_hours: Number(formData.estimated_hours),
      case_id: formData.case_id || null,
      client_id: formData.client_id || null,
      created_by: user?.id,
      org_id: user?.org_id
    }

    try {
      if (task) {
        // Actualizar tarea existente
        await updateTask({ id: task.id, ...taskData })
        
        // Gestionar asignaciones de usuarios para tarea existente
        if (formData.assigned_users.length > 0) {
          for (const userId of formData.assigned_users) {
            await assignTask({
              taskId: task.id,
              userId,
              assignedBy: user?.id || ''
            })
          }
        }
      } else {
        // Crear nueva tarea
        await createTask(taskData)
        
        // Clear the form cache after successful creation
        formCache.clearFormData()
        console.log('✅ Form cache cleared after successful task creation')
      }

      onClose()
    } catch (error) {
      console.error('Error al procesar la tarea:', error)
    }
  }

  // Check if there's saved form data
  const hasSavedData = formCache.hasSavedData()

  return {
    formData,
    handleInputChange,
    handleSubmit,
    isCreating,
    isUpdating,
    hasSavedData,
    clearSavedData: formCache.clearFormData
  }
}
