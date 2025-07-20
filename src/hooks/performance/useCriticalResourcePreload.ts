import { useEffect, useCallback, useRef } from 'react'
import { useNetworkStatus } from './useNetworkStatus'
import { useLogger } from '@/hooks/useLogger'

interface CriticalResource {
  url: string
  type: 'font' | 'css' | 'script' | 'image' | 'prefetch'
  priority: 'critical' | 'high' | 'medium' | 'low'
  crossOrigin?: 'anonymous' | 'use-credentials'
  media?: string
  condition?: () => boolean
}

interface PreloadOptions {
  enableNetworkAware?: boolean
  enableIntersectionObserver?: boolean
  prefetchOnHover?: boolean
  respectDataSaver?: boolean
}

export function useCriticalResourcePreload(
  resources: CriticalResource[],
  options: PreloadOptions = {}
) {
  const logger = useLogger('CriticalPreload')
  const { isOnline, isSlowConnection, saveData } = useNetworkStatus()
  const preloadedRefs = useRef(new Set<string>())
  const hoverTimeoutRefs = useRef(new Map<string, NodeJS.Timeout>())

  const {
    enableNetworkAware = true,
    enableIntersectionObserver = true,
    prefetchOnHover = true,
    respectDataSaver = true
  } = options

  // Check if we should preload based on network conditions
  const shouldPreload = useCallback((resource: CriticalResource): boolean => {
    // Respect data saver mode
    if (respectDataSaver && saveData) {
      return resource.priority === 'critical'
    }

    // Network-aware preloading
    if (enableNetworkAware && isSlowConnection) {
      return resource.priority === 'critical' || resource.priority === 'high'
    }

    // Custom condition check
    if (resource.condition && !resource.condition()) {
      return false
    }

    return true
  }, [respectDataSaver, saveData, enableNetworkAware, isSlowConnection])

  // Preload single resource
  const preloadResource = useCallback((resource: CriticalResource) => {
    if (preloadedRefs.current.has(resource.url)) {
      return
    }

    if (!shouldPreload(resource)) {
      logger.debug('⏭️ Omitiendo preload', { 
        url: resource.url.substring(0, 50),
        priority: resource.priority,
        reason: 'network conditions'
      })
      return
    }

    try {
      const link = document.createElement('link')
      
      // Set preload attributes based on resource type
      switch (resource.type) {
        case 'font':
          link.rel = 'preload'
          link.as = 'font'
          link.type = 'font/woff2'
          link.crossOrigin = resource.crossOrigin || 'anonymous'
          break
          
        case 'css':
          link.rel = 'preload'
          link.as = 'style'
          if (resource.media) link.media = resource.media
          break
          
        case 'script':
          link.rel = 'preload'
          link.as = 'script'
          break
          
        case 'image':
          link.rel = 'preload'
          link.as = 'image'
          break
          
        case 'prefetch':
          link.rel = 'prefetch'
          break
      }

      link.href = resource.url
      
      // Add priority hint if supported
      if ('fetchPriority' in link) {
        (link as any).fetchPriority = resource.priority === 'critical' ? 'high' : 
                                      resource.priority === 'high' ? 'high' : 'low'
      }

      // Add to document head
      document.head.appendChild(link)
      preloadedRefs.current.add(resource.url)

      logger.info('⚡ Recurso precargado', {
        url: resource.url.substring(0, 50),
        type: resource.type,
        priority: resource.priority
      })

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error de preload'
      logger.error('❌ Error precargando recurso', { 
        url: resource.url.substring(0, 50),
        error: errorMsg 
      })
    }
  }, [shouldPreload, logger])

  // Preload all critical resources
  const preloadCriticalResources = useCallback(() => {
    if (!isOnline) return

    const criticalResources = resources
      .filter(r => r.priority === 'critical')
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })

    criticalResources.forEach(preloadResource)

    logger.info('🚀 Recursos críticos precargados', {
      count: criticalResources.length,
      isSlowConnection,
      saveData
    })
  }, [isOnline, resources, preloadResource, isSlowConnection, saveData, logger])

  // Preload on hover for prefetch resources
  const preloadOnHover = useCallback((url: string) => {
    if (!prefetchOnHover || preloadedRefs.current.has(url)) return

    const resource = resources.find(r => r.url === url && r.type === 'prefetch')
    if (!resource) return

    // Debounce hover preloading
    const timeoutId = setTimeout(() => {
      preloadResource(resource)
    }, 100)

    hoverTimeoutRefs.current.set(url, timeoutId)
  }, [prefetchOnHover, resources, preloadResource])

  // Cancel hover preload
  const cancelHoverPreload = useCallback((url: string) => {
    const timeoutId = hoverTimeoutRefs.current.get(url)
    if (timeoutId) {
      clearTimeout(timeoutId)
      hoverTimeoutRefs.current.delete(url)
    }
  }, [])

  // Intersection Observer for lazy preloading
  const observeElement = useCallback((element: HTMLElement, resource: CriticalResource) => {
    if (!enableIntersectionObserver || preloadedRefs.current.has(resource.url)) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            preloadResource(resource)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '50px' }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [enableIntersectionObserver, preloadResource])

  // Auto-preload critical resources on mount
  useEffect(() => {
    preloadCriticalResources()
  }, [preloadCriticalResources])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      hoverTimeoutRefs.current.forEach(clearTimeout)
      hoverTimeoutRefs.current.clear()
    }
  }, [])

  return {
    preloadResource,
    preloadOnHover,
    cancelHoverPreload,
    observeElement,
    preloadedCount: preloadedRefs.current.size,
    isNetworkOptimal: isOnline && !isSlowConnection && !saveData
  }
}