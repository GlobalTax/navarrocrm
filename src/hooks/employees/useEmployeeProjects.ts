import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { EmployeeProject } from '@/types/features/employee-data'

export function useEmployeeProjects(employeeId: string) {
  return useQuery({
    queryKey: ['employee-projects', employeeId],
    queryFn: async () => {
      if (!employeeId) return []
      
      const { data, error } = await supabase
        .from('employee_projects')
        .select('*')
        .eq('employee_id', employeeId)
        .order('start_date', { ascending: false })
      
      if (error) throw error
      return data as EmployeeProject[]
    },
    enabled: !!employeeId,
  })
}