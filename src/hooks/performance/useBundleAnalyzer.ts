
import { useEffect, useState, useRef } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface BundleInfo {
  totalSize: number
  gzippedSize: number
  chunkCount: number
  largestChunk: string
  duplicateModules: string[]
  unusedCode: number
}

interface BundleAnalyzerOptions {
  enabled?: boolean
  sizeThreshold?: number
  reportInterval?: number
}

export const useBundleAnalyzer = (options: BundleAnalyzerOptions = {}) => {
  const { enabled = process.env.NODE_ENV === 'development', sizeThreshold = 1024 * 1024, reportInterval = 30000 } = options
  const [bundleInfo, setBundleInfo] = useState<BundleInfo | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const logger = useLogger('BundleAnalyzer')
  const intervalRef = useRef<NodeJS.Timeout>()

  const analyzeBundleSize = async (): Promise<BundleInfo> => {
    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    let totalSize = 0
    let chunkCount = 0
    let largestChunk = ''
    let largestSize = 0
    const duplicateModules: string[] = []

    resourceEntries.forEach(entry => {
      if (entry.name.includes('.js') || entry.name.includes('.css')) {
        const size = entry.transferSize || entry.encodedBodySize || 0
        totalSize += size
        chunkCount++

        if (size > largestSize) {
          largestSize = size
          largestChunk = entry.name.split('/').pop() || ''
        }

        // Detect potential duplicates by name pattern
        const basename = entry.name.split('/').pop()?.replace(/\.[^.]+\.[^.]+$/, '') || ''
        const existing = resourceEntries.find(e => 
          e.name !== entry.name && 
          e.name.includes(basename) && 
          basename.length > 3
        )
        if (existing && !duplicateModules.includes(basename)) {
          duplicateModules.push(basename)
        }
      }
    })

    // Estimate unused code (simplified heuristic)
    const unusedCode = Math.max(0, totalSize * 0.2) // Assume 20% unused as baseline

    return {
      totalSize,
      gzippedSize: Math.round(totalSize * 0.3), // Estimate gzip compression
      chunkCount,
      largestChunk,
      duplicateModules,
      unusedCode
    }
  }

  const runAnalysis = async () => {
    if (!enabled || isAnalyzing) return

    setIsAnalyzing(true)
    
    try {
      const info = await analyzeBundleSize()
      setBundleInfo(info)

      logger.info('📦 Bundle analysis completed', {
        totalSize: `${(info.totalSize / 1024).toFixed(1)}KB`,
        chunkCount: info.chunkCount,
        largestChunk: info.largestChunk,
        duplicates: info.duplicateModules.length
      })

      // Warn about large bundles
      if (info.totalSize > sizeThreshold) {
        logger.warn('⚠️ Bundle size exceeded threshold', {
          size: `${(info.totalSize / 1024).toFixed(1)}KB`,
          threshold: `${(sizeThreshold / 1024).toFixed(1)}KB`
        })
      }

      // Alert about duplicates
      if (info.duplicateModules.length > 0) {
        logger.warn('🔄 Potential duplicate modules detected', {
          duplicates: info.duplicateModules
        })
      }

    } catch (error) {
      logger.error('Bundle analysis failed', { error })
    } finally {
      setIsAnalyzing(false)
    }
  }

  useEffect(() => {
    if (!enabled) return

    // Initial analysis after page load
    const timer = setTimeout(runAnalysis, 2000)

    // Periodic analysis
    if (reportInterval > 0) {
      intervalRef.current = setInterval(runAnalysis, reportInterval)
    }

    return () => {
      clearTimeout(timer)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, reportInterval])

  const generateReport = () => {
    if (!bundleInfo) return null

    return {
      timestamp: new Date().toISOString(),
      analysis: bundleInfo,
      recommendations: [
        bundleInfo.totalSize > sizeThreshold && 'Consider code splitting or lazy loading',
        bundleInfo.duplicateModules.length > 0 && 'Remove duplicate modules',
        bundleInfo.unusedCode > bundleInfo.totalSize * 0.3 && 'Implement tree shaking',
        bundleInfo.chunkCount > 20 && 'Consolidate small chunks'
      ].filter(Boolean),
      score: Math.max(0, 100 - (bundleInfo.totalSize / sizeThreshold) * 50)
    }
  }

  return {
    bundleInfo,
    isAnalyzing,
    runAnalysis,
    generateReport
  }
}
