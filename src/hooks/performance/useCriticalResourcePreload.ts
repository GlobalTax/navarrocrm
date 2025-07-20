
import { useEffect, useState } from 'react'
import { useNetworkStatus } from './useNetworkStatus'
import type { FilterState } from '@/types/states'

interface PreloadOptions {
  priority: 'high' | 'medium' | 'low'
  condition?: () => boolean
  retries?: number
}

interface PreloadedResource {
  url: string
  status: 'pending' | 'loaded' | 'error'
  timestamp: number
  retries: number
}

interface CriticalResourcePreload {
  preloadResource: (url: string, options?: PreloadOptions) => Promise<void>
  preloadedResources: Record<string, PreloadedResource>
  isPreloading: boolean
  preloadComponentData: (componentName: string) => Promise<void>
  preloadUserData: () => Promise<void>
}

export const useCriticalResourcePreload = (): CriticalResourcePreload => {
  const { networkInfo } = useNetworkStatus()
  const [preloadedResources, setPreloadedResources] = useState<Record<string, PreloadedResource>>({})
  const [isPreloading, setIsPreloading] = useState<boolean>(false)

  const shouldPreload = (): boolean => {
    return networkInfo.isOnline && !networkInfo.saveData
  }

  const preloadResource = async (url: string, options: PreloadOptions = { priority: 'medium' }): Promise<void> => {
    if (!shouldPreload()) return

    // Check if resource is already preloaded or in progress
    const existing = preloadedResources[url]
    if (existing && (existing.status === 'loaded' || existing.status === 'pending')) {
      return
    }

    setIsPreloading(true)
    setPreloadedResources(prev => ({
      ...prev,
      [url]: {
        url,
        status: 'pending',
        timestamp: Date.now(),
        retries: 0
      }
    }))

    try {
      if (options.condition && !options.condition()) {
        return
      }

      // Determine preload method based on resource type
      if (url.endsWith('.js') || url.endsWith('.ts')) {
        await preloadScript(url)
      } else if (url.endsWith('.css')) {
        await preloadStylesheet(url)
      } else if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        await preloadImage(url)
      } else {
        await preloadGeneric(url)
      }

      setPreloadedResources(prev => ({
        ...prev,
        [url]: {
          ...prev[url],
          status: 'loaded',
          timestamp: Date.now()
        }
      }))
    } catch (error) {
      const maxRetries = options.retries || 2
      const currentRetries = preloadedResources[url]?.retries || 0

      if (currentRetries < maxRetries) {
        setPreloadedResources(prev => ({
          ...prev,
          [url]: {
            ...prev[url],
            retries: currentRetries + 1
          }
        }))

        // Retry with exponential backoff
        setTimeout(() => {
          preloadResource(url, options)
        }, Math.pow(2, currentRetries) * 1000)
      } else {
        setPreloadedResources(prev => ({
          ...prev,
          [url]: {
            ...prev[url],
            status: 'error',
            timestamp: Date.now()
          }
        }))
      }
    } finally {
      setIsPreloading(false)
    }
  }

  const preloadScript = async (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'modulepreload'
      link.href = url
      link.onload = () => resolve()
      link.onerror = () => reject(new Error(`Failed to preload script: ${url}`))
      document.head.appendChild(link)
    })
  }

  const preloadStylesheet = async (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'style'
      link.href = url
      link.onload = () => resolve()
      link.onerror = () => reject(new Error(`Failed to preload stylesheet: ${url}`))
      document.head.appendChild(link)
    })
  }

  const preloadImage = async (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to preload image: ${url}`))
      img.src = url
    })
  }

  const preloadGeneric = async (url: string): Promise<void> => {
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors'
    })
    
    if (!response.ok && response.status !== 0) {
      throw new Error(`Failed to preload resource: ${url}`)
    }
  }

  const preloadComponentData = async (componentName: string): Promise<void> => {
    const componentRoutes: Record<string, string[]> = {
      contacts: ['/api/contacts', '/api/companies'],
      cases: ['/api/cases', '/api/tasks'],  
      calendar: ['/api/calendar-events'],
      dashboard: ['/api/analytics/summary'],
      proposals: ['/api/proposals']
    }

    const routes = componentRoutes[componentName.toLowerCase()]
    if (!routes) return

    const preloadPromises = routes.map(route => 
      preloadResource(route, { priority: 'high' })
    )

    await Promise.allSettled(preloadPromises)
  }

  const preloadUserData = async (): Promise<void> => {
    const userDataEndpoints = [
      '/api/user/profile',
      '/api/user/preferences', 
      '/api/user/notifications'
    ]

    const preloadPromises = userDataEndpoints.map(endpoint =>
      preloadResource(endpoint, { priority: 'high' })
    )

    await Promise.allSettled(preloadPromises)
  }

  // Auto-preload critical resources on mount
  useEffect(() => {
    if (shouldPreload()) {
      // Preload common resources
      const criticalResources = [
        '/api/user/profile',
        '/api/organizations/current'
      ]

      criticalResources.forEach(resource => {
        preloadResource(resource, { priority: 'high' })
      })
    }
  }, [networkInfo.isOnline, networkInfo.saveData])

  // Cleanup old preloaded resources
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now()
      const maxAge = 10 * 60 * 1000 // 10 minutes

      setPreloadedResources(prev => {
        const filtered = Object.entries(prev).reduce((acc, [url, resource]) => {
          if (now - resource.timestamp < maxAge) {
            acc[url] = resource
          }
          return acc
        }, {} as Record<string, PreloadedResource>)

        return filtered
      })
    }, 5 * 60 * 1000) // Check every 5 minutes

    return () => clearInterval(cleanup)
  }, [])

  return {
    preloadResource,
    preloadedResources,
    isPreloading,
    preloadComponentData,
    preloadUserData
  }
}
