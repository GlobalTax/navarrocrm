
import { useState, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { useTasks } from '@/hooks/useTasks'
import { TaskStatus, TaskPriority } from '@/hooks/tasks/types'
import { supabase } from '@/integrations/supabase/client'

interface TaskFormData {
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  due_date: string
  start_date: string
  estimated_hours: number
  case_id: string
  contact_id: string
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
    contact_id: '',
    assigned_users: []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (task && isOpen) {
      // Validar que el task tenga datos válidos
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: (task.priority in ['low', 'medium', 'high', 'urgent']) ? task.priority : 'medium',
        status: (task.status in ['pending', 'in_progress', 'completed', 'cancelled']) ? task.status : 'pending',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        start_date: task.start_date ? task.start_date.split('T')[0] : '',
        estimated_hours: Number(task.estimated_hours) || 0,
        case_id: task.case_id || '',
        contact_id: task.contact_id || '',
        assigned_users: task.task_assignments?.map((assignment: any) => assignment.user_id) || []
      })
    } else if (isOpen && !task) {
      // Reset para nueva tarea
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        due_date: '',
        start_date: '',
        estimated_hours: 0,
        case_id: '',
        contact_id: '',
        assigned_users: []
      })
    }
    
    // Limpiar errores al abrir/cerrar
    setErrors({})
  }, [task, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validaciones críticas
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio'
    }

    if (formData.title.length > 255) {
      newErrors.title = 'El título no puede exceder 255 caracteres'
    }

    if (formData.estimated_hours < 0) {
      newErrors.estimated_hours = 'Las horas estimadas no pueden ser negativas'
    }

    // Validar fechas
    if (formData.due_date && formData.start_date) {
      const startDate = new Date(formData.start_date)
      const dueDate = new Date(formData.due_date)
      
      if (dueDate < startDate) {
        newErrors.due_date = 'La fecha de vencimiento debe ser posterior a la fecha de inicio'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof TaskFormData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      console.error('❌ Errores de validación:', errors)
      return
    }

    if (!user?.id || !user?.org_id) {
      console.error('❌ Usuario no autenticado')
      setErrors({ general: 'Usuario no autenticado' })
      return
    }

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      status: formData.status,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      estimated_hours: Number(formData.estimated_hours) || 0,
      case_id: formData.case_id || null,
      contact_id: formData.contact_id || null,
      created_by: user.id,
      org_id: user.org_id
    }

    try {
      if (task?.id) {
        // Actualizar tarea existente
        await updateTask({ id: task.id, ...taskData })
        
        // Gestionar cambios en asignaciones para tarea existente
        if (formData.assigned_users.length > 0) {
          // Eliminar asignaciones existentes que no están en la nueva lista
          const currentAssignments = task.assignments || []
          const currentUserIds = currentAssignments.map(a => a.user_id)
          const newUserIds = formData.assigned_users
          
          // Usuarios a desasignar
          const toUnassign = currentUserIds.filter(userId => !newUserIds.includes(userId))
          for (const userId of toUnassign) {
            try {
              // Eliminar asignación directamente desde la tabla task_assignments
              const { error } = await supabase
                .from('task_assignments')
                .delete()
                .eq('task_id', task.id)
                .eq('user_id', userId)
              
              if (error) throw error
              console.log('✅ Usuario desasignado:', userId)
            } catch (error) {
              console.error('❌ Error desasignando usuario:', userId, error)
            }
          }
          
          // Usuarios a asignar (nuevos)
          const toAssign = newUserIds.filter(userId => !currentUserIds.includes(userId))
          for (const userId of toAssign) {
            try {
              await assignTask({
                taskId: task.id,
                userId,
                assignedBy: user.id
              })
              console.log('✅ Usuario asignado:', userId)
            } catch (error) {
              console.error('❌ Error asignando usuario:', userId, error)
            }
          }
        }
      } else {
        // Crear nueva tarea
        console.log('🔄 Creando nueva tarea:', taskData)
        const createdTask = await createTask(taskData)
        
        // Asignar usuarios a la nueva tarea
        if (formData.assigned_users.length > 0 && createdTask?.id) {
          console.log('🔄 Asignando usuarios a la nueva tarea:', formData.assigned_users)
          
          for (const userId of formData.assigned_users) {
            try {
              await assignTask({
                taskId: createdTask.id,
                userId,
                assignedBy: user.id
              })
              console.log('✅ Usuario asignado:', userId)
            } catch (error) {
              console.error('❌ Error asignando usuario:', userId, error)
            }
          }
        }
      }

      onClose()
    } catch (error) {
      console.error('❌ Error al procesar la tarea:', error)
      setErrors({ 
        general: error instanceof Error ? error.message : 'Error desconocido al procesar la tarea'
      })
    }
  }

  return {
    formData,
    errors,
    handleInputChange,
    handleSubmit,
    isCreating,
    isUpdating,
    isValid: Object.keys(errors).length === 0
  }
}
