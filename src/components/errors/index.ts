
// Exportar todos los componentes de manejo de errores
export { ErrorBoundary } from '@/components/ErrorBoundary'
export { 
  MinimalErrorFallback, 
  NetworkErrorFallback as BasicNetworkErrorFallback, 
  DataErrorFallback,
  withErrorBoundary 
} from '@/components/ErrorFallbacks'

// Nuevos componentes avanzados
export {
  GenericErrorFallback,
  NetworkErrorFallback,
  AuthErrorFallback,
  PermissionErrorFallback,
  DataLoadErrorFallback
} from './AdvancedErrorFallbacks'

export {
  ErrorManager,
  withErrorHandling,
  useErrorHandler
} from './ErrorManager'

// Re-exportar el servicio de errores
export { errorService, useErrorService } from '@/services/errorService'
