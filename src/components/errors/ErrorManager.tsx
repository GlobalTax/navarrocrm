
import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { 
  GenericErrorFallback, 
  NetworkErrorFallback, 
  AuthErrorFallback, 
  PermissionErrorFallback,
  DataLoadErrorFallback 
} from './AdvancedErrorFallbacks'

// Función para determinar el tipo de error y el fallback apropiado
const getErrorFallback = (error: Error, errorInfo?: any) => {
  const errorMessage = error.message.toLowerCase()
  
  // Error de red
  if (errorMessage.includes('fetch') || 
      errorMessage.includes('network') || 
      errorMessage.includes('connection')) {
    return ({ resetErrorBoundary }: any) => (
      <NetworkErrorFallback 
        error={error} 
        retry={resetErrorBoundary} 
      />
    )
  }
  
  // Error de autenticación
  if (errorMessage.includes('unauthorized') || 
      errorMessage.includes('401') ||
      errorMessage.includes('authentication')) {
    return ({ resetErrorBoundary }: any) => (
      <AuthErrorFallback 
        error={error} 
        onLogin={() => window.location.href = '/login'} 
      />
    )
  }
  
  // Error de permisos
  if (errorMessage.includes('forbidden') || 
      errorMessage.includes('403') ||
      errorMessage.includes('permission')) {
    return () => <PermissionErrorFallback error={error} />
  }
  
  // Error genérico
  return ({ resetErrorBoundary }: any) => (
    <GenericErrorFallback 
      error={error} 
      resetErrorBoundary={resetErrorBoundary}
      componentStack={errorInfo?.componentStack}
    />
  )
}

interface ErrorManagerProps {
  children: React.ReactNode
  fallback?: React.ComponentType<any>
}

// Error Boundary inteligente que selecciona el fallback apropiado
export const ErrorManager: React.FC<ErrorManagerProps> = ({ 
  children, 
  fallback 
}) => {
  const [storedErrorInfo, setStoredErrorInfo] = React.useState<any>(null)

  return (
    <ErrorBoundary
      FallbackComponent={fallback || ((props) => {
        const FallbackComponent = getErrorFallback(props.error, storedErrorInfo)
        return <FallbackComponent {...props} />
      })}
      onError={(error, errorInfo) => {
        console.error('ErrorManager caught error:', error, errorInfo)
        setStoredErrorInfo(errorInfo)
        
        // Aquí se podría integrar con servicios de monitoreo
        // como Sentry, LogRocket, etc.
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// HOC para envolver componentes específicos con manejo de errores
export const withErrorHandling = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorType?: 'network' | 'auth' | 'permission' | 'data',
  entityName?: string
) => {
  const WithErrorHandlingComponent = (props: P) => {
    const [storedErrorInfo, setStoredErrorInfo] = React.useState<any>(null)

    const getFallbackForType = (error: Error) => {
      switch (errorType) {
        case 'network':
          return ({ resetErrorBoundary }: any) => (
            <NetworkErrorFallback error={error} retry={resetErrorBoundary} />
          )
        case 'auth':
          return () => (
            <AuthErrorFallback 
              error={error} 
              onLogin={() => window.location.href = '/login'} 
            />
          )
        case 'permission':
          return () => <PermissionErrorFallback error={error} />
        case 'data':
          return ({ resetErrorBoundary }: any) => (
            <DataLoadErrorFallback 
              error={error} 
              retry={resetErrorBoundary}
              entity={entityName}
            />
          )
        default:
          return ({ resetErrorBoundary }: any) => (
            <GenericErrorFallback 
              error={error} 
              resetErrorBoundary={resetErrorBoundary}
              componentStack={storedErrorInfo?.componentStack}
            />
          )
      }
    }

    return (
      <ErrorBoundary
        FallbackComponent={({ error, resetErrorBoundary }) => {
          const FallbackComponent = getFallbackForType(error)
          return <FallbackComponent resetErrorBoundary={resetErrorBoundary} />
        }}
        onError={(error, errorInfo) => {
          console.error(`Error in ${WrappedComponent.displayName || WrappedComponent.name}:`, error, errorInfo)
          setStoredErrorInfo(errorInfo)
        }}
      >
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }

  WithErrorHandlingComponent.displayName = `withErrorHandling(${WrappedComponent.displayName || WrappedComponent.name})`
  
  return WithErrorHandlingComponent
}

// Hook para usar manejo de errores en componentes funcionales
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null)
  
  const handleError = React.useCallback((error: Error) => {
    setError(error)
    console.error('Error handled:', error)
  }, [])
  
  const clearError = React.useCallback(() => {
    setError(null)
  }, [])
  
  return { error, handleError, clearError }
}
