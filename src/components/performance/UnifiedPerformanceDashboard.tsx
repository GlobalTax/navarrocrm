
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Activity,
  Zap,
  Package,
  TreePine,
  Monitor,
  Code,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Download,
  BarChart3
} from 'lucide-react'

// Import all our performance hooks
import { useBundleAnalyzer } from '@/hooks/performance/useBundleAnalyzer'
import { useCodeSplitting } from '@/hooks/performance/useCodeSplitting'
import { useTreeShaking } from '@/hooks/performance/useTreeShaking'
import { useDOMOptimizer } from '@/hooks/performance/useDOMOptimizer'
import { useEventDelegation } from '@/hooks/performance/useEventDelegation'
import { useRuntimeProfiler } from '@/hooks/performance/useRuntimeProfiler'
import { useWebVitals } from '@/hooks/performance/useWebVitals'

export const UnifiedPerformanceDashboard: React.FC = () => {
  const [isVisible, setIsVisible] = useState(process.env.NODE_ENV === 'development')
  
  // Initialize all performance hooks
  const bundleAnalyzer = useBundleAnalyzer()
  const codeSplitting = useCodeSplitting()
  const treeShaking = useTreeShaking()
  const domOptimizer = useDOMOptimizer()
  const eventDelegation = useEventDelegation()
  const runtimeProfiler = useRuntimeProfiler()
  const webVitals = useWebVitals()

  const getOverallScore = () => {
    const scores = [
      webVitals.overallScore === 'good' ? 100 : webVitals.overallScore === 'needs-improvement' ? 60 : 20,
      bundleAnalyzer.bundleInfo ? Math.min(100, (1000 / (bundleAnalyzer.bundleInfo.totalSize / 1024)) * 100) : 80,
      treeShaking.report ? treeShaking.report.shakeabilityScore : 80,
      domOptimizer.getDOMHealth()?.score || 80,
      runtimeProfiler.currentProfile ? Math.max(0, 100 - runtimeProfiler.currentProfile.metrics.cpuUsage) : 80
    ]
    
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
  }

  const downloadFullReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      overallScore: getOverallScore(),
      webVitals: webVitals.metrics,
      bundle: bundleAnalyzer.bundleInfo,
      codeSplitting: codeSplitting.getChunkStats(),
      treeShaking: treeShaking.report,
      dom: {
        metrics: domOptimizer.metrics,
        health: domOptimizer.getDOMHealth()
      },
      events: eventDelegation.getOptimizationReport(),
      runtime: {
        current: runtimeProfiler.currentProfile,
        average: runtimeProfiler.getAverageMetrics()
      }
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-full-report-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-50 border-0.5 border-black rounded-[10px]"
      >
        <Activity className="h-4 w-4 mr-2" />
        Performance
      </Button>
    )
  }

  const overallScore = getOverallScore()

  return (
    <div className="fixed bottom-4 left-4 z-50 w-96 max-h-[80vh] overflow-auto">
      <Card className="border-0.5 border-black rounded-[10px] shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Performance Dashboard
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={overallScore > 80 ? 'default' : overallScore > 60 ? 'secondary' : 'destructive'}>
                {overallScore}/100
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
              >
                ×
              </Button>
            </div>
          </div>
          <Progress value={overallScore} className="h-2" />
        </CardHeader>

        <CardContent className="text-xs">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bundle">Bundle</TabsTrigger>
              <TabsTrigger value="runtime">Runtime</TabsTrigger>
              <TabsTrigger value="dom">DOM</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-3">
              {/* Web Vitals Summary */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center">
                  <Zap className="h-3 w-3 mr-1" />
                  Web Vitals
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between">
                    <span>FCP:</span>
                    <Badge variant={webVitals.scores.fcp === 'good' ? 'default' : 'secondary'}>
                      {webVitals.metrics.fcp ? Math.round(webVitals.metrics.fcp) : 0}ms
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>LCP:</span>
                    <Badge variant={webVitals.scores.lcp === 'good' ? 'default' : 'secondary'}>
                      {webVitals.metrics.lcp ? Math.round(webVitals.metrics.lcp) : 0}ms
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-2">
                <h4 className="font-medium">Quick Stats</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Bundle Size:</span>
                    <span>{bundleAnalyzer.bundleInfo ? `${(bundleAnalyzer.bundleInfo.totalSize / 1024).toFixed(0)}KB` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DOM Nodes:</span>
                    <span>{domOptimizer.metrics?.nodeCount || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory:</span>
                    <span>{runtimeProfiler.currentProfile ? `${runtimeProfiler.currentProfile.metrics.memoryHeap.toFixed(0)}MB` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CPU Usage:</span>
                    <span>{runtimeProfiler.currentProfile ? `${runtimeProfiler.currentProfile.metrics.cpuUsage.toFixed(0)}%` : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Alerts */}
              {runtimeProfiler.currentProfile?.alerts && runtimeProfiler.currentProfile.alerts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-destructive flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Active Alerts
                  </h4>
                  <div className="space-y-1">
                    {runtimeProfiler.currentProfile.alerts.slice(0, 3).map((alert, index) => (
                      <div key={index} className="text-xs text-destructive">
                        {alert}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="bundle" className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center">
                  <Package className="h-3 w-3 mr-1" />
                  Bundle Analysis
                </h4>
                
                {bundleAnalyzer.bundleInfo && (
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Total Size:</span>
                      <span>{(bundleAnalyzer.bundleInfo.totalSize / 1024).toFixed(1)}KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chunks:</span>
                      <span>{bundleAnalyzer.bundleInfo.chunkCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Largest:</span>
                      <span className="truncate max-w-24">{bundleAnalyzer.bundleInfo.largestChunk}</span>
                    </div>
                  </div>
                )}

                {treeShaking.report && (
                  <div className="space-y-2">
                    <h5 className="font-medium flex items-center">
                      <TreePine className="h-3 w-3 mr-1" />
                      Tree Shaking
                    </h5>
                    <div className="flex justify-between">
                      <span>Score:</span>
                      <Badge variant={treeShaking.report.shakeabilityScore > 80 ? 'default' : 'secondary'}>
                        {treeShaking.report.shakeabilityScore.toFixed(0)}/100
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Unused:</span>
                      <span>{(treeShaking.report.totalUnusedCode / 1024).toFixed(1)}KB</span>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="runtime" className="space-y-3">
              {runtimeProfiler.currentProfile && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center">
                    <Monitor className="h-3 w-3 mr-1" />
                    Runtime Metrics
                  </h4>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>CPU Usage:</span>
                      <span>{runtimeProfiler.currentProfile.metrics.cpuUsage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Memory:</span>
                      <span>{runtimeProfiler.currentProfile.metrics.memoryHeap.toFixed(1)}MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frame Rate:</span>
                      <span>{runtimeProfiler.currentProfile.metrics.frameRate.toFixed(1)}fps</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Render Time:</span>
                      <span>{runtimeProfiler.currentProfile.metrics.renderTime.toFixed(1)}ms</span>
                    </div>
                  </div>

                  {runtimeProfiler.currentProfile.recommendations.length > 0 && (
                    <div className="space-y-1">
                      <h5 className="font-medium text-amber-600">Recommendations:</h5>
                      {runtimeProfiler.currentProfile.recommendations.slice(0, 2).map((rec, index) => (
                        <div key={index} className="text-xs text-muted-foreground">
                          • {rec}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="dom" className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center">
                  <Code className="h-3 w-3 mr-1" />
                  DOM Health
                </h4>
                
                {domOptimizer.metrics && (
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Nodes:</span>
                      <span>{domOptimizer.metrics.nodeCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Depth:</span>
                      <span>{domOptimizer.metrics.depth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unused:</span>
                      <span>{domOptimizer.metrics.unusedElements}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <h5 className="font-medium">Event Listeners</h5>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>{eventDelegation.stats.totalListeners}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delegated:</span>
                    <span>{eventDelegation.stats.delegatedListeners}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex gap-2 mt-4 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadFullReport}
              className="flex-1 h-8 text-xs border-0.5 border-black rounded-[10px]"
            >
              <Download className="h-3 w-3 mr-1" />
              Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                bundleAnalyzer.runAnalysis()
                treeShaking.runAnalysis()
                domOptimizer.optimizeDOM()
                eventDelegation.analyzeEventListeners()
              }}
              className="flex-1 h-8 text-xs border-0.5 border-black rounded-[10px]"
            >
              <Activity className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
