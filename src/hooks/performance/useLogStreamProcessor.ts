
import { useCallback, useMemo, useRef } from 'react'
import { useLogger } from '@/hooks/useLogger'
import { AIUsageLog } from '@/hooks/useAIUsage'

interface StreamProcessorOptions {
  chunkSize?: number
  batchDelay?: number
  maxRetries?: number
}

interface ProcessedLogChunk {
  logs: AIUsageLog[]
  stats: {
    totalCost: number
    totalTokens: number
    successRate: number
    chunkIndex: number
  }
}

export const useLogStreamProcessor = (options: StreamProcessorOptions = {}) => {
  const {
    chunkSize = 100,
    batchDelay = 50,
    maxRetries = 3
  } = options

  const logger = useLogger('LogStreamProcessor')
  const abortControllerRef = useRef<AbortController | null>(null)
  const processingRef = useRef(false)

  const processLogsInChunks = useCallback(async (
    logs: AIUsageLog[],
    onChunkProcessed: (chunk: ProcessedLogChunk) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ) => {
    if (processingRef.current) {
      logger.warn('⚠️ Procesamiento ya en curso')
      return
    }

    processingRef.current = true
    abortControllerRef.current = new AbortController()

    try {
      const totalChunks = Math.ceil(logs.length / chunkSize)
      
      logger.info('🚀 Iniciando procesamiento en chunks', {
        totalLoaded: logs.length,
        chunkSize,
        totalChunks
      })

      for (let i = 0; i < totalChunks; i++) {
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Procesamiento cancelado')
        }

        const startIndex = i * chunkSize
        const endIndex = Math.min(startIndex + chunkSize, logs.length)
        const chunk = logs.slice(startIndex, endIndex)

        // Calcular estadísticas del chunk
        const totalCost = chunk.reduce((sum, log) => sum + (log.estimated_cost || 0), 0)
        const totalTokens = chunk.reduce((sum, log) => sum + (log.total_tokens || 0), 0)
        const successfulLogs = chunk.filter(log => log.success).length
        const successRate = chunk.length > 0 ? (successfulLogs / chunk.length) * 100 : 0

        const processedChunk: ProcessedLogChunk = {
          logs: chunk,
          stats: {
            totalCost,
            totalTokens,
            successRate,
            chunkIndex: i
          }
        }

        onChunkProcessed(processedChunk)

        // Pausa pequeña para no bloquear el UI
        if (i < totalChunks - 1) {
          await new Promise(resolve => setTimeout(resolve, batchDelay))
        }

        logger.debug(`📦 Chunk ${i + 1}/${totalChunks} procesado`, {
          chunkSize: chunk.length,
          totalCost: totalCost.toFixed(4),
          successRate: successRate.toFixed(1)
        })
      }

      onComplete()
      logger.info('✅ Procesamiento completado', { totalLoaded: logs.length })

    } catch (error) {
      logger.error('❌ Error en procesamiento', error)
      onError(error as Error)
    } finally {
      processingRef.current = false
      abortControllerRef.current = null
    }
  }, [chunkSize, batchDelay, logger])

  const cancelProcessing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      logger.info('🛑 Procesamiento cancelado')
    }
  }, [logger])

  // Filtro optimizado para logs grandes
  const createOptimizedFilter = useCallback((
    searchTerm: string,
    statusFilter: string,
    orgFilter: string
  ) => {
    const lowerSearchTerm = searchTerm.toLowerCase()
    
    return (log: AIUsageLog) => {
      // Filtros más rápidos primero
      if (statusFilter !== 'all') {
        const matchesStatus = (statusFilter === 'success' && log.success) ||
                             (statusFilter === 'error' && !log.success)
        if (!matchesStatus) return false
      }

      if (orgFilter !== 'all' && log.org_id !== orgFilter) {
        return false
      }

      if (searchTerm && lowerSearchTerm) {
        const matchesSearch = log.function_name.toLowerCase().includes(lowerSearchTerm) ||
                             (log.model_used?.toLowerCase().includes(lowerSearchTerm))
        if (!matchesSearch) return false
      }

      return true
    }
  }, [])

  return {
    processLogsInChunks,
    cancelProcessing,
    createOptimizedFilter,
    isProcessing: processingRef.current
  }
}
