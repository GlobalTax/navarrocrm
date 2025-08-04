import { lazy } from 'react'
import { RoutePriority } from '@/utils/routeOptimizer'

// Bundle configuration for feature-based code splitting
export const bundleConfig = {
  // Core bundle - always loaded
  core: {
    priority: RoutePriority.CRITICAL,
    chunks: ['Index', 'Dashboard', 'MainLayout'],
    preload: true,
    dependencies: []
  },

  // Client management bundle
  clients: {
    priority: RoutePriority.HIGH,
    chunks: ['Contacts', 'ContactDetail', 'Clients', 'ClientDetail'],
    preload: true,
    dependencies: ['core']
  },

  // Case management bundle
  cases: {
    priority: RoutePriority.HIGH,
    chunks: ['Cases', 'CaseDetail', 'Tasks', 'TaskDetail'],
    preload: true,
    dependencies: ['core', 'clients']
  },

  // Communication bundle
  communications: {
    priority: RoutePriority.MEDIUM,
    chunks: ['Emails', 'Calendar'],
    preload: false,
    dependencies: ['core']
  },

  // Business tools bundle
  business: {
    priority: RoutePriority.MEDIUM,
    chunks: ['Proposals', 'ProposalDetail', 'TimeTracking', 'Documents'],
    preload: false,
    dependencies: ['core']
  },

  // Admin bundle - lazy loaded
  admin: {
    priority: RoutePriority.LOW,
    chunks: ['Users', 'Reports', 'SecurityAudit', 'Workflows'],
    preload: false,
    dependencies: ['core']
  },

  // Integrations bundle - lazy loaded
  integrations: {
    priority: RoutePriority.LOW,
    chunks: ['IntegrationSettings', 'QuantumPage', 'QuantumImport', 'QuantumBilling'],
    preload: false,
    dependencies: ['core']
  },

  // AI bundle - lazy loaded
  ai: {
    priority: RoutePriority.LOW,
    chunks: ['AdvancedAI', 'AIAdmin', 'IntelligentDashboard'],
    preload: false,
    dependencies: ['core']
  }
} as const

// Advanced lazy loading with bundle optimization
export const createOptimizedBundle = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  bundleName: keyof typeof bundleConfig,
  chunkName: string
) => {
  const config = bundleConfig[bundleName]
  
  // Create lazy component with webpack magic comments for bundle splitting
  const LazyComponent = lazy(() => 
    importFn().then(module => {
      // Mark successful chunk load
      performance.mark(`chunk-${chunkName}-loaded`)
      
      // Log bundle loading
      if (process.env.NODE_ENV === 'development') {
        console.log(`📦 [Bundle] Loaded ${chunkName} from ${bundleName} bundle`)
      }
      
      return module
    }).catch(error => {
      // Handle chunk loading errors
      console.error(`❌ [Bundle] Failed to load ${chunkName}:`, error)
      
      // Retry logic for failed chunks
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          importFn().then(module => {
            performance.mark(`chunk-${chunkName}-retry-loaded`)
            return module
          }).catch(reject)
        }, 1000)
      })
    })
  )

  // Add bundle metadata
  ;(LazyComponent as any).__bundleInfo = {
    bundleName,
    chunkName,
    priority: config.priority,
    dependencies: config.dependencies
  }

  return LazyComponent
}

// Bundle size analyzer
export const analyzeBundleSize = async () => {
  if (typeof window === 'undefined') return null

  const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  const jsResources = entries.filter(entry => 
    entry.name.includes('.js') && 
    !entry.name.includes('node_modules')
  )

  const bundleAnalysis = {
    totalSize: 0,
    gzippedSize: 0,
    chunks: [] as Array<{
      name: string
      size: number
      loadTime: number
      cached: boolean
    }>
  }

  jsResources.forEach(resource => {
    const size = resource.transferSize || 0
    const loadTime = resource.responseEnd - resource.responseStart
    
    bundleAnalysis.totalSize += size
    bundleAnalysis.chunks.push({
      name: resource.name.split('/').pop() || 'unknown',
      size: Math.round(size / 1024), // KB
      loadTime: Math.round(loadTime),
      cached: resource.transferSize === 0
    })
  })

  bundleAnalysis.totalSize = Math.round(bundleAnalysis.totalSize / 1024) // KB

  // Performance budget warnings
  const sizeBudget = 500 // 500KB
  if (bundleAnalysis.totalSize > sizeBudget) {
    console.warn(`⚠️ [Bundle] Size exceeds budget: ${bundleAnalysis.totalSize}KB > ${sizeBudget}KB`)
  }

  return bundleAnalysis
}

// Tree shaking utilities
export const optimizeImports = {
  // Only import what's needed from large libraries
  lodash: {
    // ❌ import _ from 'lodash'
    // ✅ import { debounce, throttle } from 'lodash'
    recommended: 'Use specific imports: import { debounce } from "lodash"'
  },
  
  lucideReact: {
    // ❌ import * as Icons from 'lucide-react'
    // ✅ import { Search, User } from 'lucide-react'
    recommended: 'Use specific imports: import { Search } from "lucide-react"'
  },
  
  dateFns: {
    // ❌ import * as dateFns from 'date-fns'
    // ✅ import { format, parseISO } from 'date-fns'
    recommended: 'Use specific imports: import { format } from "date-fns"'
  }
}

// Preload critical resources
export const preloadCriticalResources = () => {
  if (typeof window === 'undefined') return

  const criticalResources = [
    // Preload critical CSS
    { href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2' },
    
    // Preload critical images
    { href: '/logo.svg', as: 'image' },
    
    // DNS prefetch for external resources
    { href: 'https://fonts.googleapis.com', rel: 'dns-prefetch' },
    { href: 'https://fonts.gstatic.com', rel: 'dns-prefetch' }
  ]

  criticalResources.forEach(resource => {
    const link = document.createElement('link')
    Object.assign(link, resource)
    link.rel = resource.rel || 'preload'
    document.head.appendChild(link)
  })

  console.log('🚀 [Performance] Preloaded critical resources')
}

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })

    console.log('✅ [SW] Service Worker registered:', registration.scope)

    // Update service worker when new version is available
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('🔄 [SW] New version available')
            // Notify user about update
            window.dispatchEvent(new CustomEvent('sw-update-available'))
          }
        })
      }
    })

    return true
  } catch (error) {
    console.error('❌ [SW] Service Worker registration failed:', error)
    return false
  }
}