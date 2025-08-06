import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { EmployeeTraining } from '@/types/features/employee-data'

export function useEmployeeTraining(employeeId: string) {
  return useQuery({
    queryKey: ['employee-training', employeeId],
    queryFn: async () => {
      if (!employeeId) return []
      
      const { data, error } = await supabase
        .from('employee_training')
        .select('*')
        .eq('employee_id', employeeId)
        .order('start_date', { ascending: false })
      
      if (error) throw error
      return data as EmployeeTraining[]
    },
    enabled: !!employeeId,
  })
}