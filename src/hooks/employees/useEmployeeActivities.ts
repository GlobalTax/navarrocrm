import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { EmployeeActivity } from '@/types/features/employee-data'

export function useEmployeeActivities(employeeId: string) {
  return useQuery({
    queryKey: ['employee-activities', employeeId],
    queryFn: async () => {
      if (!employeeId) return []
      
      const { data, error } = await supabase
        .from('employee_activities')
        .select(`
          *,
          activity_type:activity_types(*)
        `)
        .eq('employee_id', employeeId)
        .order('activity_date', { ascending: false })
      
      if (error) throw error
      return data as EmployeeActivity[]
    },
    enabled: !!employeeId,
  })
}