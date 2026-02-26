import React from 'react'

export const tableOptimizations = {
  // Row height optimization based on content
  calculateOptimalRowHeight: (hasAvatar: boolean, hasMultilineContent: boolean): number => {
    let baseHeight = 56 // Base row height
    
    if (hasAvatar) baseHeight += 8
    if (hasMultilineContent) baseHeight += 20
    
    return Math.max(baseHeight, 48) // Minimum height
  },

  // Column width optimization
  getOptimalColumnWidths: (columns: string[], containerWidth: number) => {
    const totalColumns = columns.length
    const minColumnWidth = 120
    const maxColumnWidth = 300
    
    // Distribute width evenly, respecting min/max constraints
    const availableWidth = containerWidth - (totalColumns * 20) // Account for padding
    let columnWidth = Math.max(availableWidth / totalColumns, minColumnWidth)
    columnWidth = Math.min(columnWidth, maxColumnWidth)
    
    return columnWidth
  },

  // Virtualization threshold based on device performance
  getVirtualizationThreshold: (): number => {
    // Detect device performance level
    const isLowEnd = navigator.hardwareConcurrency <= 4 || 
                     (navigator as any).deviceMemory <= 4

    return isLowEnd ? 25 : 50
  },

  // Memoization helpers for table cells
  createMemoizedCell: <T>(
    Component: React.ComponentType<{ item: T; index: number }>,
    dependencies: (item: T) => any[]
  ) => {
    return React.memo(Component, (prevProps, nextProps) => {
      if (prevProps.index !== nextProps.index) return false
      
      const prevDeps = dependencies(prevProps.item)
      const nextDeps = dependencies(nextProps.item)
      
      return prevDeps.every((dep, i) => dep === nextDeps[i])
    })
  },

  // Scroll optimization
  getScrollConfig: (itemCount: number) => ({
    overscan: Math.min(Math.ceil(itemCount * 0.1), 10), // 10% overscan, max 10 items
    threshold: Math.min(itemCount * 0.2, 50) // 20% threshold, max 50 items
  }),

  // Performance monitoring helpers
  trackTablePerformance: (tableName: string, metrics: {
    itemCount: number
    renderTime: number
    scrollPosition: number
  }) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 [${tableName}] Performance:`, {
        items: metrics.itemCount,
        renderTime: `${metrics.renderTime.toFixed(2)}ms`,
        scrollPosition: metrics.scrollPosition,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 'N/A'
      })
    }
  },

  // Data processing optimizations
  optimizeDataForVirtualization: <T>(
    data: T[],
    keyExtractor: (item: T) => string
  ) => {
    // Pre-process data for better virtualization performance
    return data.map((item, index) => ({
      ...item,
      _virtualKey: keyExtractor(item),
      _virtualIndex: index
    }))
  },

  // Filtering optimizations
  createOptimizedFilter: <T>(
    filterFn: (item: T, searchTerm: string) => boolean
  ) => {
    const cache = new Map<string, T[]>()
    
    return (data: T[], searchTerm: string): T[] => {
      const cacheKey = `${searchTerm}-${data.length}`
      
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey)!
      }
      
      const filtered = data.filter(item => filterFn(item, searchTerm))
      cache.set(cacheKey, filtered)
      
      // Clear cache when it gets too large
      if (cache.size > 100) {
        const oldestKey = cache.keys().next().value
        cache.delete(oldestKey)
      }
      
      return filtered
    }
  },

  // Batch operations optimization
  createBatchProcessor: <T>(
    processFn: (batch: T[]) => Promise<void>,
    batchSize: number = 50
  ) => {
    return async (items: T[]): Promise<void> => {
      const batches = []
      for (let i = 0; i < items.length; i += batchSize) {
        batches.push(items.slice(i, i + batchSize))
      }
      
      // Process batches sequentially to avoid overwhelming the system
      for (const batch of batches) {
        await processFn(batch)
        // Small delay to prevent UI blocking
        await new Promise(resolve => setTimeout(resolve, 10))
      }
    }
  }
}