
/**
 * Tipos compartidos para el sistema de formularios
 */

export interface SubmissionResult {
  success: boolean
  data?: any
  error?: string
  operation: 'create' | 'update'
  duration: number
}

export interface RetryStrategy {
  maxRetries: number
  delay: number
}

export interface FormSubmissionResult {
  success: boolean
  error?: string
}

export interface FormSubmitState {
  isSubmitting: boolean
  error: string | null
  submitForm: (data: any) => Promise<FormSubmissionResult>
}
