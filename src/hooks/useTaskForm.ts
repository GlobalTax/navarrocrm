
import { useState, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { useTasks } from '@/hooks/useTasks'

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

export const useTaskForm = ({ task, isOpen, onClose }: UseTaskFormProps) => {
  const { user } = useApp()
  const { createTask, updateTask, assignTask, isCreating, isUpdating } = useTasks()

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
      setFormData({
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
      })
    } else {
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
  }, [task, isOpen])

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
      let taskId: string

      if (task) {
        // Actualizar tarea existente
        const updatedTask = await updateTask({ id: task.id, ...taskData })
        taskId = task.id
      } else {
        // Crear nueva tarea
        const newTask = await createTask(taskData)
        taskId = newTask?.id || task?.id
      }

      // Gestionar asignaciones de usuarios
      if (taskId && formData.assigned_users.length > 0) {
        for (const userId of formData.assigned_users) {
          await assignTask({
            taskId,
            userId,
            assignedBy: user?.id || ''
          })
        }
      }

      onClose()
    } catch (error) {
      console.error('Error al procesar la tarea:', error)
    }
  }

  return {
    formData,
    handleInputChange,
    handleSubmit,
    isCreating,
    isUpdating
  }
}
