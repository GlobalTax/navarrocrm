import { BaseDAL } from './base'
import { supabase } from '@/integrations/supabase/client'
import { DALResponse, DALListResponse } from './types'

export interface TimeEntry {
  id: string
  description: string
  duration_minutes: number
  hourly_rate?: number
  is_billable: boolean
  entry_type: 'billable' | 'office_admin' | 'business_development' | 'internal'
  case_id?: string
  task_id?: string
  contact_id?: string
  user_id: string
  org_id: string
  date: string
  start_time?: string
  end_time?: string
  invoice_id?: string
  status: 'draft' | 'submitted' | 'approved' | 'invoiced'
  created_at?: string
  updated_at?: string
}

export interface TimeReport {
  user_id: string
  user_name: string
  total_hours: number
  billable_hours: number
  non_billable_hours: number
  total_revenue: number
  period_start: string
  period_end: string
}

export class TimeEntriesDAL extends BaseDAL<TimeEntry> {
  constructor() {
    super('time_entries')
  }

  async findByUser(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<DALListResponse<TimeEntry>> {
    let filters: any = { user_id: userId }
    
    if (startDate && endDate) {
      const query = supabase
        .from('time_entries')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
      
      return this.handleListResponse<TimeEntry>(query)
    }

    return this.findMany({
      filters,
      sort: [{ column: 'date', ascending: false }]
    })
  }

  async findByCase(caseId: string): Promise<DALListResponse<TimeEntry>> {
    return this.findMany({
      filters: { case_id: caseId },
      sort: [{ column: 'date', ascending: false }]
    })
  }

  async findByDateRange(
    orgId: string,
    startDate: string,
    endDate: string
  ): Promise<DALListResponse<TimeEntry>> {
    const query = supabase
      .from('time_entries')
      .select('*', { count: 'exact' })
      .eq('org_id', orgId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
    
    return this.handleListResponse<TimeEntry>(query)
  }

  async findBillable(
    orgId: string,
    startDate?: string,
    endDate?: string
  ): Promise<DALListResponse<TimeEntry>> {
    let query = supabase
      .from('time_entries')
      .select('*', { count: 'exact' })
      .eq('org_id', orgId)
      .eq('is_billable', true)

    if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate)
    }
    
    query = query.order('date', { ascending: false })
    
    return this.handleListResponse<TimeEntry>(query)
  }

  async findUnbilled(orgId: string): Promise<DALListResponse<TimeEntry>> {
    return this.findMany({
      filters: { 
        org_id: orgId, 
        is_billable: true,
        invoice_id: null,
        status: 'approved'
      },
      sort: [{ column: 'date', ascending: false }]
    })
  }

  // TODO: Implement when RPC function exists
  async generateTimeReport(
    orgId: string,
    startDate: string,
    endDate: string,
    userId?: string
  ): Promise<DALListResponse<TimeReport>> {
    // Placeholder - implement when RPC exists
    return { data: [], error: null, success: true, count: 0 }
  }

  async getMonthlyStats(
    orgId: string,
    month: number,
    year: number
  ): Promise<DALResponse<any>> {
    const query = supabase.rpc('get_monthly_time_stats', {
      org_uuid: orgId,
      target_month: month,
      target_year: year
    })
    
    return this.handleResponse(query)
  }

  // TODO: Implement when RPC function exists
  async getUserUtilization(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<DALResponse<any>> {
    // Placeholder - implement when RPC exists
    return { data: null, error: null, success: true }
  }

  async bulkUpdateStatus(
    timeEntryIds: string[],
    status: string
  ): Promise<DALResponse<TimeEntry[]>> {
    const query = supabase
      .from('time_entries')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', timeEntryIds)
      .select()
    
    return this.handleResponse<TimeEntry[]>(query)
  }
}

// Singleton instance
export const timeEntriesDAL = new TimeEntriesDAL()