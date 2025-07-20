
import { useEffect, useState, useRef, useCallback } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface RuntimeMetrics {
  cpuUsage: number
  memoryHeap: number
  renderTime: number
  scriptDuration: number
  idleTime: number
  frameRate: number
}

interface PerformanceProfile {
  timestamp: number
  metrics: RuntimeMetrics
  alerts: string[]
  recommendations: string[]
}

export const useRuntimeProfiler = (sampleInterval: number = 1000) => {
  const [currentProfile, setCurrentProfile] = useState<PerformanceProfile | null>(null)
  const [profileHistory, setProfileHistory] = useState<PerformanceProfile[]>([])
  const [isProfilering, setIsProfiling] = useState(false)
  const logger = useLogger('RuntimeProfiler')
  
  const intervalRef = useRef<NodeJS.Timeout>()
  const frameCountRef = useRef(0)
  const lastFrameTimeRef = useRef(performance.now())

  const measureCPUUsage = useCallback((): number => {
    // CPU usage estimation based on main thread blocking
    const start = performance.now()
    
    // Simulate work to measure responsiveness
    let iterations = 0
    const maxIterations = 100000
    const targetTime = 5 // 5ms target
    
    while (performance.now() - start < targetTime && iterations < maxIterations) {
      iterations++
    }
    
    const actualTime = performance.now() - start
    const efficiency = Math.min(100, (iterations / maxIterations) * 100)
    
    // Convert efficiency to CPU usage (inverse relationship)
    return Math.max(0, 100 - efficiency)
  }, [])

  const measureMemoryUsage = useCallback((): number => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return memory.usedJSHeapSize / 1024 / 1024 // MB
    }
    return 0
  }, [])

  const measureRenderTime = useCallback((): number => {
    const paintEntries = performance.getEntriesByType('paint')
    const measureEntries = performance.getEntriesByType('measure')
    
    // Get recent render-related measures
    const recentMeasures = measureEntries
      .filter(entry => entry.startTime > performance.now() - 5000)
      .filter(entry => entry.name.includes('render') || entry.name.includes('React'))
    
    if (recentMeasures.length > 0) {
      return recentMeasures.reduce((sum, entry) => sum + entry.duration, 0) / recentMeasures.length
    }
    
    return 0
  }, [])

  const measureScriptDuration = useCallback((): number => {
    const scriptEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    const recentScripts = scriptEntries
      .filter(entry => entry.name.includes('.js'))
      .filter(entry => entry.startTime > performance.now() - 10000)
    
    if (recentScripts.length > 0) {
      return recentScripts.reduce((sum, entry) => 
        sum + (entry.responseEnd - entry.requestStart), 0
      ) / recentScripts.length
    }
    
    return 0
  }, [])

  const measureFrameRate = useCallback((): number => {
    const now = performance.now()
    const timeDiff = now - lastFrameTimeRef.current
    
    if (timeDiff > 1000) { // Every second
      const fps = (frameCountRef.current * 1000) / timeDiff
      frameCountRef.current = 0
      lastFrameTimeRef.current = now
      return fps
    }
    
    return 60 // Default assumption
  }, [])

  const collectMetrics = useCallback((): RuntimeMetrics => {
    const cpuUsage = measureCPUUsage()
    const memoryHeap = measureMemoryUsage()
    const renderTime = measureRenderTime()
    const scriptDuration = measureScriptDuration()
    const frameRate = measureFrameRate()
    const idleTime = Math.max(0, 100 - cpuUsage)

    return {
      cpuUsage,
      memoryHeap,
      renderTime,
      scriptDuration,
      idleTime,
      frameRate
    }
  }, [measureCPUUsage, measureMemoryUsage, measureRenderTime, measureScriptDuration, measureFrameRate])

  const generateAlerts = useCallback((metrics: RuntimeMetrics): string[] => {
    const alerts: string[] = []
    
    if (metrics.cpuUsage > 80) {
      alerts.push('🔥 High CPU usage detected')
    }
    
    if (metrics.memoryHeap > 100) {
      alerts.push('🧠 Memory usage exceeded 100MB')
    }
    
    if (metrics.renderTime > 16.67) {
      alerts.push('🐌 Render time exceeded 60fps budget')
    }
    
    if (metrics.frameRate < 30) {
      alerts.push('📺 Low frame rate detected')
    }
    
    if (metrics.scriptDuration > 1000) {
      alerts.push('⏳ Long script execution time')
    }
    
    return alerts
  }, [])

  const generateRecommendations = useCallback((metrics: RuntimeMetrics): string[] => {
    const recommendations: string[] = []
    
    if (metrics.cpuUsage > 70) {
      recommendations.push('Consider debouncing expensive operations')
      recommendations.push('Implement virtual scrolling for large lists')
    }
    
    if (metrics.memoryHeap > 80) {
      recommendations.push('Check for memory leaks')
      recommendations.push('Implement component cleanup in useEffect')
    }
    
    if (metrics.renderTime > 10) {
      recommendations.push('Use React.memo for expensive components')
      recommendations.push('Optimize re-rendering with useMemo and useCallback')
    }
    
    if (metrics.frameRate < 45) {
      recommendations.push('Reduce DOM manipulations')
      recommendations.push('Use CSS transforms instead of layout changes')
    }
    
    return recommendations
  }, [])

  const runProfiler = useCallback(() => {
    if (!isProfilering) return

    const metrics = collectMetrics()
    const alerts = generateAlerts(metrics)
    const recommendations = generateRecommendations(metrics)
    
    const profile: PerformanceProfile = {
      timestamp: Date.now(),
      metrics,
      alerts,
      recommendations
    }

    setCurrentProfile(profile)
    setProfileHistory(prev => [...prev.slice(-19), profile]) // Keep last 20 profiles

    // Log critical issues
    if (alerts.length > 0) {
      logger.warn('⚠️ Performance alerts', {
        alerts,
        cpuUsage: `${metrics.cpuUsage.toFixed(1)}%`,
        memoryHeap: `${metrics.memoryHeap.toFixed(1)}MB`,
        frameRate: `${metrics.frameRate.toFixed(1)}fps`
      })
    }

    // Log recommendations periodically
    if (recommendations.length > 0 && Math.random() < 0.1) { // 10% chance
      logger.info('💡 Performance recommendations', { recommendations })
    }

  }, [isProfilering, collectMetrics, generateAlerts, generateRecommendations, logger])

  const startProfiling = useCallback(() => {
    setIsProfiling(true)
    logger.info('🔍 Runtime profiling started')
  }, [logger])

  const stopProfiling = useCallback(() => {
    setIsProfiling(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    logger.info('⏹️ Runtime profiling stopped')
  }, [logger])

  const getAverageMetrics = useCallback((): RuntimeMetrics | null => {
    if (profileHistory.length === 0) return null

    const totals = profileHistory.reduce(
      (acc, profile) => ({
        cpuUsage: acc.cpuUsage + profile.metrics.cpuUsage,
        memoryHeap: acc.memoryHeap + profile.metrics.memoryHeap,
        renderTime: acc.renderTime + profile.metrics.renderTime,
        scriptDuration: acc.scriptDuration + profile.metrics.scriptDuration,
        idleTime: acc.idleTime + profile.metrics.idleTime,
        frameRate: acc.frameRate + profile.metrics.frameRate
      }),
      { cpuUsage: 0, memoryHeap: 0, renderTime: 0, scriptDuration: 0, idleTime: 0, frameRate: 0 }
    )

    const count = profileHistory.length
    return {
      cpuUsage: totals.cpuUsage / count,
      memoryHeap: totals.memoryHeap / count,
      renderTime: totals.renderTime / count,
      scriptDuration: totals.scriptDuration / count,
      idleTime: totals.idleTime / count,
      frameRate: totals.frameRate / count
    }
  }, [profileHistory])

  useEffect(() => {
    // Frame rate counter
    const frameCounter = () => {
      frameCountRef.current++
      requestAnimationFrame(frameCounter)
    }
    requestAnimationFrame(frameCounter)

    // Profiling interval
    if (isProfilering) {
      intervalRef.current = setInterval(runProfiler, sampleInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isProfilering, runProfiler, sampleInterval])

  // Auto-start profiling in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      startProfiling()
    }
  }, [startProfiling])

  return {
    currentProfile,
    profileHistory,
    isProfilering,
    startProfiling,
    stopProfiling,
    getAverageMetrics
  }
}
