import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { EmployeeEvaluation } from '@/types/features/employee-data'

export function useEmployeeEvaluations(employeeId: string) {
  return useQuery({
    queryKey: ['employee-evaluations', employeeId],
    queryFn: async () => {
      if (!employeeId) return []
      
      const { data, error } = await supabase
        .from('employee_evaluations')
        .select('*')
        .eq('employee_id', employeeId)
        .order('evaluation_period_start', { ascending: false })
      
      if (error) throw error
      return data as EmployeeEvaluation[]
    },
    enabled: !!employeeId,
  })
}