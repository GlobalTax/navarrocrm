/**
 * Manejo de errores centralizado para la integración de Quantum Economics
 */

export type QuantumErrorCode = 
  | 'AUTH_FAILED'
  | 'API_ERROR'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'DUPLICATE_ERROR'
  | 'DATABASE_ERROR'
  | 'ORG_ID_ERROR'
  | 'SYNC_ERROR'
  | 'UNKNOWN_ERROR'

export interface QuantumErrorContext {
  component?: string
  action?: string
  customerData?: any
  apiResponse?: any
  originalError?: Error
}

export class QuantumError extends Error {
  public readonly code: QuantumErrorCode
  public readonly context: QuantumErrorContext
  public readonly timestamp: Date
  public readonly userMessage: string
  public readonly technicalMessage: string

  constructor(
    code: QuantumErrorCode, 
    message: string, 
    context: QuantumErrorContext = {},
    userMessage?: string
  ) {
    super(message)
    this.name = 'QuantumError'
    this.code = code
    this.context = context
    this.timestamp = new Date()
    this.technicalMessage = message
    this.userMessage = userMessage || this.getDefaultUserMessage(code)
  }

  private getDefaultUserMessage(code: QuantumErrorCode): string {
    switch (code) {
      case 'AUTH_FAILED':
        return 'Error de autenticación con Quantum Economics. Verifica las credenciales.'
      case 'API_ERROR':
        return 'Error en la API de Quantum Economics. Inténtalo más tarde.'
      case 'NETWORK_ERROR':
        return 'Error de conexión. Verifica tu conexión a internet.'
      case 'VALIDATION_ERROR':
        return 'Los datos recibidos no son válidos.'
      case 'DUPLICATE_ERROR':
        return 'Se detectó un contacto duplicado.'
      case 'DATABASE_ERROR':
        return 'Error al guardar en la base de datos.'
      case 'ORG_ID_ERROR':
        return 'No se pudo identificar tu organización.'
      case 'SYNC_ERROR':
        return 'Error durante la sincronización automática.'
      default:
        return 'Ha ocurrido un error inesperado.'
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      technicalMessage: this.technicalMessage,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack
    }
  }
}

/**
 * Crea un error de Quantum con contexto
 */
export const createQuantumError = (
  code: QuantumErrorCode,
  message: string,
  context?: QuantumErrorContext,
  userMessage?: string
): QuantumError => {
  return new QuantumError(code, message, context, userMessage)
}

/**
 * Maneja errores de forma consistente y los registra
 */
export const handleQuantumError = (
  error: unknown,
  context: QuantumErrorContext = {}
): QuantumError => {
  let quantumError: QuantumError

  if (error instanceof QuantumError) {
    // Ya es un QuantumError, solo agregar contexto
    quantumError = new QuantumError(
      error.code,
      error.message,
      { ...error.context, ...context },
      error.userMessage
    )
  } else if (error instanceof Error) {
    // Error estándar, convertir a QuantumError
    quantumError = createQuantumError(
      'UNKNOWN_ERROR',
      error.message,
      { ...context, originalError: error }
    )
  } else {
    // Error desconocido
    quantumError = createQuantumError(
      'UNKNOWN_ERROR',
      'Error desconocido',
      { ...context, originalError: error as any }
    )
  }

  // Log del error (solo en desarrollo)
  if (import.meta.env.DEV) {
    console.error('🚨 QuantumError:', {
      code: quantumError.code,
      message: quantumError.message,
      context: quantumError.context,
      timestamp: quantumError.timestamp
    })
  }

  return quantumError
}

/**
 * Extrae mensaje de usuario de un error
 */
export const getErrorUserMessage = (error: unknown): string => {
  if (error instanceof QuantumError) {
    return error.userMessage
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'Ha ocurrido un error inesperado'
}

/**
 * Verifica si un error es recuperable (puede reintentarse)
 */
export const isRetryableError = (error: unknown): boolean => {
  if (error instanceof QuantumError) {
    return ['NETWORK_ERROR', 'API_ERROR'].includes(error.code)
  }
  
  return false
}