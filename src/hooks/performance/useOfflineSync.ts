import { useState, useEffect, useCallback, useRef } from 'react'
import { useNetworkStatus } from './useNetworkStatus'
import { useOfflineStorage } from './useOfflineStorage'
import { useLogger } from '@/hooks/useLogger'

interface SyncOperation {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: string
  data: any
  timestamp: number
  retryCount: number
  maxRetries: number
  priority: 'low' | 'medium' | 'high' | 'critical'
}

interface SyncConfig {
  maxQueueSize?: number
  batchSize?: number
  retryDelay?: number
  syncInterval?: number
}

interface OfflineSyncReturn {
  queueSize: number
  isSync: boolean
  syncProgress: number
  addOperation: (operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>) => void
  forcSync: () => Promise<void>
  clearQueue: () => Promise<void>
  getQueueStatus: () => { pending: number; failed: number; completed: number }
}

export function useOfflineSync(
  syncHandler: (operations: SyncOperation[]) => Promise<SyncOperation[]>,
  config: SyncConfig = {}
): OfflineSyncReturn {
  const logger = useLogger('OfflineSync')
  const { isOnline } = useNetworkStatus()
  
  const {
    maxQueueSize = 1000,
    batchSize = 10,
    retryDelay = 5000,
    syncInterval = 30000 // 30 seconds
  } = config

  const [isSync, setIsSync] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isSyncingRef = useRef(false)

  const {
    data: operationQueue = [],
    setData: setOperationQueue,
    isLoading: queueLoading
  } = useOfflineStorage<SyncOperation[]>({
    key: 'offline_sync_queue',
    defaultValue: [],
    compress: true
  })

  const {
    data: syncStats = { pending: 0, failed: 0, completed: 0 },
    setData: setSyncStats
  } = useOfflineStorage<{ pending: number; failed: number; completed: number }>({
    key: 'sync_stats',
    defaultValue: { pending: 0, failed: 0, completed: 0 }
  })

  // Add operation to queue
  const addOperation = useCallback((
    operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>
  ) => {
    const newOperation: SyncOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0
    }

    const updatedQueue = [...operationQueue, newOperation]
    
    // Limit queue size
    if (updatedQueue.length > maxQueueSize) {
      const overflow = updatedQueue.length - maxQueueSize
      updatedQueue.splice(0, overflow)
      
      logger.warn('📦 Cola llena, eliminando operaciones antiguas', { 
        overflow,
        queueSize: maxQueueSize 
      })
    }

    setOperationQueue(updatedQueue)
    
    // Update stats
    const newStats = { 
      ...syncStats, 
      pending: syncStats.pending + 1 
    }
    setSyncStats(newStats)

    logger.info('➕ Operación añadida a cola', { 
      type: operation.type,
      entity: operation.entity,
      priority: operation.priority,
      queueSize: updatedQueue.length 
    })

    // Try to sync immediately if online
    if (isOnline && !isSyncingRef.current) {
      performSync()
    }
  }, [operationQueue, maxQueueSize, setOperationQueue, setSyncStats, isOnline, logger])

  // Perform sync operation
  const performSync = useCallback(async () => {
    if (!isOnline || isSyncingRef.current || operationQueue.length === 0) {
      return
    }

    isSyncingRef.current = true
    setIsSync(true)
    setSyncProgress(0)

    try {
      logger.info('🔄 Iniciando sincronización', { 
        queueSize: operationQueue.length,
        batchSize 
      })

      // Sort by priority and timestamp
      const sortedQueue = [...operationQueue].sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        const aPriority = priorityOrder[a.priority]
        const bPriority = priorityOrder[b.priority]
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority // Higher priority first
        }
        
        return a.timestamp - b.timestamp // Older first
      })

      const totalOperations = sortedQueue.length
      let processedCount = 0
      let successCount = 0
      let failedOperations: SyncOperation[] = []

      // Process in batches
      for (let i = 0; i < sortedQueue.length; i += batchSize) {
        const batch = sortedQueue.slice(i, i + batchSize)
        
        try {
          const failedInBatch = await syncHandler(batch)
          
          // Update retry count for failed operations
          failedInBatch.forEach(op => {
            op.retryCount++
          })
          
          failedOperations.push(...failedInBatch)
          successCount += batch.length - failedInBatch.length
          
          logger.info('📦 Lote procesado', { 
            batchSize: batch.length,
            failed: failedInBatch.length,
            success: batch.length - failedInBatch.length 
          })

        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Error de lote'
          logger.error('❌ Error procesando lote', { 
            batchSize: batch.length,
            error: errorMsg 
          })
          
          // Mark all operations in batch as failed
          batch.forEach(op => {
            op.retryCount++
            failedOperations.push(op)
          })
        }

        processedCount += batch.length
        setSyncProgress((processedCount / totalOperations) * 100)

        // Small delay between batches to prevent overwhelming the server
        if (i + batchSize < sortedQueue.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      // Filter out operations that exceeded max retries
      const retryableOperations = failedOperations.filter(op => 
        op.retryCount < op.maxRetries
      )

      // Update queue with only failed operations that can be retried
      await setOperationQueue(retryableOperations)

      // Update stats
      await setSyncStats({
        pending: retryableOperations.length,
        failed: failedOperations.length - retryableOperations.length,
        completed: syncStats.completed + successCount
      })

      logger.info('✅ Sincronización completada', { 
        total: totalOperations,
        success: successCount,
        failed: failedOperations.length,
        retryable: retryableOperations.length 
      })

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error de sincronización'
      logger.error('❌ Error en sincronización', { error: errorMsg })
    } finally {
      isSyncingRef.current = false
      setIsSync(false)
      setSyncProgress(0)
    }
  }, [isOnline, operationQueue, batchSize, syncHandler, setOperationQueue, setSyncStats, syncStats.completed, logger])

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && operationQueue.length > 0 && !queueLoading) {
      logger.info('🌐 Conexión restaurada, iniciando sync automático', { 
        queueSize: operationQueue.length 
      })
      performSync()
    }
  }, [isOnline, operationQueue.length, queueLoading, performSync, logger])

  // Periodic sync
  useEffect(() => {
    if (isOnline && syncInterval > 0) {
      syncIntervalRef.current = setInterval(() => {
        if (operationQueue.length > 0 && !isSyncingRef.current) {
          performSync()
        }
      }, syncInterval)

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current)
        }
      }
    }
  }, [isOnline, syncInterval, operationQueue.length, performSync])

  const forcSync = useCallback(async () => {
    if (!isOnline) {
      logger.warn('⚠️ No se puede forzar sync sin conexión')
      return
    }
    await performSync()
  }, [isOnline, performSync, logger])

  const clearQueue = useCallback(async () => {
    await setOperationQueue([])
    await setSyncStats({ pending: 0, failed: 0, completed: 0 })
    logger.info('🧹 Cola de sync limpiada')
  }, [setOperationQueue, setSyncStats, logger])

  const getQueueStatus = useCallback(() => syncStats, [syncStats])

  return {
    queueSize: operationQueue.length,
    isSync,
    syncProgress,
    addOperation,
    forcSync,
    clearQueue,
    getQueueStatus
  }
}