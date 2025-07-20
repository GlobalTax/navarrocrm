
import { useState, useEffect, useCallback } from 'react'
import { useNetworkStatus } from './useNetworkStatus'
import type { SyncState } from '@/types/states'

interface OfflineAction {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: string
  data: any
  timestamp: number
  retries: number
  priority: 'high' | 'medium' | 'low'
}

interface OfflineSync {
  queueAction: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retries'>) => void
  syncState: SyncState
  forcSync: () => Promise<void>
  clearQueue: () => void
  getQueueSize: () => number
  getPendingActions: () => OfflineAction[]
}

const STORAGE_KEY = 'offline_sync_queue'
const MAX_RETRIES = 3

export const useOfflineSync = (): OfflineSync => {
  const { networkInfo } = useNetworkStatus()
  const [syncState, setSyncState] = useState<SyncState>({
    isOnline: true,
    lastSync: null,
    pendingChanges: 0,
    syncInProgress: false,
    syncError: null
  })
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([])

  // Load pending actions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const actions = JSON.parse(stored) as OfflineAction[]
        setPendingActions(actions)
        setSyncState(prev => ({
          ...prev,
          pendingChanges: actions.length
        }))
      } catch (error) {
        console.error('Failed to load offline sync queue:', error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  // Save pending actions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingActions))
    setSyncState(prev => ({
      ...prev,
      pendingChanges: pendingActions.length
    }))
  }, [pendingActions])

  // Update online status
  useEffect(() => {
    setSyncState(prev => ({
      ...prev,
      isOnline: networkInfo.isOnline
    }))
  }, [networkInfo.isOnline])

  const queueAction = useCallback((actionData: Omit<OfflineAction, 'id' | 'timestamp' | 'retries'>) => {
    const action: OfflineAction = {
      ...actionData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retries: 0
    }

    setPendingActions(prev => {
      // Remove any existing action for the same entity if it's an update
      const filtered = prev.filter(a => 
        !(a.entity === action.entity && a.type === action.type && a.data?.id === action.data?.id)
      )
      
      // Add new action sorted by priority and timestamp
      const newActions = [...filtered, action].sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
        if (priorityDiff !== 0) return priorityDiff
        return a.timestamp - b.timestamp
      })
      
      return newActions
    })
  }, [])

  const executeAction = async (action: OfflineAction): Promise<boolean> => {
    try {
      const response = await fetch(`/api/${action.entity}`, {
        method: action.type === 'create' ? 'POST' : 
                action.type === 'update' ? 'PUT' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: action.type !== 'delete' ? JSON.stringify(action.data) : undefined,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return true
    } catch (error) {
      console.error(`Failed to execute ${action.type} on ${action.entity}:`, error)
      return false
    }
  }

  const syncActions = useCallback(async (): Promise<void> => {
    if (!networkInfo.isOnline || pendingActions.length === 0) return

    setSyncState(prev => ({
      ...prev,
      syncInProgress: true,
      syncError: null
    }))

    const actionsToRetry: OfflineAction[] = []
    const completedActions: string[] = []

    for (const action of pendingActions) {
      const success = await executeAction(action)
      
      if (success) {
        completedActions.push(action.id)
      } else {
        if (action.retries < MAX_RETRIES) {
          actionsToRetry.push({
            ...action,
            retries: action.retries + 1
          })
        } else {
          // Max retries reached, remove from queue
          completedActions.push(action.id)
          console.warn(`Action ${action.id} failed after ${MAX_RETRIES} retries, removing from queue`)
        }
      }
    }

    // Update pending actions
    setPendingActions(prev => {
      const remaining = prev.filter(action => !completedActions.includes(action.id))
      return [...remaining, ...actionsToRetry]
    })

    setSyncState(prev => ({
      ...prev,
      syncInProgress: false,
      lastSync: new Date(),
      syncError: actionsToRetry.length > 0 ? 'Some actions failed to sync' : null
    }))
  }, [networkInfo.isOnline, pendingActions])

  const forcSync = useCallback(async (): Promise<void> => {
    await syncActions()
  }, [syncActions])

  const clearQueue = useCallback((): void => {
    setPendingActions([])
    localStorage.removeItem(STORAGE_KEY)
    setSyncState(prev => ({
      ...prev,
      pendingChanges: 0,
      syncError: null
    }))
  }, [])

  const getQueueSize = useCallback((): number => {
    return pendingActions.length
  }, [pendingActions.length])

  const getPendingActions = useCallback((): OfflineAction[] => {
    return [...pendingActions]
  }, [pendingActions])

  // Auto-sync when coming back online
  useEffect(() => {
    if (networkInfo.isOnline && pendingActions.length > 0 && !syncState.syncInProgress) {
      // Add a small delay to ensure connection is stable
      const timer = setTimeout(() => {
        syncActions()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [networkInfo.isOnline, pendingActions.length, syncState.syncInProgress, syncActions])

  // Periodic sync attempt when online
  useEffect(() => {
    if (!networkInfo.isOnline) return

    const interval = setInterval(() => {
      if (pendingActions.length > 0 && !syncState.syncInProgress) {
        syncActions()
      }
    }, 30000) // Try sync every 30 seconds

    return () => clearInterval(interval)
  }, [networkInfo.isOnline, pendingActions.length, syncState.syncInProgress, syncActions])

  return {
    queueAction,
    syncState,
    forcSync,
    clearQueue,
    getQueueSize,
    getPendingActions
  }
}
