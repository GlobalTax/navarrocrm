
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

interface BulkAssignmentData {
  taskIds: string[]
  assignmentType: 'user' | 'team' | 'department'
  targetIds: string[]
  assignmentData?: Record<string, any>
}

export const useBulkTaskAssignment = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const bulkAssignMutation = useMutation({
    mutationFn: async (data: BulkAssignmentData) => {
      if (!user?.id || !user?.org_id) {
        throw new Error('Usuario no autenticado')
      }

      console.log('🔄 Iniciando asignación masiva:', data)

      // Registrar la operación de bulk assignment
      const { data: bulkRecord, error: bulkError } = await supabase
        .from('task_bulk_assignments')
        .insert({
          org_id: user.org_id,
          assigned_by: user.id,
          assignment_type: data.assignmentType,
          target_ids: data.targetIds,
          task_ids: data.taskIds,
          assignment_data: data.assignmentData || {}
        })
        .select()
        .single()

      if (bulkError) {
        console.error('❌ Error registrando bulk assignment:', bulkError)
        throw bulkError
      }

      // Obtener usuarios específicos según el tipo de asignación
      let userIds: string[] = []

      if (data.assignmentType === 'user') {
        userIds = data.targetIds
      } else if (data.assignmentType === 'team') {
        // Obtener miembros de equipos
        const { data: teamMembers, error: teamError } = await supabase
          .from('team_memberships')
          .select('user_id')
          .in('team_id', data.targetIds)
          .eq('is_active', true)

        if (teamError) throw teamError
        userIds = teamMembers.map(m => m.user_id)
      } else if (data.assignmentType === 'department') {
        // Obtener usuarios del departamento
        const { data: deptUsers, error: deptError } = await supabase
          .from('users')
          .select('id')
          .in('department_id', data.targetIds)

        if (deptError) throw deptError
        userIds = deptUsers.map(u => u.id)
      }

      // Crear asignaciones individuales
      const assignments = data.taskIds.flatMap(taskId =>
        userIds.map(userId => ({
          task_id: taskId,
          user_id: userId,
          assigned_by: user.id
        }))
      )

      if (assignments.length > 0) {
        const { error: assignError } = await supabase
          .from('task_assignments')
          .insert(assignments)

        if (assignError) {
          console.error('❌ Error creando asignaciones:', assignError)
          throw assignError
        }
      }

      console.log('✅ Asignación masiva completada:', {
        tasks: data.taskIds.length,
        users: userIds.length,
        assignments: assignments.length
      })

      return {
        bulkRecord,
        assignmentsCreated: assignments.length,
        usersAssigned: userIds.length
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success(
        `${result.assignmentsCreated} asignaciones creadas para ${result.usersAssigned} usuarios`
      )
    },
    onError: (error) => {
      console.error('❌ Error en asignación masiva:', error)
      toast.error('Error al realizar la asignación masiva')
    }
  })

  return {
    bulkAssign: bulkAssignMutation.mutateAsync,
    isAssigning: bulkAssignMutation.isPending
  }
}
