
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  AlertTriangle, 
  Zap, 
  MemoryStick, 
  Wifi, 
  X, 
  TrendingDown,
  RefreshCw
} from 'lucide-react'
import { useWebVitals } from '@/hooks/performance/useWebVitals'
import { useTelemetry } from './TelemetryProvider'

interface PerformanceIssue {
  id: string
  type: 'memory' | 'network' | 'vitals' | 'errors'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  action?: string
  autoResolve?: boolean
  timestamp: number
}

export const PerformanceAlert: React.FC = () => {
  const { metrics, scores, overallScore } = useWebVitals()
  const { data: telemetryData, trackCustomEvent } = useTelemetry()
  const [issues, setIssues] = useState<PerformanceIssue[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  
  // Use refs to prevent dependency issues
  const lastMetricsRef = useRef(metrics)
  const lastScoresRef = useRef(scores)
  const lastTelemetryRef = useRef(telemetryData)
  const checkTimeoutRef = useRef<NodeJS.Timeout>()

  // Memoize issue detection logic
  const checkForIssues = useCallback(() => {
    const newIssues: PerformanceIssue[] = []

    // Web Vitals issues - only check if scores have changed
    if (scores && Object.keys(scores).length > 0) {
      Object.entries(scores).forEach(([metric, score]) => {
        if (score === 'poor' && metrics[metric as keyof typeof metrics]) {
          const value = metrics[metric as keyof typeof metrics]
          const issueId = `vitals-${metric}`
          
          // Only add if not already present
          if (!issues.some(issue => issue.id === issueId)) {
            newIssues.push({
              id: issueId,
              type: 'vitals',
              severity: 'high',
              message: `${metric.toUpperCase()} score is poor (${Math.round(value || 0)}ms)`,
              action: 'optimize-loading',
              timestamp: Date.now()
            })
          }
        }
      })
    }

    // Memory issues
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const usedMB = memory.usedJSHeapSize / 1024 / 1024
      const limitMB = memory.jsHeapSizeLimit / 1024 / 1024
      const usage = (usedMB / limitMB) * 100

      if (usage > 90 && !issues.some(issue => issue.id === 'memory-critical')) {
        newIssues.push({
          id: 'memory-critical',
          type: 'memory',
          severity: 'critical',
          message: `Memory usage critical (${Math.round(usage)}%)`,
          action: 'cleanup-memory',
          timestamp: Date.now()
        })
      } else if (usage > 70 && !issues.some(issue => issue.id === 'memory-high')) {
        newIssues.push({
          id: 'memory-high',
          type: 'memory',
          severity: 'medium',
          message: `High memory usage (${Math.round(usage)}%)`,
          action: 'monitor-memory',
          timestamp: Date.now()
        })
      }
    }

    // Network issues
    if (!navigator.onLine && !issues.some(issue => issue.id === 'network-offline')) {
      newIssues.push({
        id: 'network-offline',
        type: 'network',
        severity: 'critical',
        message: 'No internet connection detected',
        action: 'check-connection',
        autoResolve: true,
        timestamp: Date.now()
      })
    }

    // High error rate - only check if telemetry data has changed
    if (telemetryData && telemetryData.errors > 5 && !issues.some(issue => issue.id === 'errors-high')) {
      newIssues.push({
        id: 'errors-high',
        type: 'errors',
        severity: 'high',
        message: `High error rate detected (${telemetryData.errors} errors)`,
        action: 'check-logs',
        timestamp: Date.now()
      })
    }

    // Only update state if there are actual new issues
    if (newIssues.length > 0) {
      setIssues(prev => {
        const existingIds = new Set(prev.map(issue => issue.id))
        const filteredNew = newIssues.filter(issue => !existingIds.has(issue.id))
        return filteredNew.length > 0 ? [...prev, ...filteredNew] : prev
      })
    }

    // Auto-resolve network issues when back online
    if (navigator.onLine) {
      setIssues(prev => {
        const filtered = prev.filter(issue => issue.id !== 'network-offline')
        return filtered.length !== prev.length ? filtered : prev
      })
    }
  }, [metrics, scores, telemetryData, issues])

  // Throttled issue checking
  useEffect(() => {
    // Clear existing timeout
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current)
    }

    // Only check if data has actually changed
    const metricsChanged = JSON.stringify(metrics) !== JSON.stringify(lastMetricsRef.current)
    const scoresChanged = JSON.stringify(scores) !== JSON.stringify(lastScoresRef.current)
    const telemetryChanged = JSON.stringify(telemetryData) !== JSON.stringify(lastTelemetryRef.current)

    if (metricsChanged || scoresChanged || telemetryChanged) {
      // Throttle checks to prevent excessive updates
      checkTimeoutRef.current = setTimeout(() => {
        checkForIssues()
        
        // Update refs
        lastMetricsRef.current = metrics
        lastScoresRef.current = scores
        lastTelemetryRef.current = telemetryData
      }, 1000) // 1 second throttle
    }

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current)
      }
    }
  }, [checkForIssues]) // Only depend on the memoized function

  const executeAction = useCallback((issue: PerformanceIssue) => {
    trackCustomEvent('performance_action', {
      action: issue.action,
      issueType: issue.type,
      severity: issue.severity
    })

    switch (issue.action) {
      case 'optimize-loading':
        console.info('🚀 Optimizing loading performance...')
        break

      case 'cleanup-memory':
        if ('gc' in window && typeof (window as any).gc === 'function') {
          (window as any).gc()
        }
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name))
        })
        break

      case 'check-connection':
        fetch('/favicon.ico', { cache: 'no-cache' })
          .then(() => console.info('✅ Network connection restored'))
          .catch(() => console.warn('❌ Network still unavailable'))
        break

      case 'check-logs':
        console.group('🔍 Recent Error Logs')
        console.info('Current telemetry:', telemetryData)
        console.groupEnd()
        break
    }

    dismissIssue(issue.id)
  }, [trackCustomEvent, telemetryData])

  const dismissIssue = useCallback((id: string) => {
    setDismissed(prev => new Set([...prev, id]))
    setIssues(prev => prev.filter(issue => issue.id !== id))
  }, [])

  const getSeverityIcon = useMemo(() => (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'high': return <TrendingDown className="h-4 w-4 text-orange-600" />
      case 'medium': return <Zap className="h-4 w-4 text-yellow-600" />
      default: return <MemoryStick className="h-4 w-4 text-blue-600" />
    }
  }, [])

  const getSeverityColor = useMemo(() => (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-200 bg-red-50'
      case 'high': return 'border-orange-200 bg-orange-50'
      case 'medium': return 'border-yellow-200 bg-yellow-50'
      default: return 'border-blue-200 bg-blue-50'
    }
  }, [])

  const visibleIssues = useMemo(() => 
    issues.filter(issue => !dismissed.has(issue.id)),
    [issues, dismissed]
  )

  if (visibleIssues.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleIssues.map(issue => (
        <Alert key={issue.id} className={`${getSeverityColor(issue.severity)} border-0.5`}>
          <div className="flex items-start gap-3">
            {getSeverityIcon(issue.severity)}
            
            <div className="flex-1 min-w-0">
              <AlertDescription className="text-sm">
                {issue.message}
              </AlertDescription>
              
              <div className="flex gap-2 mt-2">
                {issue.action && (
                  <Button
                    size="sm"
                    onClick={() => executeAction(issue)}
                    className="h-6 px-2 text-xs border-0.5 border-black rounded-[10px]"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Resolver
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => dismissIssue(issue.id)}
                  className="h-6 px-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </Alert>
      ))}
      
      {/* Overall performance indicator */}
      {overallScore !== 'good' && (
        <Alert className="border-0.5 border-amber-200 bg-amber-50">
          <TrendingDown className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <div className="flex items-center justify-between">
              <span>Performance Score: {overallScore}</span>
              <Progress 
                value={overallScore === 'poor' ? 25 : 60} 
                className="w-16 h-2"
              />
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
