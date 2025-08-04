import { useEffect, useRef } from 'react'
import { useLogger } from '@/hooks/useLogger'

// Resource preloader avanzado
export const useResourcePreloader = () => {
  const logger = useLogger('ResourcePreloader')
  const preloadedResources = useRef(new Set<string>())

  const preloadResource = (
    url: string,
    type: 'image' | 'script' | 'style' | 'font' = 'image'
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (preloadedResources.current.has(url)) {
        resolve()
        return
      }

      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = url

      switch (type) {
        case 'image':
          link.as = 'image'
          break
        case 'script':
          link.as = 'script'
          break
        case 'style':
          link.as = 'style'
          break
        case 'font':
          link.as = 'font'
          link.crossOrigin = 'anonymous'
          break
      }

      link.onload = () => {
        preloadedResources.current.add(url)
        logger.info(`Preloaded ${type}: ${url}`)
        resolve()
      }

      link.onerror = () => {
        logger.error(`Failed to preload ${type}: ${url}`)
        reject(new Error(`Failed to preload ${url}`))
      }

      document.head.appendChild(link)
    })
  }

  return {
    preloadResource,
    isPreloaded: (url: string) => preloadedResources.current.has(url)
  }
}