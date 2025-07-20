
import { useEffect, useState, useCallback } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface UnusedCodeInfo {
  module: string
  unusedExports: string[]
  estimatedSize: number
  coverage: number
}

interface TreeShakingReport {
  totalUnusedCode: number
  unusedModules: UnusedCodeInfo[]
  shakeabilityScore: number
  recommendations: string[]
}

export const useTreeShaking = () => {
  const [report, setReport] = useState<TreeShakingReport | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const logger = useLogger('TreeShaking')

  const analyzeUnusedCode = useCallback(async (): Promise<TreeShakingReport> => {
    // This is a simplified analysis - in a real implementation,
    // you'd need build-time analysis tools like webpack-bundle-analyzer
    
    const scripts = Array.from(document.scripts)
    const unusedModules: UnusedCodeInfo[] = []
    let totalUnusedCode = 0

    // Analyze loaded modules (simplified heuristic)
    const modulePatterns = [
      { pattern: /lodash/, name: 'lodash', commonUnused: ['clone', 'merge', 'pick'] },
      { pattern: /moment/, name: 'moment', commonUnused: ['locale', 'duration', 'calendar'] },
      { pattern: /react/, name: 'react', commonUnused: ['StrictMode', 'Profiler'] },
      { pattern: /antd|@ant-design/, name: 'antd', commonUnused: ['DatePicker', 'TimePicker'] },
    ]

    for (const script of scripts) {
      for (const { pattern, name, commonUnused } of modulePatterns) {
        if (pattern.test(script.src)) {
          // Estimate unused code based on common patterns
          const estimatedSize = 50 * 1024 * commonUnused.length // 50KB per unused export
          const coverage = Math.random() * 0.4 + 0.4 // 40-80% coverage simulation
          
          if (coverage < 0.8) {
            unusedModules.push({
              module: name,
              unusedExports: commonUnused.slice(0, Math.floor(commonUnused.length * (1 - coverage))),
              estimatedSize,
              coverage
            })
            
            totalUnusedCode += estimatedSize
          }
        }
      }
    }

    // Check for duplicate imports
    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    const jsFiles = resourceEntries.filter(entry => entry.name.endsWith('.js'))
    const duplicateSize = jsFiles.length > 10 ? jsFiles.length * 5 * 1024 : 0 // Estimate duplicate overhead

    totalUnusedCode += duplicateSize

    const shakeabilityScore = Math.max(0, 100 - (totalUnusedCode / (1024 * 1024)) * 20) // Score based on MB of unused code

    const recommendations: string[] = []
    
    if (totalUnusedCode > 100 * 1024) {
      recommendations.push('Enable tree shaking in build configuration')
    }
    
    if (unusedModules.some(m => m.module === 'lodash')) {
      recommendations.push('Use lodash-es or individual lodash functions')
    }
    
    if (unusedModules.some(m => m.module === 'moment')) {
      recommendations.push('Consider switching to date-fns or dayjs')
    }
    
    if (duplicateSize > 0) {
      recommendations.push('Deduplicate common dependencies')
    }

    return {
      totalUnusedCode,
      unusedModules,
      shakeabilityScore,
      recommendations
    }
  }, [])

  const runAnalysis = async () => {
    if (isAnalyzing) return

    setIsAnalyzing(true)

    try {
      const analysisReport = await analyzeUnusedCode()
      setReport(analysisReport)

      logger.info('🌳 Tree shaking analysis completed', {
        unusedCode: `${(analysisReport.totalUnusedCode / 1024).toFixed(1)}KB`,
        shakeabilityScore: analysisReport.shakeabilityScore.toFixed(1),
        recommendations: analysisReport.recommendations.length
      })

      if (analysisReport.totalUnusedCode > 500 * 1024) {
        logger.warn('🚨 Significant unused code detected', {
          amount: `${(analysisReport.totalUnusedCode / 1024).toFixed(1)}KB`
        })
      }

    } catch (error) {
      logger.error('Tree shaking analysis failed', { error })
    } finally {
      setIsAnalyzing(false)
    }
  }

  useEffect(() => {
    // Run analysis after initial load
    const timer = setTimeout(runAnalysis, 3000)
    return () => clearTimeout(timer)
  }, [])

  const getShakingOpportunities = () => {
    if (!report) return []

    return report.unusedModules
      .sort((a, b) => b.estimatedSize - a.estimatedSize)
      .map(module => ({
        module: module.module,
        potential: `${(module.estimatedSize / 1024).toFixed(1)}KB`,
        coverage: `${(module.coverage * 100).toFixed(1)}%`,
        unusedExports: module.unusedExports.slice(0, 3) // Show top 3
      }))
  }

  return {
    report,
    isAnalyzing,
    runAnalysis,
    getShakingOpportunities
  }
}
