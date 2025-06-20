
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'

// Circuit breaker para evitar demasiadas consultas fallidas
class CircuitBreaker {
  private failures = 0
  private lastFailure = 0
  private readonly threshold = 3
  private readonly timeout = 30000 // 30 segundos

  isOpen(): boolean {
    if (this.failures >= this.threshold) {
      if (Date.now() - this.lastFailure > this.timeout) {
        this.failures = 0 // Reset después del timeout
        return false
      }
      return true
    }
    return false
  }

  recordSuccess(): void {
    this.failures = 0
  }

  recordFailure(): void {
    this.failures++
    this.lastFailure = Date.now()
  }
}

const circuitBreaker = new CircuitBreaker()

export const useSystemSetup = () => {
  const [isSetup, setIsSetup] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debounce para evitar múltiples llamadas rápidas
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  const checkSetupStatus = useCallback(async (retryCount = 0) => {
    // Circuit breaker check
    if (circuitBreaker.isOpen()) {
      console.log('🚫 Circuit breaker abierto, evitando consulta')
      setError('Sistema temporalmente no disponible. Reintentando automáticamente...')
      // Programar retry automático después del timeout
      setTimeout(() => {
        if (retryCount < 2) {
          checkSetupStatus(retryCount + 1)
        }
      }, 35000)
      return
    }

    try {
      console.log('🔍 Verificando estado del setup del sistema... (intento', retryCount + 1, ')')
      setError(null)
      
      // Estrategia simplificada: usar directamente la consulta a organizations
      const { data: orgs, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)
        .maybeSingle()
      
      if (orgError) {
        // Si hay error 404, significa que la tabla no existe o no hay datos
        if (orgError.code === 'PGRST116' || orgError.message.includes('404')) {
          console.log('📝 Tabla organizations no encontrada o vacía - sistema no configurado')
          setIsSetup(false)
          circuitBreaker.recordSuccess()
          return
        }
        
        // Para otros errores, registrar fallo y reintentar si es necesario
        console.error('❌ Error verificando organizations:', orgError.message)
        circuitBreaker.recordFailure()
        
        if (retryCount < 2) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000) // Exponential backoff max 5s
          console.log(`🔄 Reintentando en ${delay}ms...`)
          setTimeout(() => checkSetupStatus(retryCount + 1), delay)
          return
        }
        
        throw orgError
      }

      // Si llegamos aquí, la consulta fue exitosa
      const setupStatus = !!orgs
      console.log('✅ Verificación exitosa. Sistema configurado:', setupStatus)
      setIsSetup(setupStatus)
      circuitBreaker.recordSuccess()
      
    } catch (error) {
      console.error('💥 Error inesperado en checkSetupStatus:', error)
      circuitBreaker.recordFailure()
      
      if (retryCount < 2) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000)
        console.log(`🔄 Error crítico, reintentando en ${delay}ms...`)
        setTimeout(() => checkSetupStatus(retryCount + 1), delay)
        return
      }
      
      // Después de múltiples intentos, asumir que NO está configurado para permitir setup
      console.log('📝 Después de múltiples intentos, asumiendo sistema NO configurado')
      setIsSetup(false)
      setError('No se pudo verificar el estado del sistema. Asumiendo configuración inicial necesaria.')
    } finally {
      setLoading(false)
    }
  }, [])

  const debouncedCheckSetup = useCallback(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const timer = setTimeout(() => {
      checkSetupStatus()
    }, 300) // 300ms debounce

    setDebounceTimer(timer)
  }, [checkSetupStatus, debounceTimer])

  useEffect(() => {
    debouncedCheckSetup()
    
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, []) // Solo ejecutar una vez al montar

  return { 
    isSetup, 
    loading, 
    error,
    checkSetupStatus: debouncedCheckSetup 
  }
}
