// Route-based code splitting optimizer with real chunk prefetching
import { lazy, ComponentType } from 'react'

// Route priority levels for optimized loading
export enum RoutePriority {
  CRITICAL = 'critical',    // Dashboard, Index - preload
  HIGH = 'high',           // Contacts, Cases - fast load
  MEDIUM = 'medium',       // Tasks, Calendar - standard load
  LOW = 'low'              // Admin, Reports - defer load
}

// Cache for loaded components
const componentCache = new Map<string, ComponentType<any>>()
const prefetchedChunks = new Set<string>()

// Enhanced lazy loading with prefetch capabilities
export const createOptimizedLazy = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  priority: RoutePriority = RoutePriority.MEDIUM
): ComponentType<any> => {
  const LazyComponent = lazy(async () => {
    const cacheKey = importFn.toString()
    if (componentCache.has(cacheKey)) {
      return { default: componentCache.get(cacheKey)! }
    }
    
    const module = await importFn()
    componentCache.set(cacheKey, module.default)
    return module
  })

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
    }, { once: true })
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

// Feature-based bundle splitting (updated to match actual chunks)
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

// Get real chunk files using import.meta.glob
const getChunkModules = () => {
  // Map actual module paths to chunks
  const modules = import.meta.glob([
    '/src/pages/Dashboard.tsx',
    '/src/pages/Contacts.tsx',
    '/src/pages/Cases.tsx',
    '/src/pages/Tasks.tsx',
    '/src/pages/Calendar.tsx',
    '/src/pages/Emails.tsx',
    '/src/pages/Users.tsx',
    '/src/pages/Reports.tsx',
    '/src/pages/IntegrationSettings.tsx',
    '/src/pages/QuantumPage.tsx',
    '/src/pages/AdvancedAI.tsx'
  ], { eager: false })
  
  return modules
}

// Map route paths to chunk names (based on vite.config.ts manualChunks)
const routeToChunkMap: Record<string, string> = {
  '/dashboard': 'assets/index',
  '/contacts': 'assets/chunk-clients',
  '/clients': 'assets/chunk-clients', 
  '/cases': 'assets/chunk-cases',
  '/tasks': 'assets/chunk-cases',
  '/emails': 'assets/chunk-communications',
  '/calendar': 'assets/chunk-communications',
  '/proposals': 'assets/chunk-business',
  '/time-tracking': 'assets/chunk-business',
  '/users': 'assets/chunk-admin',
  '/reports': 'assets/chunk-admin',
  '/integrations': 'assets/chunk-integrations',
  '/quantum': 'assets/chunk-integrations',
  '/advanced-ai': 'assets/chunk-ai',
  '/ai-admin': 'assets/chunk-ai'
}

// Prefetch specific chunks using modulepreload
const prefetchChunk = (chunkPath: string) => {
  if (prefetchedChunks.has(chunkPath)) return
  
  prefetchedChunks.add(chunkPath)
  
  const link = document.createElement('link')
  link.rel = 'modulepreload'
  link.href = chunkPath
  link.crossOrigin = 'anonymous'
  
  // Add error handling
  link.onerror = () => {
    console.warn(`Failed to prefetch chunk: ${chunkPath}`)
    prefetchedChunks.delete(chunkPath)
  }
  
  document.head.appendChild(link)
}

// Resource hints for critical routes
export const addResourceHints = () => {
  const head = document.head

  // Preload critical chunks immediately
  const criticalChunks = [
    'assets/index', // Dashboard
    'assets/chunk-clients', // High priority
    'assets/chunk-cases' // High priority  
  ]
  
  criticalChunks.forEach(chunk => {
    prefetchChunk(`/${chunk}`)
  })
  
  // Prefetch medium priority chunks after idle
  requestIdleCallback(() => {
    const mediumChunks = [
      'assets/chunk-communications',
      'assets/chunk-business'
    ]
    
    mediumChunks.forEach(chunk => {
      prefetchChunk(`/${chunk}`)
    })
  }, { timeout: 3000 })
}

// Initialize route optimization - SIMPLIFIED VERSION FOR STABILITY
export const initializeRouteOptimization = () => {
  console.log('🔧 [RouteOptimizer] Iniciando modo simplificado para evitar errores de chunks')
  
  // Solo logging, sin prefetch problemático
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    
    if (!target || typeof target.closest !== 'function') return
    
    const link = target.closest('a[href]') as HTMLAnchorElement
    
    if (link && link.href.includes(window.location.origin)) {
      const route = new URL(link.href).pathname
      console.log(`🧭 [RouteOptimizer] Navegando a: ${route}`)
    }
  }, { passive: true })
}

// Analytics for chunk loading
export const trackChunkLoading = (chunkName: string, loadTime: number) => {
  console.log(`📊 Chunk ${chunkName} loaded in ${loadTime}ms`)
  
  // Could send to analytics service
  if ((window as any).gtag) {
    (window as any).gtag('event', 'chunk_load', {
      chunk_name: chunkName,
      load_time: loadTime,
      event_category: 'performance'
    })
  }
}