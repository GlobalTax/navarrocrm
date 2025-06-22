
import { supabase } from '@/integrations/supabase/client'
import type { SeedTask } from './types'

export const createTasks = async (orgId: string, cases: any[], clients: any[], users: any[]) => {
  const legalTasks: SeedTask[] = [
    // Tareas para el caso de construcción
    {
      title: 'Revisión contrato de obra principal',
      description: 'Análisis detallado de cláusulas contractuales y identificación de incumplimientos por parte del contratista principal.',
      case_id: cases[0].id,
      client_id: clients[0].id,
      status: 'completed',
      priority: 'high',
      due_date: '2024-06-15T00:00:00.000Z',
      estimated_hours: 8,
      created_by: users[0].id,
      org_id: orgId
    },
    {
      title: 'Redacción escrito de demanda',
      description: 'Preparación de demanda por incumplimiento contractual y reclamación de daños por importe de 250.000€.',
      case_id: cases[0].id,
      client_id: clients[0].id,
      status: 'in_progress',
      priority: 'urgent',
      due_date: '2024-06-25T00:00:00.000Z',
      estimated_hours: 12,
      created_by: users[0].id,
      org_id: orgId
    },
    {
      title: 'Presentación demanda en Juzgado',
      description: 'Presentación de demanda en el Juzgado de Primera Instancia nº 3 de Valencia.',
      case_id: cases[0].id,
      client_id: clients[0].id,
      status: 'pending',
      priority: 'urgent',
      due_date: '2024-06-30T00:00:00.000Z',
      estimated_hours: 2,
      created_by: users[0].id,
      org_id: orgId
    },

    // Tareas para el divorcio
    {
      title: 'Inventario bienes gananciales',
      description: 'Elaboración de inventario completo de bienes gananciales para la liquidación del régimen económico matrimonial.',
      case_id: cases[1].id,
      client_id: clients[1].id,
      status: 'in_progress',
      priority: 'medium',
      due_date: '2024-07-10T00:00:00.000Z',
      estimated_hours: 6,
      created_by: users[1].id,
      org_id: orgId
    },
    {
      title: 'Propuesta convenio regulador',
      description: 'Redacción de propuesta de convenio regulador incluyendo custodia compartida y uso de vivienda familiar.',
      case_id: cases[1].id,
      client_id: clients[1].id,
      status: 'in_progress',
      priority: 'high',
      due_date: '2024-07-05T00:00:00.000Z',
      estimated_hours: 10,
      created_by: users[1].id,
      org_id: orgId
    },

    // Tareas mercantiles
    {
      title: 'Due diligence societario',
      description: 'Revisión completa de la estructura societaria actual y identificación de contingencias legales.',
      case_id: cases[2].id,
      client_id: clients[2].id,
      status: 'in_progress',
      priority: 'high',
      due_date: '2024-07-20T00:00:00.000Z',
      estimated_hours: 15,
      created_by: users[0].id,
      org_id: orgId
    },
    {
      title: 'Redacción estatutos nueva sociedad',
      description: 'Preparación de estatutos sociales para la nueva filial del grupo, adaptados a la actividad específica.',
      case_id: cases[2].id,
      client_id: clients[2].id,
      status: 'pending',
      priority: 'medium',
      due_date: '2024-07-25T00:00:00.000Z',
      estimated_hours: 8,
      created_by: users[1].id,
      org_id: orgId
    },

    // Tareas laborales  
    {
      title: 'Análisis expediente disciplinario',
      description: 'Revisión del expediente disciplinario y evaluación de las causas alegadas para el despido.',
      case_id: cases[3].id,
      client_id: clients[3].id,
      status: 'completed',
      priority: 'urgent',
      due_date: '2024-06-10T00:00:00.000Z',
      estimated_hours: 4,
      created_by: users[2].id,
      org_id: orgId
    },
    {
      title: 'Demanda ante Juzgado Social',
      description: 'Presentación de demanda por despido improcedente ante el Juzgado de lo Social nº 2 de Sevilla.',
      case_id: cases[3].id,
      client_id: clients[3].id,
      status: 'in_progress',
      priority: 'urgent',
      due_date: '2024-06-28T00:00:00.000Z',
      estimated_hours: 3,
      created_by: users[2].id,
      org_id: orgId
    },
    
    // Tareas tributarias
    {
      title: 'Planificación fiscal 2024',
      description: 'Desarrollo de estrategia fiscal integral para optimización tributaria de la startup tecnológica.',
      case_id: cases[4].id,
      client_id: clients[4].id,
      status: 'in_progress',
      priority: 'medium',
      due_date: '2024-08-15T00:00:00.000Z',
      estimated_hours: 20,
      created_by: users[0].id,
      org_id: orgId
    },
    {
      title: 'Revisión contratos proveedores',
      description: 'Análisis fiscal de contratos con proveedores tecnológicos internacionales y implicaciones del IVA.',
      case_id: cases[4].id,
      client_id: clients[4].id,
      status: 'pending',
      priority: 'low',
      due_date: '2024-08-30T00:00:00.000Z',
      estimated_hours: 12,
      created_by: users[1].id,
      org_id: orgId
    },

    // Tareas urgentes y críticas
    {
      title: 'Vista oral Audiencia Provincial',
      description: 'URGENTE: Comparecencia en vista de apelación el próximo lunes. Preparación de alegatos orales.',
      case_id: cases[0].id,
      client_id: clients[0].id,
      status: 'in_progress',
      priority: 'urgent',
      due_date: '2024-06-24T00:00:00.000Z',
      estimated_hours: 6,
      created_by: users[0].id,
      org_id: orgId
    },
    {
      title: 'Recurso contencioso-administrativo',
      description: 'PLAZO CRÍTICO: Presentación de recurso contra resolución sancionadora. Vence el viernes.',
      case_id: cases[4].id,
      client_id: clients[4].id,
      status: 'in_progress',
      priority: 'urgent',
      due_date: '2024-06-21T00:00:00.000Z',
      estimated_hours: 8,
      created_by: users[0].id,
      org_id: orgId
    }
  ]

  const { data: createdTasks } = await supabase
    .from('tasks')
    .insert(legalTasks)
    .select()

  return createdTasks || []
}

export const createTaskAssignments = async (tasks: any[], users: any[]) => {
  if (tasks.length === 0 || users.length === 0) return

  const taskAssignments = tasks.map((task, index) => ({
    task_id: task.id,
    user_id: users[index % users.length].id,
    assigned_by: users[0].id,
    role: 'assignee'
  }))

  await supabase
    .from('task_assignments')
    .insert(taskAssignments)
}
