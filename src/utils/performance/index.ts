/**
 * Performance utilities for React optimization
 */

export * from './memoization'

// Re-export commonly used React optimization hooks
export { memo, useMemo, useCallback, useRef } from 'react'

import React from 'react'

/**
 * Lazy loading utility with error boundary
 */
export const createLazyComponent = (
  importFn: () => Promise<{ default: React.ComponentType<any> }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = React.lazy(importFn)
  
  return (props: any) => {
    const fallbackElement = fallback ? React.createElement(fallback) : React.createElement('div', {}, 'Cargando...')
    
    return React.createElement(
      React.Suspense,
      { fallback: fallbackElement },
      React.createElement(LazyComponent, props)
    )
  }
}