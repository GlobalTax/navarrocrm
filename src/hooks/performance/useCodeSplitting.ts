
import { useEffect, useState, useCallback } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface CodeSplittingOptions {
  chunkSizeLimit?: number
  preloadCritical?: boolean
  lazyLoadThreshold?: number
}

interface ChunkInfo {
  name: string
  size: number
  loaded: boolean
  critical: boolean
  loadTime?: number
}

export const useCodeSplitting = (options: CodeSplittingOptions = {}) => {
  const { chunkSizeLimit = 250 * 1024, preloadCritical = true, lazyLoadThreshold = 0.1 } = options
  const [chunks, setChunks] = useState<Map<string, ChunkInfo>>(new Map())
  const [loadingChunks, setLoadingChunks] = useState<Set<string>>(new Set())
  const logger = useLogger('CodeSplitting')

  const analyzeChunks = useCallback(() => {
    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    const chunkMap = new Map<string, ChunkInfo>()

    resourceEntries.forEach(entry => {
      if (entry.name.includes('.js') && !entry.name.includes('node_modules')) {
        const name = entry.name.split('/').pop() || entry.name
        const size = entry.transferSize || entry.encodedBodySize || 0
        const loadTime = entry.responseEnd - entry.requestStart

        // Determine if chunk is critical (loaded early)
        const critical = entry.startTime < 3000 // First 3 seconds

        chunkMap.set(name, {
          name,
          size,
          loaded: true,
          critical,
          loadTime
        })

        if (size > chunkSizeLimit) {
        logger.warn('📦 Large chunk detected', {
          name,
          totalSize: `${(size / 1024).toFixed(1)}KB`,
          limit: `${(chunkSizeLimit / 1024).toFixed(1)}KB`
        })
        }
      }
    })

    setChunks(chunkMap)
  }, [chunkSizeLimit, logger])

  const preloadChunk = async (chunkName: string): Promise<void> => {
    if (loadingChunks.has(chunkName)) return

    setLoadingChunks(prev => new Set(prev).add(chunkName))

    try {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'script'
      link.href = chunkName
      
      const loadPromise = new Promise<void>((resolve, reject) => {
        link.onload = () => resolve()
        link.onerror = () => reject(new Error(`Failed to preload ${chunkName}`))
      })

      document.head.appendChild(link)
      await loadPromise

      logger.info('🚀 Chunk preloaded', { chunkName })

    } catch (error) {
      logger.error('Chunk preload failed', { chunkName, error })
    } finally {
      setLoadingChunks(prev => {
        const newSet = new Set(prev)
        newSet.delete(chunkName)
        return newSet
      })
    }
  }

  const loadChunkOnDemand = async (importFn: () => Promise<any>): Promise<any> => {
    const startTime = performance.now()

    try {
      const module = await importFn()
      const loadTime = performance.now() - startTime

      logger.info('📦 Chunk loaded on demand', {
        loadTime: `${loadTime.toFixed(2)}ms`
      })

      return module
    } catch (error) {
      logger.error('On-demand chunk loading failed', { error })
      throw error
    }
  }

  const optimizeChunkLoading = useCallback(() => {
    chunks.forEach((chunk, name) => {
      // Preload critical chunks if they're not too large
      if (chunk.critical && chunk.size < chunkSizeLimit && preloadCritical) {
        if (!chunk.loaded && !loadingChunks.has(name)) {
          preloadChunk(name)
        }
      }
    })
  }, [chunks, chunkSizeLimit, preloadCritical, loadingChunks])

  useEffect(() => {
    analyzeChunks()
    
    // Re-analyze when new resources are loaded
    const observer = new PerformanceObserver(() => {
      analyzeChunks()
    })
    
    observer.observe({ entryTypes: ['resource'] })

    return () => observer.disconnect()
  }, [analyzeChunks])

  useEffect(() => {
    optimizeChunkLoading()
  }, [optimizeChunkLoading])

  const getChunkStats = () => {
    const chunkArray = Array.from(chunks.values())
    const totalSize = chunkArray.reduce((sum, chunk) => sum + chunk.size, 0)
    const criticalChunks = chunkArray.filter(chunk => chunk.critical)
    const avgLoadTime = chunkArray
      .filter(chunk => chunk.loadTime)
      .reduce((sum, chunk, _, arr) => sum + (chunk.loadTime! / arr.length), 0)

    return {
      totalChunks: chunkArray.length,
      totalSize,
      criticalChunks: criticalChunks.length,
      avgLoadTime,
      largestChunk: chunkArray.reduce((largest, chunk) => 
        chunk.size > largest.size ? chunk : largest, 
        { size: 0, name: '' }
      )
    }
  }

  return {
    chunks,
    loadingChunks,
    preloadChunk,
    loadChunkOnDemand,
    getChunkStats,
    analyzeChunks
  }
}
