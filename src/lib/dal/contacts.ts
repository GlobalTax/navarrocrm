
import { BaseDAL } from './base'
import { supabase } from '@/integrations/supabase/client'
import { DALResponse, DALListResponse } from './types'
import { Contact } from '@/types/shared/clientTypes'

export class ContactsDAL extends BaseDAL<Contact> {
  constructor() {
    super('contacts')
  }

  async findByEmail(email: string): Promise<DALResponse<Contact>> {
    if (!email) {
      return {
        data: null,
        error: new Error('Email is required'),
        success: false
      }
    }

    const query = supabase
      .from('contacts')
      .select('*')
      .eq('email', email)
      .single()
    
    return this.handleResponse<Contact>(query)
  }

  async findByDniNif(dni: string): Promise<DALResponse<Contact>> {
    if (!dni) {
      return {
        data: null,
        error: new Error('DNI/NIF is required'),
        success: false
      }
    }

    const query = supabase
      .from('contacts')
      .select('*')
      .eq('dni_nif', dni)
      .single()
    
    return this.handleResponse<Contact>(query)
  }

  async findByOrganization(orgId: string): Promise<DALListResponse<Contact>> {
    if (!orgId) {
      return {
        data: [],
        error: new Error('Organization ID is required'),
        success: false,
        count: 0
      }
    }

    return this.findMany({
      filters: { org_id: orgId },
      sort: [{ column: 'name', ascending: true }]
    })
  }

  async searchContacts(
    orgId: string, 
    searchTerm: string
  ): Promise<DALListResponse<Contact>> {
    if (!orgId) {
      return {
        data: [],
        error: new Error('Organization ID is required'),
        success: false,
        count: 0
      }
    }

    if (!searchTerm || searchTerm.length < 2) {
      return {
        data: [],
        error: new Error('Search term must be at least 2 characters'),
        success: false,
        count: 0
      }
    }

    const query = supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .eq('org_id', orgId)
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
    
    return this.handleListResponse<Contact>(query)
  }

  async findDuplicates(orgId: string): Promise<DALListResponse<Contact>> {
    if (!orgId) {
      return {
        data: [],
        error: new Error('Organization ID is required'),
        success: false,
        count: 0
      }
    }

    // Implementación simplificada - se puede mejorar con lógica más compleja
    const query = supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .eq('org_id', orgId)
      .order('email', { ascending: true })
    
    return this.handleListResponse<Contact>(query)
  }

  // Método específico para obtener solo clientes
  async findClients(orgId: string): Promise<DALListResponse<Contact>> {
    if (!orgId) {
      return {
        data: [],
        error: new Error('Organization ID is required'),
        success: false,
        count: 0
      }
    }

    return this.findMany({
      filters: { 
        org_id: orgId, 
        relationship_type: 'cliente' 
      },
      sort: [{ column: 'name', ascending: true }]
    })
  }

  // Método específico para obtener solo prospectos
  async findProspects(orgId: string): Promise<DALListResponse<Contact>> {
    if (!orgId) {
      return {
        data: [],
        error: new Error('Organization ID is required'),
        success: false,
        count: 0
      }
    }

    return this.findMany({
      filters: { 
        org_id: orgId, 
        relationship_type: 'prospecto' 
      },
      sort: [{ column: 'created_at', ascending: false }]
    })
  }
}

// Singleton instance
export const contactsDAL = new ContactsDAL()

// Re-export Contact type for convenience
export type { Contact }
