
import { useState, useCallback } from 'react'

interface SyncOperation {
  id: string
  type: 'upload' | 'download' | 'sync'
  description: string
  progress: number
  status: 'pending' | 'running' | 'completed' | 'error'
}

export const usePWASync = () => {
  const [operations, setOperations] = useState<SyncOperation[]>([])

  const addOperation = useCallback((operation: Omit<SyncOperation, 'progress' | 'status'>) => {
    const newOperation: SyncOperation = {
      ...operation,
      progress: 0,
      status: 'pending'
    }
    
    setOperations(prev => [...prev, newOperation])
    
    // Notificar al Service Worker si está disponible
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SYNC_OPERATION',
        operation: newOperation
      })
    }

    return newOperation.id
  }, [])

  const updateOperation = useCallback((id: string, updates: Partial<Pick<SyncOperation, 'progress' | 'status'>>) => {
    setOperations(prev => 
      prev.map(op => 
        op.id === id ? { ...op, ...updates } : op
      )
    )
  }, [])

  const removeOperation = useCallback((id: string) => {
    setOperations(prev => prev.filter(op => op.id !== id))
  }, [])

  const clearCompletedOperations = useCallback(() => {
    setOperations(prev => 
      prev.filter(op => op.status === 'running' || op.status === 'pending')
    )
  }, [])

  const syncWithProgress = useCallback(async (
    description: string,
    asyncOperation: (progressCallback: (progress: number) => void) => Promise<void>
  ) => {
    const operationId = addOperation({
      id: Date.now().toString(),
      type: 'sync',
      description
    })

    updateOperation(operationId, { status: 'running' })

    try {
      await asyncOperation((progress: number) => {
        updateOperation(operationId, { progress })
      })
      
      updateOperation(operationId, { status: 'completed', progress: 100 })
      
      // Auto-remover después de 3 segundos
      setTimeout(() => {
        removeOperation(operationId)
      }, 3000)
      
    } catch (error) {
      console.error('Error en sincronización:', error)
      updateOperation(operationId, { status: 'error' })
      
      // Auto-remover después de 5 segundos en caso de error
      setTimeout(() => {
        removeOperation(operationId)
      }, 5000)
    }
  }, [addOperation, updateOperation, removeOperation])

  return {
    operations,
    addOperation,
    updateOperation,
    removeOperation,
    clearCompletedOperations,
    syncWithProgress
  }
}
