/**
 * Sistema de limpieza y optimización automática
 * Centraliza todas las tareas de mantenimiento de la aplicación
 */

import { pendingManager } from './pendingStatesCleanup'
import { logger } from './logger'

class SystemCleaner {
  private cleanupInterval: NodeJS.Timeout | null = null
  private isInitialized = false

  // Inicializar sistema de limpieza automática
  initialize() {
    if (this.isInitialized || typeof window === 'undefined') return
    
    logger.info('Iniciando sistema de limpieza automática')
    
    // Limpieza cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.performCleanup()
    }, 5 * 60 * 1000)
    
    // Limpieza al cerrar la pestaña
    window.addEventListener('beforeunload', () => {
      this.performCleanup()
    })
    
    this.isInitialized = true
  }

  // Ejecutar limpieza completa
  private performCleanup() {
    try {
      // Limpiar estados pendientes antiguos
      pendingManager.cleanup()
      
      // Limpiar localStorage (entradas de más de 24h)
      this.cleanupLocalStorage()
      
      // Limpiar sessionStorage (entradas de más de 1h)
      this.cleanupSessionStorage()
      
      logger.debug('Limpieza automática completada')
    } catch (error) {
      logger.error('Error durante limpieza automática:', error)
    }
  }

  // Limpiar LocalStorage de entradas antigas
  private cleanupLocalStorage() {
    if (typeof localStorage === 'undefined') return
    
    const maxAge = 24 * 60 * 60 * 1000 // 24 horas
    const now = Date.now()
    
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue
      
      try {
        const value = localStorage.getItem(key)
        if (!value) continue
        
        // Intentar parsear como objeto con timestamp
        const parsed = JSON.parse(value)
        if (parsed.timestamp && (now - parsed.timestamp) > maxAge) {
          keysToRemove.push(key)
        }
      } catch {
        // Si no se puede parsear, verificar si es muy viejo por otros métodos
        // Por simplicidad, mantener por ahora
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      logger.debug(`Removido del localStorage: ${key}`)
    })
  }

  // Limpiar SessionStorage de entradas antigas
  private cleanupSessionStorage() {
    if (typeof sessionStorage === 'undefined') return
    
    const maxAge = 60 * 60 * 1000 // 1 hora
    const now = Date.now()
    
    const keysToRemove: string[] = []
    
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (!key) continue
      
      try {
        const value = sessionStorage.getItem(key)
        if (!value) continue
        
        const parsed = JSON.parse(value)
        if (parsed.timestamp && (now - parsed.timestamp) > maxAge) {
          keysToRemove.push(key)
        }
      } catch {
        // Mantener si no se puede parsear
      }
    }
    
    keysToRemove.forEach(key => {
      sessionStorage.removeItem(key)
      logger.debug(`Removido del sessionStorage: ${key}`)
    })
  }

  // Destruir sistema de limpieza
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.isInitialized = false
    logger.info('Sistema de limpieza detenido')
  }

  // Ejecutar limpieza manual
  forceCleanup() {
    logger.info('Ejecutando limpieza manual')
    this.performCleanup()
  }
}

// Instancia singleton
export const systemCleaner = new SystemCleaner()

// Auto-inicializar en el browser
if (typeof window !== 'undefined') {
  systemCleaner.initialize()
}