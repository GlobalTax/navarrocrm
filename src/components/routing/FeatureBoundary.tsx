import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { PageLoadingSkeleton } from '@/components/layout/PageLoadingSkeleton'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertTriangle } from 'lucide-react'

interface FeatureBoundaryProps {
  children: React.ReactNode
  feature: string
  fallback?: React.ComponentType
}

// Feature-specific error fallback
const FeatureErrorFallback = ({ 
  error, 
  resetErrorBoundary, 
  feature 
}: { 
  error: Error
  resetErrorBoundary: () => void
  feature: string
}) => (
  <div className="min-h-[400px] flex items-center justify-center p-8">
    <div className="text-center space-y-4 max-w-md">
      <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      
      <h2 className="text-xl font-semibold text-gray-900">
        Error cargando {feature}
      </h2>
      
      <p className="text-gray-600 text-sm">
        No se pudo cargar este módulo. Comprueba tu conexión e inténtalo de nuevo.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={resetErrorBoundary}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </Button>
        
        <Button
          onClick={() => window.location.href = '/dashboard'}
          variant="default"
          size="sm"
        >
          Ir al Dashboard
        </Button>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-left">
          <summary className="text-sm text-gray-500 cursor-pointer">
            Detalles del error (desarrollo)
          </summary>
          <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  </div>
)

// Feature-specific loading skeleton
const FeatureLoadingSkeleton = ({ feature }: { feature: string }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
      <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
    </div>
    <PageLoadingSkeleton />
    <div className="text-center text-sm text-gray-500 mt-4">
      Cargando {feature}...
    </div>
  </div>
)

export const FeatureBoundary: React.FC<FeatureBoundaryProps> = ({
  children,
  feature,
  fallback: CustomFallback
}) => {
  return (
    <ErrorBoundary
      FallbackComponent={(props) => (
        <FeatureErrorFallback {...props} feature={feature} />
      )}
      onReset={() => {
        // Clear any cached failed imports
        window.location.reload()
      }}
    >
      <Suspense 
        fallback={
          CustomFallback ? (
            <CustomFallback />
          ) : (
            <FeatureLoadingSkeleton feature={feature} />
          )
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

// Specific feature boundaries for better UX
export const ClientFeatureBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FeatureBoundary feature="Gestión de Clientes">
    {children}
  </FeatureBoundary>
)

export const CaseFeatureBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FeatureBoundary feature="Gestión de Expedientes">
    {children}
  </FeatureBoundary>
)

export const CommunicationFeatureBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FeatureBoundary feature="Comunicaciones">
    {children}
  </FeatureBoundary>
)

export const AdminFeatureBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FeatureBoundary feature="Administración">
    {children}
  </FeatureBoundary>
)