import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export interface OrgChartDepartment {
  department_id: string
  department_name: string
  department_color: string | null
  manager_user_id: string | null
  manager_name: string | null
  manager_avatar: string | null
  teams: Array<{
    id: string
    name: string
    team_lead_id: string | null
    team_lead_name: string | null
    members_count: number
  }>
  employees_count: number
}

export function useOrgChart() {
  const { user } = useApp()

  const query = useQuery<{ data: OrgChartDepartment[]; restricted: boolean }, Error>({
    queryKey: ['org-chart', user?.id, user?.role, user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return { data: [], restricted: false }

      // Base query to the security-invoker view (RLS filters by org via underlying tables)
      let viewQuery = supabase.from('v_department_org_chart').select('*')

      let restricted = false

      // If not partner nor area_manager, limit to user's department
      if (user.role !== 'partner' && user.role !== 'area_manager') {
        restricted = true
        const { data: me, error: meErr } = await supabase
          .from('users')
          .select('department_id')
          .eq('id', user.id)
          .maybeSingle()
        if (meErr) throw meErr
        const deptId = (me as any)?.department_id as string | null
        if (!deptId) {
          // No department assigned -> no access
          return { data: [], restricted }
        }
        viewQuery = viewQuery.eq('department_id', deptId)
      }

      const { data, error } = await viewQuery
      if (error) throw error

      return { data: (data || []) as OrgChartDepartment[], restricted }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const flatDepartments = useMemo(() => query.data?.data ?? [], [query.data])

  return {
    data: flatDepartments,
    restricted: query.data?.restricted ?? false,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
