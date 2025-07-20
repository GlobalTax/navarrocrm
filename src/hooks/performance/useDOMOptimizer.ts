
import { useEffect, useRef, useState, useCallback } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface DOMMetrics {
  nodeCount: number
  depth: number
  leafNodes: number
  unusedElements: number
  duplicateClasses: string[]
  largeTexts: number
}

interface DOMOptimizationOptions {
  maxNodes?: number
  maxDepth?: number
  cleanupInterval?: number
  detectUnused?: boolean
}

export const useDOMOptimizer = (options: DOMOptimizationOptions = {}) => {
  const { maxNodes = 5000, maxDepth = 15, cleanupInterval = 30000, detectUnused = true } = options
  const [metrics, setMetrics] = useState<DOMMetrics | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const logger = useLogger('DOMOptimizer')
  const cleanupIntervalRef = useRef<NodeJS.Timeout>()
  const mutationObserver = useRef<MutationObserver>()

  const analyzeDOMStructure = useCallback((): DOMMetrics => {
    const startTime = performance.now()
    
    const allNodes = document.querySelectorAll('*')
    const nodeCount = allNodes.length
    
    // Calculate maximum depth
    let maxDepthFound = 0
    const calculateDepth = (element: Element, currentDepth = 0): number => {
      maxDepthFound = Math.max(maxDepthFound, currentDepth)
      Array.from(element.children).forEach(child => 
        calculateDepth(child, currentDepth + 1)
      )
      return maxDepthFound
    }
    calculateDepth(document.documentElement)

    // Count leaf nodes (elements with no children)
    const leafNodes = Array.from(allNodes).filter(node => node.children.length === 0).length

    // Detect unused elements (simplified heuristic)
    let unusedElements = 0
    if (detectUnused) {
      allNodes.forEach(node => {
        const rect = node.getBoundingClientRect()
        if (rect.width === 0 && rect.height === 0 && !node.textContent?.trim()) {
          unusedElements++
        }
      })
    }

    // Find duplicate classes
    const classMap = new Map<string, number>()
    allNodes.forEach(node => {
      if (node.className && typeof node.className === 'string') {
        node.className.split(' ').forEach(className => {
          if (className.trim()) {
            classMap.set(className, (classMap.get(className) || 0) + 1)
          }
        })
      }
    })
    
    const duplicateClasses = Array.from(classMap.entries())
      .filter(([, count]) => count > 50) // Classes used more than 50 times
      .map(([className]) => className)
      .slice(0, 10) // Top 10

    // Count large text nodes
    const largeTexts = Array.from(document.querySelectorAll('*'))
      .filter(el => el.textContent && el.textContent.length > 1000).length

    const analysisTime = performance.now() - startTime

    logger.info('🔍 DOM structure analyzed', {
      nodeCount,
      depth: maxDepthFound,
      leafNodes,
      unusedElements,
      analysisTime: `${analysisTime.toFixed(2)}ms`
    })

    return {
      nodeCount,
      depth: maxDepthFound,
      leafNodes,
      unusedElements,
      duplicateClasses,
      largeTexts
    }
  }, [detectUnused, logger])

  const optimizeDOM = useCallback(async () => {
    if (isOptimizing) return

    setIsOptimizing(true)
    const startTime = performance.now()

    try {
      let optimizationsApplied = 0

      // Remove unused attributes
      document.querySelectorAll('*').forEach(element => {
        // Remove empty style attributes
        if (element.getAttribute('style') === '') {
          element.removeAttribute('style')
          optimizationsApplied++
        }

        // Remove empty class attributes
        if (element.className === '') {
          element.removeAttribute('class')
          optimizationsApplied++
        }
      })

      // Optimize images without alt text
      document.querySelectorAll('img:not([alt])').forEach(img => {
        img.setAttribute('alt', '')
        optimizationsApplied++
      })

      // Add loading="lazy" to images below the fold
      document.querySelectorAll('img:not([loading])').forEach(img => {
        const rect = img.getBoundingClientRect()
        if (rect.top > window.innerHeight) {
          img.setAttribute('loading', 'lazy')
          optimizationsApplied++
        }
      })

      const optimizationTime = performance.now() - startTime

      logger.info('⚡ DOM optimized', {
        optimizations: optimizationsApplied,
        time: `${optimizationTime.toFixed(2)}ms`
      })

    } catch (error) {
      logger.error('DOM optimization failed', { error })
    } finally {
      setIsOptimizing(false)
    }
  }, [isOptimizing, logger])

  const setupMutationObserver = useCallback(() => {
    if (mutationObserver.current) {
      mutationObserver.current.disconnect()
    }

    mutationObserver.current = new MutationObserver((mutations) => {
      let significantChanges = 0
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          significantChanges += mutation.addedNodes.length
        }
      })

      // Re-analyze if significant DOM changes occurred
      if (significantChanges > 10) {
        setTimeout(() => {
          const newMetrics = analyzeDOMStructure()
          setMetrics(newMetrics)

          // Auto-optimize if thresholds are exceeded
          if (newMetrics.nodeCount > maxNodes || newMetrics.depth > maxDepth) {
            logger.warn('🚨 DOM complexity threshold exceeded', {
              nodes: newMetrics.nodeCount,
              depth: newMetrics.depth
            })
            optimizeDOM()
          }
        }, 1000) // Debounce
      }
    })

    mutationObserver.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    })
  }, [analyzeDOMStructure, maxNodes, maxDepth, optimizeDOM, logger])

  useEffect(() => {
    // Initial analysis
    const initialMetrics = analyzeDOMStructure()
    setMetrics(initialMetrics)

    // Setup mutation observer
    setupMutationObserver()

    // Setup periodic cleanup
    if (cleanupInterval > 0) {
      cleanupIntervalRef.current = setInterval(() => {
        optimizeDOM()
      }, cleanupInterval)
    }

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current)
      }
      if (mutationObserver.current) {
        mutationObserver.current.disconnect()
      }
    }
  }, [analyzeDOMStructure, setupMutationObserver, cleanupInterval, optimizeDOM])

  const getDOMHealth = () => {
    if (!metrics) return null

    const healthScore = Math.max(0, 100 - 
      (metrics.nodeCount > maxNodes ? 20 : 0) -
      (metrics.depth > maxDepth ? 20 : 0) -
      (metrics.unusedElements > metrics.nodeCount * 0.1 ? 15 : 0) -
      (metrics.largeTexts > 5 ? 10 : 0)
    )

    return {
      score: healthScore,
      status: healthScore > 80 ? 'excellent' : healthScore > 60 ? 'good' : 'needs-improvement',
      issues: [
        metrics.nodeCount > maxNodes && `Too many DOM nodes (${metrics.nodeCount})`,
        metrics.depth > maxDepth && `DOM too deep (${metrics.depth} levels)`,
        metrics.unusedElements > 0 && `${metrics.unusedElements} unused elements`,
        metrics.largeTexts > 5 && `${metrics.largeTexts} large text nodes`
      ].filter(Boolean)
    }
  }

  return {
    metrics,
    isOptimizing,
    optimizeDOM,
    getDOMHealth,
    analyzeDOMStructure
  }
}
