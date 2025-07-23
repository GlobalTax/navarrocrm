
import { BaseDAL } from './base'
import { supabase } from '@/integrations/supabase/client'
import { DALResponse, DALListResponse } from './types'

export interface Contact {
  id: string
  name: string
  email: string | null
  phone: string | null
  dni_nif: string | null
  address_street: string | null
  address_city: string | null
  address_postal_code: string | null
  address_country: string | null
  legal_representative: string | null
  client_type: string | null
  business_sector: string | null
  how_found_us: string | null
  contact_preference: string | null
  preferred_language: string | null
  hourly_rate: number | null
  payment_method: string | null
  status: string | null
  relationship_type: 'prospecto' | 'cliente' | 'ex_cliente'
  tags: string[] | null
  internal_notes: string | null
  org_id: string
  created_at: string
  updated_at: string
  last_contact_date: string | null
  company_id: string | null
  timezone: string | null
  preferred_meeting_time: string | null
  email_preferences: {
    receive_followups: boolean
    receive_reminders: boolean
    receive_invitations: boolean
  } | null
}

export class ContactsDAL extends BaseDAL<Contact> {
  constructor() {
    super('contacts')
  }

  async findByEmail(email: string): Promise<DALResponse<Contact>> {
    const query = supabase
      .from('contacts')
      .select('*')
      .eq('email', email)
      .single()
    
    return this.handleResponse<Contact>(query)
  }

  async findByDniNif(dni: string): Promise<DALResponse<Contact>> {
    const query = supabase
      .from('contacts')
      .select('*')
      .eq('dni_nif', dni)
      .single()
    
    return this.handleResponse<Contact>(query)
  }

  async findByOrganization(orgId: string): Promise<DALListResponse<Contact>> {
    return this.findMany({
      filters: { org_id: orgId },
      sort: [{ column: 'name', ascending: true }]
    })
  }

  async searchContacts(
    orgId: string, 
    searchTerm: string
  ): Promise<DALListResponse<Contact>> {
    const query = supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .eq('org_id', orgId)
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
    
    return this.handleListResponse<Contact>(query)
  }

  async findDuplicates(orgId: string): Promise<DALListResponse<Contact>> {
    // Simplificar por ahora - implementación más compleja después
    const query = supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .eq('org_id', orgId)
    
    return this.handleListResponse<Contact>(query)
  }
}

// Singleton instance
export const contactsDAL = new ContactsDAL()
