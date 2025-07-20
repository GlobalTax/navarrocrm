
// Interfaces específicas para formularios y validaciones

export interface FormFieldError {
  field: string
  message: string
  type: 'required' | 'format' | 'custom'
}

export interface FormState<T = Record<string, any>> {
  data: T
  errors: FormFieldError[]
  isValid: boolean
  isDirty: boolean
  isSubmitting: boolean
  submitCount: number
}

export interface ValidationResult {
  isValid: boolean
  errors: FormFieldError[]
  warnings: string[]
}

export interface BulkUploadValidationResult {
  totalRows: number
  validRows: number
  invalidRows: number
  errors: Array<{
    row: number
    field: string
    message: string
    value: any
  }>
  warnings: Array<{
    row: number
    field: string
    message: string
    value: any
  }>
}

export interface ContactValidationData {
  name: string
  email?: string
  phone?: string
  dni_nif?: string
  client_type: 'particular' | 'empresa' | 'autonomo'
}

export interface CompanyLookupResult {
  found: boolean
  data?: {
    name: string
    nif: string
    address: string
    status: string
    representatives: string[]
  }
  error?: string
  source: 'registro_mercantil' | 'aeat' | 'cache' | 'simulation'
}
