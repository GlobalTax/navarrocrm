import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { useTeams, Department } from './useTeams'

export const useDepartments = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()
  const { departments, isLoading } = useTeams()

  // Update department mutation
  const updateDepartmentMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Department> & { id: string }) => {
      const { data, error } = await supabase
        .from('departments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      toast.success('Departamento actualizado exitosamente')
    },
    onError: (error) => {
      console.error('Error updating department:', error)
      toast.error('Error al actualizar el departamento')
    }
  })

  // Delete department mutation (soft delete)
  const deleteDepartmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('departments')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      toast.success('Departamento desactivado exitosamente')
    },
    onError: (error) => {
      console.error('Error deleting department:', error)
      toast.error('Error al desactivar el departamento')
    }
  })

  // Get employees count for each department
  const getDepartmentEmployeeCount = async (departmentId: string) => {
    const { count } = await supabase
      .from('employee_contracts')
      .select('*', { count: 'exact', head: true })
      .eq('department_id', departmentId)
      .eq('status', 'active')

    return count || 0
  }

  return {
    departments,
    isLoading,
    updateDepartment: updateDepartmentMutation.mutateAsync,
    deleteDepartment: deleteDepartmentMutation.mutateAsync,
    isUpdating: updateDepartmentMutation.isPending,
    isDeleting: deleteDepartmentMutation.isPending,
    getDepartmentEmployeeCount
  }
}