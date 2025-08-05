import { useState, useCallback, useMemo } from 'react'
import { useOptimizedMemo } from './useOptimizedMemo'
import { usePerformanceMonitor } from './performance/usePerformanceMonitor'

export interface BulkOperation<T> {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  action: (items: T[]) => Promise<void>
  confirmMessage?: string
  disabled?: (items: T[]) => boolean
  destructive?: boolean
}

export interface BulkOperationsConfig<T> {
  operations: BulkOperation<T>[]
  selectedItems: T[]
  onSelectionChange: (items: T[]) => void
  maxBatchSize?: number
}

export const useBulkOperations = <T>(config: BulkOperationsConfig<T>) => {
  const { 
    operations, 
    selectedItems, 
    onSelectionChange,
    maxBatchSize = 100 
  } = config

  const { metrics } = usePerformanceMonitor('BulkOperations')
  const [isExecuting, setIsExecuting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentOperation, setCurrentOperation] = useState<string | null>(null)

  // Memoize available operations based on current selection
  const availableOperations = useOptimizedMemo(() => {
    return operations.filter(op => !op.disabled || !op.disabled(selectedItems))
  }, [operations, selectedItems], 'BulkOperations-availableOperations')

  // Execute operation in batches for performance
  const executeOperation = useCallback(async (operationId: string) => {
    const operation = operations.find(op => op.id === operationId)
    if (!operation || selectedItems.length === 0) return

    setIsExecuting(true)
    setCurrentOperation(operationId)
    setProgress(0)

    try {
      const batches = []
      for (let i = 0; i < selectedItems.length; i += maxBatchSize) {
        batches.push(selectedItems.slice(i, i + maxBatchSize))
      }

      for (let i = 0; i < batches.length; i++) {
        await operation.action(batches[i])
        setProgress((i + 1) / batches.length * 100)
        
        // Small delay to prevent UI blocking
        if (batches.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 10))
        }
      }

      // Clear selection after successful operation
      onSelectionChange([])
    } catch (error) {
      console.error(`Error executing bulk operation ${operationId}:`, error)
      throw error
    } finally {
      setIsExecuting(false)
      setCurrentOperation(null)
      setProgress(0)
    }
  }, [operations, selectedItems, maxBatchSize, onSelectionChange])

  // Optimized selection handlers
  const selectAll = useCallback((items: T[]) => {
    onSelectionChange([...selectedItems, ...items.filter(item => 
      !selectedItems.includes(item)
    )])
  }, [selectedItems, onSelectionChange])

  const deselectAll = useCallback(() => {
    onSelectionChange([])
  }, [onSelectionChange])

  const toggleSelection = useCallback((item: T) => {
    const isSelected = selectedItems.includes(item)
    if (isSelected) {
      onSelectionChange(selectedItems.filter(selected => selected !== item))
    } else {
      onSelectionChange([...selectedItems, item])
    }
  }, [selectedItems, onSelectionChange])

  // Statistics
  const stats = useMemo(() => ({
    selectedCount: selectedItems.length,
    availableOperationsCount: availableOperations.length,
    maxBatchSize,
    isExecuting,
    progress,
    currentOperation
  }), [
    selectedItems.length, 
    availableOperations.length, 
    maxBatchSize, 
    isExecuting, 
    progress, 
    currentOperation
  ])

  return {
    // Operations
    availableOperations,
    executeOperation,
    
    // Selection management
    selectedItems,
    selectAll,
    deselectAll,
    toggleSelection,
    
    // Status
    isExecuting,
    progress,
    currentOperation,
    
    // Stats
    stats,
    metrics
  }
}