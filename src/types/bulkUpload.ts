
// Interfaces específicas para carga masiva de datos

export interface BulkUploadProcessorResult {
  successCount: number
  errorCount: number
  totalProcessed: number
  errors?: Array<{
    row: number
    message: string
  }>
}

export interface ContactInsertData {
  name: string
  email?: string
  phone?: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  address_country?: string
  client_type: 'particular' | 'empresa' | 'autonomo'
  status: 'activo' | 'inactivo' | 'prospecto' | 'bloqueado'
  relationship_type: 'prospecto' | 'cliente' | 'ex_cliente'
  org_id: string
}

export interface UserInvitationInsertData {
  email: string
  role: 'partner' | 'area_manager' | 'senior' | 'junior' | 'finance'
  org_id: string
  invited_by: string
  token: string
  created_at: string
  expires_at: string
}

export interface HubSpotContactInsertData {
  name: string
  email?: string
  phone?: string
  company_id?: string | null
  address_street?: string
  address_city?: string
  address_postal_code?: string
  address_country: string
  client_type: 'particular' | 'empresa'
  status: 'activo' | 'inactivo' | 'prospecto'
  relationship_type: 'prospecto' | 'cliente' | 'ex_cliente'
  business_sector?: string
  how_found_us?: string
  internal_notes?: string
  org_id: string
}

export type BulkUploadDataType = 'contacts' | 'users' | 'hubspot' | 'ai-processed'

export interface BulkUploadProcessorConfig<T> {
  batchSize: number
  tableName: string
  mapToInsertData: (item: T, orgId: string) => Record<string, any>
}
