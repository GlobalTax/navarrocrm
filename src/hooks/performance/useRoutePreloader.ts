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

// Mapa de rutas a funciones de importación (solo rutas que existen)
const routeImportMap: Record<string, () => Promise<any>> = {
  '/contacts': () => import('@/pages/Contacts'),
  '/cases': () => import('@/pages/Cases'),
  '/tasks': () => import('@/pages/Tasks'),
  '/time-tracking': () => import('@/pages/TimeTracking'),
  '/dashboard': () => import('@/pages/Dashboard'),
  '/proposals': () => import('@/pages/Proposals')
  // Removidas rutas que causan 404: documents, calendar, emails, users, reports
}

export const useRoutePreloader = (config: PreloadConfig) => {
  const location = useLocation()
  const logger = useLogger('RoutePreloader')
  const preloadTimerRef = useRef<NodeJS.Timeout>()
  const lastLocationRef = useRef<string>()
  const debounceTimerRef = useRef<NodeJS.Timeout>()

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
    const currentPath = location.pathname

    // Only preload if location actually changed
    if (lastLocationRef.current === currentPath) {
      return
    }

    // Clear any existing timers
    if (preloadTimerRef.current) {
      clearTimeout(preloadTimerRef.current)
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Debounce to prevent excessive preloading
    debounceTimerRef.current = setTimeout(() => {
      lastLocationRef.current = currentPath
      
      // Start preloading after additional delay
      preloadTimerRef.current = setTimeout(() => {
        preloadRoutes(routes)
      }, delay)
    }, 500) // 500ms debounce

    return () => {
      if (preloadTimerRef.current) {
        clearTimeout(preloadTimerRef.current)
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [location.pathname])

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
    // Preload only existing related routes
    if (currentPath.startsWith('/contacts')) {
      return ['/cases', '/tasks']
    }
    
    if (currentPath.startsWith('/cases')) {
      return ['/tasks', '/contacts', '/time-tracking']
    }
    
    if (currentPath.startsWith('/tasks')) {
      return ['/cases', '/time-tracking', '/contacts']
    }
    
    if (currentPath === '/dashboard' || currentPath === '/') {
      return ['/contacts', '/cases', '/tasks']
    }
    
    return []
  }

  return useRoutePreloader({
    routes: getRelatedRoutes(location.pathname),
    delay: 3000, // Increased delay to reduce aggressive preloading
    condition: () => !document.hidden && !document.hasFocus() === false // Only when tab is active and focused
  })
}