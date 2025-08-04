import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useLogger } from '@/hooks/useLogger'

interface PreloadConfig {
  routes: string[]
  delay?: number
  condition?: () => boolean
}

// Cache para componentes precargados
const preloadCache = new Map<string, Promise<any>>()

// Mapa de rutas a funciones de importación
const routeImportMap: Record<string, () => Promise<any>> = {
  '/contacts': () => import('@/pages/Contacts'),
  '/cases': () => import('@/pages/Cases'),
  '/tasks': () => import('@/pages/Tasks'),
  '/time-tracking': () => import('@/pages/TimeTracking'),
  '/dashboard': () => import('@/pages/Dashboard'),
  '/proposals': () => import('@/pages/Proposals'),
  '/documents': () => import('@/pages/Documents'),
  '/calendar': () => import('@/pages/Calendar'),
  '/emails': () => import('@/pages/Emails'),
  '/users': () => import('@/pages/Users'),
  '/reports': () => import('@/pages/Reports')
}

export const useRoutePreloader = (config: PreloadConfig) => {
  const location = useLocation()
  const logger = useLogger('RoutePreloader')
  const preloadTimerRef = useRef<NodeJS.Timeout>()

  const preloadRoute = async (route: string) => {
    if (preloadCache.has(route)) {
      return preloadCache.get(route)
    }

    const importFn = routeImportMap[route]
    if (!importFn) {
      logger.warn(`No import function found for route: ${route}`)
      return
    }

    const preloadPromise = importFn()
      .then(module => {
        logger.info(`✅ Preloaded route: ${route}`)
        return module
      })
      .catch(error => {
        logger.error(`❌ Failed to preload route: ${route}`, { error })
        preloadCache.delete(route) // Remove from cache on failure
        throw error
      })

    preloadCache.set(route, preloadPromise)
    return preloadPromise
  }

  const preloadRoutes = async (routes: string[]) => {
    if (config.condition && !config.condition()) {
      return
    }

    logger.info(`🚀 Starting to preload ${routes.length} routes: ${routes.join(', ')}`)

    const preloadPromises = routes.map(route => 
      preloadRoute(route).catch(error => {
        // Individual route failures shouldn't stop the whole batch
        logger.error(`Route preload failed: ${route}`, { error })
        return null
      })
    )

    try {
      const results = await Promise.allSettled(preloadPromises)
      const successful = results.filter(r => r.status === 'fulfilled').length
      logger.info(`📦 Preload batch completed: ${successful}/${routes.length} successful`)
    } catch (error) {
      logger.error('Batch preload failed', { error })
    }
  }

  useEffect(() => {
    const { routes, delay = 1000 } = config

    // Clear any existing timer
    if (preloadTimerRef.current) {
      clearTimeout(preloadTimerRef.current)
    }

    // Start preloading after delay
    preloadTimerRef.current = setTimeout(() => {
      preloadRoutes(routes)
    }, delay)

    return () => {
      if (preloadTimerRef.current) {
        clearTimeout(preloadTimerRef.current)
      }
    }
  }, [location.pathname]) // Re-run when route changes

  // Preload on interaction
  const preloadOnHover = (route: string) => {
    return {
      onMouseEnter: () => {
        if (!preloadCache.has(route)) {
          preloadRoute(route)
        }
      }
    }
  }

  return {
    preloadRoute,
    preloadRoutes,
    preloadOnHover,
    isPreloaded: (route: string) => preloadCache.has(route)
  }
}

// Hook específico para rutas críticas
export const useCriticalRoutePreloader = () => {
  return useRoutePreloader({
    routes: ['/dashboard', '/contacts', '/cases'],
    delay: 500,
    condition: () => true // Always preload critical routes
  })
}

// Hook específico para rutas según el contexto
export const useContextualPreloader = () => {
  const location = useLocation()

  const getRelatedRoutes = (currentPath: string): string[] => {
    // Preload related routes based on current location
    if (currentPath.startsWith('/contacts')) {
      return ['/cases', '/tasks', '/clients']
    }
    
    if (currentPath.startsWith('/cases')) {
      return ['/tasks', '/contacts', '/time-tracking']
    }
    
    if (currentPath.startsWith('/tasks')) {
      return ['/cases', '/time-tracking', '/contacts']
    }
    
    if (currentPath === '/dashboard' || currentPath === '/') {
      return ['/contacts', '/cases', '/tasks', '/time-tracking']
    }
    
    return []
  }

  return useRoutePreloader({
    routes: getRelatedRoutes(location.pathname),
    delay: 2000,
    condition: () => !document.hidden // Don't preload if tab is hidden
  })
}