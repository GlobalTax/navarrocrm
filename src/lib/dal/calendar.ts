import { BaseDAL } from './base'
import { supabase } from '@/integrations/supabase/client'
import { DALResponse, DALListResponse } from './types'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_datetime: string
  end_datetime: string
  event_type: 'meeting' | 'call' | 'deadline' | 'task' | 'other'
  location?: string
  status: 'scheduled' | 'cancelled' | 'completed'
  is_all_day: boolean
  reminder_minutes?: number
  contact_id?: string
  case_id?: string
  created_by: string
  org_id: string
  created_at?: string
  updated_at?: string
  // Outlook integration fields
  outlook_id?: string
  sync_status?: string
  outlook_meeting_url?: string
  sync_with_outlook: boolean
  attendees_emails?: string[]
}

export class CalendarDAL extends BaseDAL<CalendarEvent> {
  constructor() {
    super('calendar_events')
  }

  async findByDateRange(
    orgId: string,
    startDate: string,
    endDate: string
  ): Promise<DALListResponse<CalendarEvent>> {
    const query = supabase
      .from('calendar_events')
      .select('*', { count: 'exact' })
      .eq('org_id', orgId)
      .gte('start_datetime', startDate)
      .lte('start_datetime', endDate)
      .order('start_datetime', { ascending: true })
    
    return this.handleListResponse<CalendarEvent>(query)
  }

  async findByContact(contactId: string): Promise<DALListResponse<CalendarEvent>> {
    return this.findMany({
      filters: { contact_id: contactId },
      sort: [{ column: 'start_datetime', ascending: false }]
    })
  }

  async findByCase(caseId: string): Promise<DALListResponse<CalendarEvent>> {
    return this.findMany({
      filters: { case_id: caseId },
      sort: [{ column: 'start_datetime', ascending: false }]
    })
  }

  async findByUser(userId: string): Promise<DALListResponse<CalendarEvent>> {
    return this.findMany({
      filters: { created_by: userId },
      sort: [{ column: 'start_datetime', ascending: true }]
    })
  }

  async findUpcoming(
    orgId: string,
    limit: number = 10
  ): Promise<DALListResponse<CalendarEvent>> {
    const query = supabase
      .from('calendar_events')
      .select('*', { count: 'exact' })
      .eq('org_id', orgId)
      .gte('start_datetime', new Date().toISOString())
      .eq('status', 'scheduled')
      .order('start_datetime', { ascending: true })
      .limit(limit)
    
    return this.handleListResponse<CalendarEvent>(query)
  }

  async findConflicts(
    orgId: string,
    startDateTime: string,
    endDateTime: string,
    excludeEventId?: string
  ): Promise<DALListResponse<CalendarEvent>> {
    let query = supabase
      .from('calendar_events')
      .select('*', { count: 'exact' })
      .eq('org_id', orgId)
      .eq('status', 'scheduled')
      .or(`and(start_datetime.lte.${startDateTime},end_datetime.gte.${startDateTime}),and(start_datetime.lte.${endDateTime},end_datetime.gte.${endDateTime}),and(start_datetime.gte.${startDateTime},end_datetime.lte.${endDateTime})`)

    if (excludeEventId) {
      query = query.neq('id', excludeEventId)
    }
    
    return this.handleListResponse<CalendarEvent>(query)
  }

  async findPendingSync(orgId: string): Promise<DALListResponse<CalendarEvent>> {
    return this.findMany({
      filters: { 
        org_id: orgId, 
        sync_with_outlook: true,
        sync_status: 'pending'
      },
      sort: [{ column: 'created_at', ascending: true }]
    })
  }
}

// Singleton instance
export const calendarDAL = new CalendarDAL()

// Re-export CalendarEvent type for convenience
export type { CalendarEvent }