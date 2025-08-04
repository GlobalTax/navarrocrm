/**
 * CasesService - Gestión de expedientes/casos
 * Servicio para operaciones CRUD y búsquedas de casos
 */

import { supabase } from '@/integrations/supabase/client'
import { 
  Case, 
  CreateCaseData, 
  UpdateCaseData, 
  CaseSearchParams,
  CaseFormData,
  BillingMethod,
  CaseStatus
} from '../types'
import { DEFAULT_COMMUNICATION_PREFERENCES } from '../constants'

export class CasesService {
  private readonly tableName = 'cases' as const

  /**
   * Crear nuevo caso
   */
  async createCase(data: CreateCaseData, orgId: string, userId: string): Promise<Case> {
    console.log('🚀 [CasesService] Creating case:', { title: data.title, orgId })
    
    const caseData = this.mapFormDataToCase(data, orgId)
    
    const { data: newCase, error } = await supabase
      .from('cases')
      .insert(caseData)
      .select(`
        *,
        contact:contacts(
          id,
          name,
          email,
          phone
        )
      `)
      .single()

    if (error) {
      console.error('❌ [CasesService] Error creating case:', error)
      throw new Error(`Error creating case: ${error.message}`)
    }

    console.log('✅ [CasesService] Case created:', newCase.id)
    return this.mapDbCaseToCase(newCase)
  }

  /**
   * Actualizar caso existente
   */
  async updateCase(id: string, data: Partial<UpdateCaseData>, orgId: string): Promise<Case> {
    console.log('🔄 [CasesService] Updating case:', { id, orgId })
    
    const caseData = data.title ? this.mapFormDataToCase(data as CreateCaseData, orgId) : data
    
    const updateData = {
      ...caseData,
      updated_at: new Date().toISOString()
    }

    const { data: updatedCase, error } = await supabase
      .from('cases')
      .update(updateData)
      .eq('id', id)
      .eq('org_id', orgId)
      .select(`
        *,
        contact:contacts(
          id,
          name,
          email,
          phone
        )
      `)
      .single()

    if (error) {
      console.error('❌ [CasesService] Error updating case:', error)
      throw new Error(`Error updating case: ${error.message}`)
    }

    console.log('✅ [CasesService] Case updated:', id)
    return this.mapDbCaseToCase(updatedCase)
  }

  /**
   * Eliminar caso
   */
  async deleteCase(id: string, orgId: string): Promise<void> {
    console.log('🗑️ [CasesService] Deleting case:', { id, orgId })

    const { error } = await supabase
      .from('cases')
      .delete()
      .eq('id', id)
      .eq('org_id', orgId)

    if (error) {
      console.error('❌ [CasesService] Error deleting case:', error)
      throw new Error(`Error deleting case: ${error.message}`)
    }

    console.log('✅ [CasesService] Case deleted:', id)
  }

  /**
   * Obtener casos con filtros
   */
  async getCases(params: CaseSearchParams, orgId: string): Promise<Case[]> {
    console.log('📋 [CasesService] Fetching cases:', { params, orgId })

    let query = supabase
      .from('cases')
      .select(`
        *,
        contact:contacts(
          id,
          name,
          email,
          phone
        )
      `)
      .eq('org_id', orgId)

    // Aplicar filtros
    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,matter_number.ilike.%${params.search}%`)
    }
    
    if (params.status && params.status.length > 0) {
      query = query.in('status', params.status)
    }
    
    if (params.practice_area && params.practice_area.length > 0) {
      query = query.in('practice_area', params.practice_area)
    }
    
    if (params.responsible_solicitor_id) {
      query = query.eq('responsible_solicitor_id', params.responsible_solicitor_id)
    }

    if (params.date_from) {
      query = query.gte('date_opened', params.date_from)
    }

    if (params.date_to) {
      query = query.lte('date_opened', params.date_to)
    }

    // Paginación
    if (params.limit) {
      query = query.limit(params.limit)
    }
    
    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 25) - 1)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ [CasesService] Error fetching cases:', error)
      throw new Error(`Error fetching cases: ${error.message}`)
    }

    console.log('✅ [CasesService] Cases found:', data?.length || 0)
    return (data || []).map(case_ => this.mapDbCaseToCase(case_))
  }

  /**
   * Obtener caso por ID
   */
  async getCaseById(id: string, orgId: string): Promise<Case | null> {
    console.log('🔍 [CasesService] Fetching case by ID:', { id, orgId })

    const { data, error } = await supabase
      .from('cases')
      .select(`
        *,
        contact:contacts(
          id,
          name,
          email,
          phone
        ),
        responsible_solicitor:users!cases_responsible_solicitor_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', id)
      .eq('org_id', orgId)
      .single()

    if (error) {
      console.error('❌ [CasesService] Error fetching case:', error)
      return null
    }

    if (!data) return null

    return this.mapDbCaseToCase(data)
  }

  /**
   * Cambiar estado de caso (archivar/desarchivar)
   */
  async toggleCaseStatus(id: string, orgId: string): Promise<Case> {
    console.log('🔄 [CasesService] Toggling case status:', { id, orgId })

    // Obtener estado actual
    const { data: currentCase } = await supabase
      .from('cases')
      .select('status')
      .eq('id', id)
      .eq('org_id', orgId)
      .single()

    if (!currentCase) {
      throw new Error('Case not found')
    }

    // Alternar entre closed y open
    const newStatus: CaseStatus = currentCase.status === 'closed' ? 'open' : 'closed'
    const now = new Date().toISOString()

    const updateData: any = {
      status: newStatus,
      updated_at: now
    }

    // Si se está cerrando, establecer fecha de cierre
    if (newStatus === 'closed') {
      updateData.date_closed = now.split('T')[0] // Solo la fecha
    } else {
      updateData.date_closed = null
    }

    const { data: updatedCase, error } = await supabase
      .from('cases')
      .update(updateData)
      .eq('id', id)
      .eq('org_id', orgId)
      .select(`
        *,
        contact:contacts(
          id,
          name,
          email,
          phone
        )
      `)
      .single()

    if (error) {
      console.error('❌ [CasesService] Error toggling case status:', error)
      throw new Error(`Error updating case status: ${error.message}`)
    }

    console.log('✅ [CasesService] Case status toggled:', { id, newStatus })
    return this.mapDbCaseToCase(updatedCase)
  }

  /**
   * Buscar casos por término
   */
  async searchCases(searchTerm: string, orgId: string): Promise<Case[]> {
    if (!searchTerm || searchTerm.length < 2) {
      return []
    }

    console.log('🔍 [CasesService] Searching cases:', { searchTerm, orgId })

    const { data, error } = await supabase
      .from('cases')
      .select(`
        *,
        contact:contacts(
          id,
          name,
          email,
          phone
        )
      `)
      .eq('org_id', orgId)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,matter_number.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('❌ [CasesService] Error searching cases:', error)
      throw new Error(`Error searching cases: ${error.message}`)
    }

    console.log('✅ [CasesService] Search results:', data?.length || 0)
    return (data || []).map(case_ => this.mapDbCaseToCase(case_))
  }

  /**
   * Mapear datos del formulario a objeto Case para BD
   */
  private mapFormDataToCase(data: CreateCaseData, orgId: string): any {
    return {
      title: data.title,
      description: data.description,
      status: data.status,
      contact_id: data.contact_id,
      practice_area: data.practice_area,
      responsible_solicitor_id: data.responsible_solicitor_id,
      originating_solicitor_id: data.originating_solicitor_id,
      billing_method: data.billing_method,
      estimated_budget: data.estimated_budget,
      date_opened: new Date().toISOString().split('T')[0],
      communication_preferences: DEFAULT_COMMUNICATION_PREFERENCES,
      org_id: orgId
    }
  }

  /**
   * Mapear datos de BD a tipo Case
   */
  private mapDbCaseToCase(dbCase: any): Case {
    return {
      ...dbCase,
      status: dbCase.status as CaseStatus,
      billing_method: dbCase.billing_method as BillingMethod,
      communication_preferences: dbCase.communication_preferences || DEFAULT_COMMUNICATION_PREFERENCES
    }
  }
}

// Singleton instance
export const casesService = new CasesService()