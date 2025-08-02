/**
 * Performance Monitor - Sistema de monitoreo de performance
 * Recopila métricas clave y las envía al sistema de logging
 */

import { createLogger } from '@/utils/logging'

const performanceLogger = createLogger('Performance')

interface PerformanceMetrics {
  component: string
  renderTime: number
  mountTime: number
  updateCount: number
  memoryUsage?: number
}

interface WebVitalsMetrics {
  fcp: number // First Contentful Paint
  lcp: number // Largest Contentful Paint
  cls: number // Cumulative Layout Shift
  fid: number // First Input Delay
}

class PerformanceMonitor {
  private renderTimes = new Map<string, number>()
  private updateCounts = new Map<string, number>()

  /**
   * Marca el inicio de render de un componente
   */
  markRenderStart(componentName: string): void {
    const startTime = performance.now()
    this.renderTimes.set(`${componentName}-start`, startTime)
    
    performanceLogger.debug('Render iniciado', {
      component: componentName,
      timestamp: startTime
    })
  }

  /**
   * Marca el final de render y calcula el tiempo
   */
  markRenderEnd(componentName: string): void {
    const endTime = performance.now()
    const startTime = this.renderTimes.get(`${componentName}-start`)
    
    if (startTime) {
      const renderTime = endTime - startTime
      this.renderTimes.delete(`${componentName}-start`)
      
      // Incrementar contador de updates
      const currentCount = this.updateCounts.get(componentName) || 0
      this.updateCounts.set(componentName, currentCount + 1)
      
      // Log si el render es lento (>16ms = 60fps)
      if (renderTime > 16) {
        performanceLogger.warn('Render lento detectado', {
          component: componentName,
          renderTime: Math.round(renderTime * 100) / 100,
          updateCount: currentCount + 1
        })
      } else {
        performanceLogger.debug('Render completado', {
          component: componentName,
          renderTime: Math.round(renderTime * 100) / 100
        })
      }
    }
  }

  /**
   * Obtiene métricas de performance de un componente
   */
  getComponentMetrics(componentName: string): PerformanceMetrics | null {
    const updateCount = this.updateCounts.get(componentName)
    if (!updateCount) return null

    return {
      component: componentName,
      renderTime: 0, // Se calcula en tiempo real
      mountTime: 0,  // Se calcula en tiempo real
      updateCount,
      memoryUsage: this.getMemoryUsage()
    }
  }

  /**
   * Obtiene uso actual de memoria
   */
  private getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return Math.round(memory.usedJSHeapSize / 1024 / 1024) // MB
    }
    return undefined
  }

  /**
   * Mide Web Vitals básicos
   */
  measureWebVitals(): void {
    // First Contentful Paint
    const paintEntries = performance.getEntriesByType('paint')
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    
    if (fcpEntry) {
      performanceLogger.info('Web Vitals medidas', {
        fcp: Math.round(fcpEntry.startTime),
        timestamp: Date.now()
      })
    }

    // Navigation Timing
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    if (navEntries.length > 0) {
      const nav = navEntries[0]
      const loadTime = nav.loadEventEnd - nav.fetchStart
      
      performanceLogger.info('Navigation timing', {
        loadTime: Math.round(loadTime),
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.fetchStart),
        firstByte: Math.round(nav.responseStart - nav.fetchStart)
      })
    }
  }

  /**
   * Limpia métricas antiguas para evitar memory leaks
   */
  cleanup(): void {
    this.renderTimes.clear()
    // Mantener solo las últimas 50 entradas de updateCounts
    if (this.updateCounts.size > 50) {
      const entries = Array.from(this.updateCounts.entries())
      const recentEntries = entries.slice(-50)
      this.updateCounts.clear()
      recentEntries.forEach(([key, value]) => {
        this.updateCounts.set(key, value)
      })
    }

    performanceLogger.debug('Performance metrics cleanup completado')
  }

  /**
   * Exporta todas las métricas para análisis
   */
  exportMetrics(): Record<string, any> {
    const metrics = {
      updateCounts: Object.fromEntries(this.updateCounts),
      memoryUsage: this.getMemoryUsage(),
      timestamp: Date.now()
    }

    performanceLogger.info('Métricas exportadas', metrics)
    return metrics
  }
}

// Instancia global
export const performanceMonitor = new PerformanceMonitor()

/**
 * Hook para monitoreo automático de componentes
 */
import { useEffect } from 'react'

export const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    performanceMonitor.markRenderStart(componentName)
    
    return () => {
      performanceMonitor.markRenderEnd(componentName)
    }
  })

  return {
    markStart: () => performanceMonitor.markRenderStart(componentName),
    markEnd: () => performanceMonitor.markRenderEnd(componentName),
    getMetrics: () => performanceMonitor.getComponentMetrics(componentName)
  }
}

// Inicializar monitoreo de Web Vitals
if (typeof window !== 'undefined') {
  // Medir Web Vitals cuando la página esté completamente cargada
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.measureWebVitals()
    }, 0)
  })

  // Cleanup periódico (cada 5 minutos)
  setInterval(() => {
    performanceMonitor.cleanup()
  }, 5 * 60 * 1000)
}

performanceLogger.info('Performance Monitor inicializado')