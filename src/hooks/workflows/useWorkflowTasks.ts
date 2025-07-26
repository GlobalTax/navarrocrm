
import { useApp } from '@/contexts/AppContext'
import { tasksDAL, type CreateTaskData } from '@/lib/dal'
import { TaskTemplate } from './types'

export const useWorkflowTasks = () => {
  const { user } = useApp()

  const createCaseWorkflowTasks = async (caseId: string, practiceArea: string) => {
    const taskTemplates: Record<string, TaskTemplate[]> = {
      'fiscal': [
        { description: 'Revisar documentación fiscal', priority: 'high', estimatedHours: 2 },
        { description: 'Preparar declaración', priority: 'medium', estimatedHours: 4 },
        { description: 'Revisión final y presentación', priority: 'high', estimatedHours: 1 }
      ],
      'laboral': [
        { description: 'Análisis de contrato laboral', priority: 'high', estimatedHours: 2 },
        { description: 'Preparar documentación legal', priority: 'medium', estimatedHours: 3 },
        { description: 'Seguimiento y cierre', priority: 'low', estimatedHours: 1 }
      ],
      'mercantil': [
        { description: 'Análisis de documentación societaria', priority: 'high', estimatedHours: 3 },
        { description: 'Preparar acuerdos', priority: 'medium', estimatedHours: 5 },
        { description: 'Tramitación registral', priority: 'high', estimatedHours: 2 }
      ]
    }

    const templates = taskTemplates[practiceArea] || taskTemplates.fiscal

    for (const template of templates) {
      if (!user?.org_id || !user?.id) {
        throw new Error('Usuario no autenticado')
      }
      
      const taskData: CreateTaskData = {
        title: template.description,
        description: template.description,
        case_id: caseId,
        priority: template.priority,
        estimated_hours: template.estimatedHours
      }
      
      const response = await tasksDAL.createTask(taskData, user.org_id, user.id)
      if (!response.success) {
        throw response.error || new Error(`Failed to create task: ${template.description}`)
      }
    }
  }

  return {
    createCaseWorkflowTasks
  }
}
