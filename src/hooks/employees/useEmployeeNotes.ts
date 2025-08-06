import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { EmployeeNote } from '@/types/features/employee-data'

export function useEmployeeNotes(employeeId: string) {
  return useQuery({
    queryKey: ['employee-notes', employeeId],
    queryFn: async () => {
      if (!employeeId) return []
      
      const { data, error } = await supabase
        .from('employee_notes')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as EmployeeNote[]
    },
    enabled: !!employeeId,
  })
}