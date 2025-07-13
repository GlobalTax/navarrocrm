import React from 'react'

/**
 * Utilidad para unificar todos los estados "pending" dispersos en la aplicación
 * Esta clase centraliza la gestión de estados de carga/pendientes
 */

export interface PendingState {
  isPending: boolean
  error: string | null
  lastUpdated: Date
}

export class PendingStateManager {
  private states: Map<string, PendingState> = new Map()
  private listeners: Map<string, Set<(state: PendingState) => void>> = new Map()

  // Establecer estado pending para una operación
  setPending(operation: string, isPending: boolean, error: string | null = null) {
    const state: PendingState = {
      isPending,
      error,
      lastUpdated: new Date()
    }
    
    this.states.set(operation, state)
    this.notifyListeners(operation, state)
  }

  // Obtener estado de una operación
  getState(operation: string): PendingState {
    return this.states.get(operation) || {
      isPending: false,
      error: null,
      lastUpdated: new Date()
    }
  }

  // Suscribirse a cambios de estado
  subscribe(operation: string, callback: (state: PendingState) => void) {
    if (!this.listeners.has(operation)) {
      this.listeners.set(operation, new Set())
    }
    this.listeners.get(operation)!.add(callback)

    // Cleanup function
    return () => {
      const listeners = this.listeners.get(operation)
      if (listeners) {
        listeners.delete(callback)
        if (listeners.size === 0) {
          this.listeners.delete(operation)
        }
      }
    }
  }

  // Verificar si alguna operación está pendiente
  hasAnyPending(): boolean {
    for (const state of this.states.values()) {
      if (state.isPending) return true
    }
    return false
  }

  // Obtener todas las operaciones pendientes
  getPendingOperations(): string[] {
    const pending: string[] = []
    for (const [operation, state] of this.states.entries()) {
      if (state.isPending) {
        pending.push(operation)
      }
    }
    return pending
  }

  // Limpiar estados antiguos (más de 5 minutos)
  cleanup() {
    const now = new Date()
    const maxAge = 5 * 60 * 1000 // 5 minutos

    for (const [operation, state] of this.states.entries()) {
      if (now.getTime() - state.lastUpdated.getTime() > maxAge && !state.isPending) {
        this.states.delete(operation)
        this.listeners.delete(operation)
      }
    }
  }

  private notifyListeners(operation: string, state: PendingState) {
    const listeners = this.listeners.get(operation)
    if (listeners) {
      listeners.forEach(callback => callback(state))
    }
  }
}

// Instancia global singleton
export const pendingManager = new PendingStateManager()

// Cleanup automático cada 2 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    pendingManager.cleanup()
  }, 2 * 60 * 1000)
}

// Hook para usar en componentes React
export const usePendingState = (operation: string) => {
  const [state, setState] = React.useState(() => pendingManager.getState(operation))

  React.useEffect(() => {
    return pendingManager.subscribe(operation, setState)
  }, [operation])

  const setPending = React.useCallback((isPending: boolean, error: string | null = null) => {
    pendingManager.setPending(operation, isPending, error)
  }, [operation])

  return { ...state, setPending }
}

// Re-export para compatibilidad
export default pendingManager