// Route-based code splitting optimizer
import { lazy, ComponentType } from 'react'

// Route priority levels for optimized loading
export enum RoutePriority {
  CRITICAL = 'critical',    // Dashboard, Index - preload
  HIGH = 'high',           // Contacts, Cases - fast load
  MEDIUM = 'medium',       // Tasks, Calendar - standard load
  LOW = 'low'              // Admin, Reports - defer load
}

// Enhanced lazy loading with prefetch capabilities
export const createOptimizedLazy = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  priority: RoutePriority = RoutePriority.MEDIUM
): ComponentType<any> => {
  const LazyComponent = lazy(importFn)

  // Prefetch critical and high priority routes
  if (priority === RoutePriority.CRITICAL || priority === RoutePriority.HIGH) {
    // Prefetch after 2 seconds of idle time
    const prefetchTimer = setTimeout(() => {
      importFn().catch(() => {
        // Silently handle prefetch failures
      })
    }, 2000)

    // Cleanup timer on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearTimeout(prefetchTimer)
      }
    })
  }

  return LazyComponent
}

// Bundle chunk names for better debugging
export const createNamedLazy = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  chunkName: string,
  priority: RoutePriority = RoutePriority.MEDIUM
): ComponentType<any> => {
  return createOptimizedLazy(
    () => importFn(),
    priority
  )
}

// Feature-based bundle splitting
export const featureBundles = {
  // Core features - always loaded
  core: ['Dashboard', 'Index'],
  
  // Client management - high priority
  clients: ['Contacts', 'ContactDetail', 'Clients', 'ClientDetail'],
  
  // Case management - high priority  
  cases: ['Cases', 'CaseDetail', 'Tasks', 'TaskDetail'],
  
  // Communications - medium priority
  communications: ['Emails', 'Calendar'],
  
  // Business tools - medium priority
  business: ['Proposals', 'ProposalDetail', 'TimeTracking', 'Documents'],
  
  // Administration - low priority
  admin: ['Users', 'Reports', 'SecurityAudit', 'Workflows'],
  
  // Integrations - low priority
  integrations: ['IntegrationSettings', 'QuantumPage', 'QuantumImport'],
  
  // AI & Advanced - low priority
  ai: ['AdvancedAI', 'AIAdmin', 'IntelligentDashboard', 'Academia']
} as const

// Resource hints for critical routes
export const addResourceHints = () => {
  const head = document.head

  // Preload critical route chunks
  const criticalChunks = ['/dashboard', '/contacts', '/cases']
  
  criticalChunks.forEach(chunk => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = chunk
    head.appendChild(link)
  })
}

// Initialize route optimization
export const initializeRouteOptimization = () => {
  // Add resource hints when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addResourceHints)
  } else {
    addResourceHints()
  }
  
  // Prefetch on user interactions
  document.addEventListener('mouseenter', (e) => {
    const target = e.target as HTMLElement
    const link = target.closest('a[href]') as HTMLAnchorElement
    
    if (link && link.href.includes(window.location.origin)) {
      const route = new URL(link.href).pathname
      if (featureBundles.clients.some(r => route.includes(r.toLowerCase()))) {
        // Prefetch client management bundle
      }
    }
  }, { passive: true })
}