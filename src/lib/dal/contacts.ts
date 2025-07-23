
import { BaseDAL } from './base'
import { supabase } from '@/integrations/supabase/client'
import { DALResponse, DALListResponse } from './types'

export interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  dni_nif?: string
  client_type?: string
  relationship_type?: string
  status?: string
  org_id: string
  created_at?: string
  updated_at?: string
  // ... otros campos según tu esquema
}

export class ContactsDAL extends BaseDAL<Contact> {
  constructor() {
    super('contacts')
  }

  async findByEmail(email: string): Promise<DALResponse<Contact>> {
    const query = supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single()
    
    return this.handleResponse(query)
  }

  async findByDniNif(dni: string): Promise<DALResponse<Contact>> {
    const query = supabase
      .from(this.tableName)
      .select('*')
      .eq('dni_nif', dni)
      .single()
    
    return this.handleResponse(query)
  }

  async findByOrganization(orgId: string): Promise<DALListResponse<Contact>> {
    return this.findMany({
      filters: { org_id: orgId },
      sort: [{ column: 'created_at', ascending: false }]
    })
  }

  async searchContacts(
    orgId: string, 
    searchTerm: string
  ): Promise<DALListResponse<Contact>> {
    const query = supabase
      .from(this.tableName)
      .select('*')
      .eq('org_id', orgId)
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
    
    return this.handleResponse(query)
  }

  async findDuplicates(orgId: string): Promise<DALListResponse<Contact>> {
    const query = supabase
      .rpc('detect_quantum_duplicates', { org_uuid: orgId })
    
    return this.handleResponse(query)
  }
}

// Singleton instance
export const contactsDAL = new ContactsDAL()
