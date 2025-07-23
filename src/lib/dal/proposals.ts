
import { BaseDAL } from './base'
import { supabase } from '@/integrations/supabase/client'
import { DALResponse, DALListResponse } from './types'

export interface Proposal {
  id: string
  title: string
  description?: string
  total_amount: number
  status: string
  contact_id: string
  org_id: string
  created_at?: string
  updated_at?: string
  // ... otros campos según tu esquema
}

export class ProposalsDAL extends BaseDAL<Proposal> {
  constructor() {
    super('proposals')
  }

  async findByStatus(
    orgId: string, 
    status: string
  ): Promise<DALListResponse<Proposal>> {
    return this.findMany({
      filters: { org_id: orgId, status },
      sort: [{ column: 'created_at', ascending: false }]
    })
  }

  async findByContact(contactId: string): Promise<DALListResponse<Proposal>> {
    return this.findMany({
      filters: { contact_id: contactId },
      sort: [{ column: 'created_at', ascending: false }]
    })
  }

  async getProposalWithLineItems(id: string): Promise<DALResponse<any>> {
    const query = supabase
      .from(this.tableName)
      .select(`
        *,
        proposal_line_items (*)
      `)
      .eq('id', id)
      .single()
    
    return this.handleResponse(query)
  }
}

// Singleton instance
export const proposalsDAL = new ProposalsDAL()
