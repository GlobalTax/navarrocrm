
import { lazy } from 'react'
import { LazyComponentBoundary } from '@/components/error-boundaries/LazyComponentBoundary'

// Lazy load heavy components
export const LazyMigrationDashboard = lazy(() => 
  import('@/components/migration/MigrationDashboard').then(module => ({
    default: module.MigrationDashboard
  }))
)

export const LazyImprovedClientOnboarding = lazy(() =>
  import('@/components/onboarding/ImprovedClientOnboarding').then(module => ({
    default: module.ImprovedClientOnboarding
  }))
)

export const LazyQuantumSyncStatus = lazy(() =>
  import('@/components/contacts/QuantumSyncStatus').then(module => ({
    default: module.QuantumSyncStatus
  }))
)

export const LazyQuantumClientImporter = lazy(() =>
  import('@/components/quantum/QuantumClientImporter').then(module => ({
    default: module.QuantumClientImporter
  }))
)

// Wrapper component with error boundary
interface LazyComponentWrapperProps {
  children: React.ReactNode
  componentName: string
  fallback?: React.ReactNode
}

export const LazyComponentWrapper = ({ 
  children, 
  componentName, 
  fallback 
}: LazyComponentWrapperProps) => (
  <LazyComponentBoundary componentName={componentName}>
    <React.Suspense fallback={fallback || <div>Cargando {componentName}...</div>}>
      {children}
    </React.Suspense>
  </LazyComponentBoundary>
)

const React = await import('react')
