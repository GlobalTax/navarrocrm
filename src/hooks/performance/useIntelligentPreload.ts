
import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface PreloadConfig {
  routes: string[]
  delay?: number
  probability?: number
}

export const useIntelligentPreload = (config: PreloadConfig) => {
  const navigate = useNavigate()
  const location = useLocation()
  const preloadedRoutes = useRef(new Set<string>())
  const userBehavior = useRef({
    visitedRoutes: new Set<string>(),
    transitions: new Map<string, string[]>()
  })

  useEffect(() => {
    // Track user navigation patterns
    const currentPath = location.pathname
    userBehavior.current.visitedRoutes.add(currentPath)

    // Predict next likely route based on patterns
    const predictNextRoute = () => {
      const transitions = userBehavior.current.transitions.get(currentPath) || []
      if (transitions.length > 0) {
        // Return most common transition
        const routeCounts = transitions.reduce((acc, route) => {
          acc[route] = (acc[route] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        return Object.entries(routeCounts)
          .sort(([,a], [,b]) => b - a)[0][0]
      }
      return null
    }

    // Preload likely next route
    const preloadTimer = setTimeout(() => {
      const nextRoute = predictNextRoute()
      if (nextRoute && !preloadedRoutes.current.has(nextRoute)) {
        const shouldPreload = Math.random() < (config.probability || 0.7)
        
        if (shouldPreload) {
          // Preload route component
          const routeImports: Record<string, () => Promise<any>> = {
            '/contacts': () => import('@/pages/Contacts'),
            '/dashboard': () => import('@/pages/Dashboard'),
            '/emails': () => import('@/pages/Emails'),
            '/setup': () => import('@/pages/Setup')
          }
          
          const importFn = routeImports[nextRoute]
          if (importFn) {
            importFn().then(() => {
              preloadedRoutes.current.add(nextRoute)
              console.log(`🚀 Preloaded route: ${nextRoute}`)
            }).catch(console.warn)
          }
        }
      }
    }, config.delay || 2000)

    return () => clearTimeout(preloadTimer)
  }, [location.pathname, config.delay, config.probability])

  // Record route transitions
  useEffect(() => {
    const currentPath = location.pathname
    const transitions = userBehavior.current.transitions
    
    return () => {
      // On route change, record the transition
      const newPath = window.location.pathname
      if (currentPath !== newPath) {
        const pathTransitions = transitions.get(currentPath) || []
        pathTransitions.push(newPath)
        transitions.set(currentPath, pathTransitions)
      }
    }
  }, [location.pathname])

  return {
    preloadedRoutes: Array.from(preloadedRoutes.current),
    userBehavior: {
      visitedRoutes: Array.from(userBehavior.current.visitedRoutes),
      commonTransitions: Object.fromEntries(userBehavior.current.transitions)
    }
  }
}
