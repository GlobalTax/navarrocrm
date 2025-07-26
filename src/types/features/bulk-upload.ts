/**
 * Tipos para funcionalidad de carga masiva
 */

export type UploadDataType = 'contacts' | 'users' | 'cases' | 'invoices' | 'hubspot_contacts'
export type ValidationStatus = 'pending' | 'valid' | 'error' | 'warning'

export interface ValidationError {
  row: number
  field: string
  value: unknown
  message: string
  severity: 'error' | 'warning'
}

export interface UploadValidationResult<T = Record<string, unknown>> {
  data: T | null
  errors: ValidationError[]
  warnings: ValidationError[]
  status: ValidationStatus
}

export interface BulkUploadSession {
  id: string
  file_name: string
  data_type: UploadDataType
  total_rows: number
  valid_rows: number
  error_rows: number
  warning_rows: number
  status: 'uploading' | 'validating' | 'processing' | 'completed' | 'failed'
  created_at: string
  completed_at?: string
  error_message?: string
}

export interface UserValidationData {
  email: string
  role: string
  first_name?: string
  last_name?: string
  is_active: boolean
}

export interface HubSpotValidationData {
  email: string
  firstname?: string
  lastname?: string
  company?: string
  phone?: string
  website?: string
  industry?: string
  lifecycle_stage?: string
}

export interface BulkUploadConfig {
  dataType: UploadDataType
  requiredFields: string[]
  optionalFields: string[]
  validator: (row: Record<string, unknown>, index: number) => UploadValidationResult
  processor?: (validatedData: unknown[], orgId: string) => Promise<number>
}

export interface BulkUploadProgress {
  stage: 'upload' | 'validation' | 'processing' | 'complete'
  progress: number
  currentRow?: number
  totalRows: number
  errors: ValidationError[]
  warnings: ValidationError[]
}