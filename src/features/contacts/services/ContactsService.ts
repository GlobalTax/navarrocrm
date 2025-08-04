/**
 * Contacts Service
 * 
 * Servicio principal para operaciones de contactos con Supabase
 */

import { supabase } from '@/integrations/supabase/client'
import { Contact, Person, Company, ContactFormData, ContactSearchParams, ContactType, ContactStatus, ContactPreference, PaymentMethod, Language, RelationshipType, EmailPreferences } from '../types'
import { DEFAULT_EMAIL_PREFERENCES } from '../constants'

export class ContactsService {
  private readonly tableName = 'contacts' as const

  /**
   * Mapear datos de formulario a entidad Contact
   */
  private mapFormDataToContact(data: ContactFormData, orgId: string): Partial<Contact> {
    return {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      dni_nif: data.dni_nif || null,
      address_street: data.address_street || null,
      address_city: data.address_city || null,
      address_postal_code: data.address_postal_code || null,
      address_country: data.address_country || null,
      legal_representative: data.legal_representative || null,
      client_type: data.client_type,
      business_sector: data.business_sector || null,
      how_found_us: data.how_found_us || null,
      contact_preference: data.contact_preference,
      preferred_language: data.preferred_language,
      hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : null,
      payment_method: data.payment_method,
      status: data.status,
      relationship_type: data.relationship_type,
      tags: data.tags || [],
      internal_notes: data.internal_notes || null,
      company_id: data.company_id || null,
      email_preferences: DEFAULT_EMAIL_PREFERENCES,
      last_contact_date: new Date().toISOString(),
      org_id: orgId
    }
  }

  /**
   * Parsear preferencias de email de forma segura
   */
  private parseEmailPreferences(preferences: any) {
    if (!preferences) return DEFAULT_EMAIL_PREFERENCES
    
    if (typeof preferences === 'string') {
      try {
        return JSON.parse(preferences)
      } catch {
        return DEFAULT_EMAIL_PREFERENCES
      }
    }
    
    return preferences
  }

  /**
   * Obtener todos los contactos de una organización
   */
  async getContacts(orgId: string): Promise<Contact[]> {
    console.log('🔄 [ContactsService] Fetching contacts for org:', orgId)
    
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('org_id', orgId)
      .order('name', { ascending: true })

    if (error) {
      console.error('❌ [ContactsService] Error fetching contacts:', error)
      throw new Error(`Error fetching contacts: ${error.message}`)
    }

    console.log('✅ [ContactsService] Contacts fetched:', data?.length || 0)

    return (data || []).map(contact => ({
      ...contact,
      email_preferences: this.parseEmailPreferences(contact.email_preferences)
    })) as Contact[]
  }

  /**
   * Obtener personas físicas de una organización
   */
  async getPersons(orgId: string): Promise<Person[]> {
    console.log('🔄 [ContactsService] Fetching persons for org:', orgId)
    
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        company:company_id(
          id,
          name
        )
      `)
      .eq('org_id', orgId)
      .in('client_type', ['particular', 'autonomo'])
      .order('name', { ascending: true })

    if (error) {
      console.error('❌ [ContactsService] Error fetching persons:', error)
      throw new Error(`Error fetching persons: ${error.message}`)
    }

    console.log('✅ [ContactsService] Persons fetched:', data?.length || 0)

    return (data || []).map(person => ({
      ...person,
      client_type: (person.client_type as 'particular' | 'autonomo') || 'particular',
      email_preferences: this.parseEmailPreferences(person.email_preferences),
      company: (person as any).company ? {
        id: (person as any).company.id,
        name: (person as any).company.name
      } : null
    })) as Person[]
  }

  /**
   * Obtener empresas de una organización
   */
  async getCompanies(orgId: string): Promise<Company[]> {
    console.log('🔄 [ContactsService] Fetching companies for org:', orgId)
    
    const { data: companiesData, error: companiesError } = await supabase
      .from('contacts')
      .select('*')
      .eq('org_id', orgId)
      .eq('client_type', 'empresa')
      .order('name', { ascending: true })

    if (companiesError) {
      console.error('❌ [ContactsService] Error fetching companies:', companiesError)
      throw new Error(`Error fetching companies: ${companiesError.message}`)
    }

    // Filtrar duplicados de Quantum manteniendo solo el más reciente
    const uniqueCompanies = this.removeDuplicates(companiesData || [])

    // Obtener información de contactos vinculados para cada empresa
    const companiesWithContacts = await Promise.all(
      uniqueCompanies.map(async (company) => {
        try {
          const { data: contactsData } = await supabase
            .from('contacts')
            .select('id, name, email, phone')
            .eq('company_id', company.id)
            .eq('org_id', orgId)
            .limit(1)

          const { count: totalContacts } = await supabase
            .from('contacts')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', company.id)
            .eq('org_id', orgId)

          return {
            ...company,
            client_type: 'empresa' as const,
            email_preferences: this.parseEmailPreferences(company.email_preferences),
            primary_contact: contactsData?.[0] || null,
            total_contacts: totalContacts || 0
          }
        } catch (error) {
          console.error('❌ [ContactsService] Error processing company', company.name, ':', error)
          return {
            ...company,
            client_type: 'empresa' as const,
            email_preferences: this.parseEmailPreferences(company.email_preferences),
            primary_contact: null,
            total_contacts: 0
          }
        }
      })
    )

    console.log('✅ [ContactsService] Companies fetched:', companiesWithContacts.length)
    return companiesWithContacts
  }

  /**
   * Crear un nuevo contacto
   */
  async createContact(data: ContactFormData, orgId: string): Promise<Contact> {
    console.log('🔄 [ContactsService] Creating contact:', data.name)
    
    const contactData = this.mapFormDataToContact(data, orgId)
    
    // Convertir email_preferences a JSON
    const insertData: any = { ...contactData }
    if (insertData.email_preferences && typeof insertData.email_preferences === 'object') {
      insertData.email_preferences = JSON.stringify(insertData.email_preferences)
    }
    
    const { data: newContact, error } = await supabase
      .from('contacts')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('❌ [ContactsService] Error creating contact:', error)
      throw new Error(`Error creating contact: ${error.message}`)
    }

    console.log('✅ [ContactsService] Contact created:', newContact.id)
    return this.mapDbContactToContact(newContact)
  }

  /**
   * Actualizar un contacto existente
   */
  async updateContact(id: string, data: Partial<ContactFormData>, orgId: string): Promise<Contact> {
    console.log('🔄 [ContactsService] Updating contact:', id)
    
    const contactData = data.name ? this.mapFormDataToContact(data as ContactFormData, orgId) : data
    
    // Convertir email_preferences a JSON si existe
    const updateData: any = { ...contactData, updated_at: new Date().toISOString() }
    if (updateData.email_preferences && typeof updateData.email_preferences === 'object') {
      updateData.email_preferences = JSON.stringify(updateData.email_preferences)
    }
    
    const { data: updatedContact, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) {
      console.error('❌ [ContactsService] Error updating contact:', error)
      throw new Error(`Error updating contact: ${error.message}`)
    }

    console.log('✅ [ContactsService] Contact updated:', id)
    return this.mapDbContactToContact(updatedContact)
  }

  /**
   * Eliminar un contacto
   */
  async deleteContact(id: string, orgId: string): Promise<void> {
    console.log('🔄 [ContactsService] Deleting contact:', id)
    
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .eq('org_id', orgId)

    if (error) {
      console.error('❌ [ContactsService] Error deleting contact:', error)
      throw new Error(`Error deleting contact: ${error.message}`)
    }

    console.log('✅ [ContactsService] Contact deleted:', id)
  }

  /**
   * Buscar contactos
   */
  async searchContacts(orgId: string, params: ContactSearchParams): Promise<Contact[]> {
    console.log('🔄 [ContactsService] Searching contacts:', params.term)
    
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('org_id', orgId)

    // Aplicar búsqueda por texto
    if (params.term && params.term.length >= 2) {
      query = query.or(`name.ilike.%${params.term}%,email.ilike.%${params.term}%,phone.ilike.%${params.term}%`)
    }

    // Aplicar filtros
    if (params.filters) {
      if (params.filters.status?.length) {
        query = query.in('status', params.filters.status)
      }
      if (params.filters.client_type?.length) {
        query = query.in('client_type', params.filters.client_type)
      }
      if (params.filters.relationship_type?.length) {
        query = query.in('relationship_type', params.filters.relationship_type)
      }
      if (params.filters.business_sector) {
        query = query.eq('business_sector', params.filters.business_sector)
      }
    }

    // Aplicar paginación
    if (params.limit) {
      query = query.limit(params.limit)
    }
    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 50) - 1)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('❌ [ContactsService] Error searching contacts:', error)
      throw new Error(`Error searching contacts: ${error.message}`)
    }

    console.log('✅ [ContactsService] Contacts found:', data?.length || 0)
    return (data || []).map(contact => this.mapDbContactToContact(contact))
  }

  /**
   * Obtener contacto por email
   */
  async getContactByEmail(email: string, orgId: string): Promise<Contact | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .eq('org_id', orgId)
      .maybeSingle()

    if (error) {
      console.error('❌ [ContactsService] Error fetching contact by email:', error)
      throw new Error(`Error fetching contact: ${error.message}`)
    }

    if (!data) return null

    return this.mapDbContactToContact(data)
  }

  /**
   * Obtener clientes únicamente
   */
  async getClients(orgId: string): Promise<Contact[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('org_id', orgId)
      .eq('relationship_type', 'cliente')
      .order('name', { ascending: true })

    if (error) {
      console.error('❌ [ContactsService] Error fetching clients:', error)
      throw new Error(`Error fetching clients: ${error.message}`)
    }

    return (data || []).map(contact => this.mapDbContactToContact(contact))
  }

  /**
   * Mapear datos de BD a tipo Contact
   */
  private mapDbContactToContact(dbContact: any): Contact {
    return {
      ...dbContact,
      client_type: dbContact.client_type as ContactType,
      status: dbContact.status as ContactStatus,
      contact_preference: dbContact.contact_preference as ContactPreference,
      payment_method: dbContact.payment_method as PaymentMethod,
      preferred_language: dbContact.preferred_language as Language,
      relationship_type: dbContact.relationship_type as RelationshipType,
      email_preferences: this.parseEmailPreferences(dbContact.email_preferences)
    }
  }

  /**
   * Detectar y filtrar duplicados (especialmente de Quantum)
   */
  private removeDuplicates(contacts: any[]): any[] {
    return contacts.reduce((acc: any[], contact: any) => {
      if (!contact.quantum_customer_id) {
        acc.push(contact)
        return acc
      }
      
      const existingIndex = acc.findIndex(c => c.quantum_customer_id === contact.quantum_customer_id)
      if (existingIndex === -1) {
        acc.push(contact)
      } else {
        // Mantener el más reciente
        if (new Date(contact.created_at) > new Date(acc[existingIndex].created_at)) {
          acc[existingIndex] = contact
        }
      }
      return acc
    }, [])
  }
}

// Singleton instance
export const contactsService = new ContactsService()