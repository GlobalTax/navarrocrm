import { BaseDAL } from './base'
import { supabase } from '@/integrations/supabase/client'
import { DALResponse, DALListResponse } from './types'

export interface Case {
  id: string
  title: string
  description?: string
  status: 'open' | 'on_hold' | 'closed'
  contact_id: string
  practice_area?: string
  responsible_solicitor_id?: string
  originating_solicitor_id?: string
  billing_method: 'hourly' | 'fixed' | 'contingency' | 'retainer'
  estimated_budget?: number
  matter_number?: string
  date_opened?: string
  date_closed?: string
  org_id: string
  created_at?: string
  updated_at?: string
}

export class CasesDAL extends BaseDAL<Case> {
  constructor() {
    super('cases')
  }

  async findByStatus(
    orgId: string, 
    status: string
  ): Promise<DALListResponse<Case>> {
    return this.findMany({
      filters: { org_id: orgId, status },
      sort: [{ column: 'created_at', ascending: false }]
    })
  }

  async findByContact(contactId: string): Promise<DALListResponse<Case>> {
    return this.findMany({
      filters: { contact_id: contactId },
      sort: [{ column: 'created_at', ascending: false }]
    })
  }

  async findBySolicitor(solicitorId: string): Promise<DALListResponse<Case>> {
    const query = supabase
      .from('cases')
      .select('*', { count: 'exact' })
      .or(`responsible_solicitor_id.eq.${solicitorId},originating_solicitor_id.eq.${solicitorId}`)
      .order('created_at', { ascending: false })
    
    return this.handleListResponse<Case>(query)
  }

  async findWithDetails(id: string): Promise<DALResponse<any>> {
    const query = supabase
      .from('cases')
      .select(`
        *,
        contacts!cases_contact_id_fkey (
          id, name, email, phone
        ),
        responsible_solicitor:users!cases_responsible_solicitor_id_fkey (
          id, first_name, last_name, email
        ),
        tasks (
          id, title, status, due_date
        )
      `)
      .eq('id', id)
      .single()
    
    return this.handleResponse(query)
  }

  async searchCases(
    orgId: string, 
    searchTerm: string
  ): Promise<DALListResponse<Case>> {
    if (!searchTerm || searchTerm.length < 2) {
      return {
        data: [],
        error: new Error('Search term must be at least 2 characters'),
        success: false,
        count: 0
      }
    }

    const query = supabase
      .from('cases')
      .select('*', { count: 'exact' })
      .eq('org_id', orgId)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,matter_number.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
    
    return this.handleListResponse<Case>(query)
  }

  async generateMatterNumber(orgId: string): Promise<DALResponse<string>> {
    const query = supabase.rpc('generate_matter_number', { org_uuid: orgId })
    return this.handleResponse<string>(query)
  }
}

// Singleton instance
export const casesDAL = new CasesDAL()