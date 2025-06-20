
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const useSystemSetup = () => {
  const [isSetup, setIsSetup] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    checkSetupStatus()
  }, [])

  const checkSetupStatus = async () => {
    try {
      console.log('🔍 Verificando estado del setup del sistema... (intento', retryCount + 1, ')')
      
      // Estrategia 1: Usar la función RPC con retry
      const { data: rpcResult, error: rpcError } = await supabase.rpc('is_system_setup')

      if (rpcError) {
        console.warn('⚠️ Error en RPC is_system_setup:', rpcError.message)
        
        // Estrategia 2: Verificación directa con mayor timeout y retry
        console.log('🔄 Intentando verificación directa...')
        
        const { data: orgs, error: orgError } = await supabase
          .from('organizations')
          .select('id')
          .limit(1)
        
        if (orgError) {
          console.error('❌ Error verificando organizations directamente:', orgError.message)
          
          // Estrategia 3: Retry con backoff si no hemos intentado demasiadas veces
          if (retryCount < 3) {
            console.log(`🔄 Reintentando en ${(retryCount + 1) * 1000}ms...`)
            setTimeout(() => {
              setRetryCount(prev => prev + 1)
              checkSetupStatus()
            }, (retryCount + 1) * 1000)
            return
          }
          
          // Si fallan todos los métodos, asumir que NO está configurado para permitir setup
          console.log('📝 Después de múltiples intentos, asumiendo sistema NO configurado')
          setIsSetup(false)
        } else {
          const setupStatus = orgs && orgs.length > 0
          console.log('✅ Verificación directa exitosa. Sistema configurado:', setupStatus)
          setIsSetup(setupStatus)
          setRetryCount(0) // Reset retry count on success
        }
      } else {
        console.log('✅ RPC exitoso. Sistema configurado:', rpcResult)
        setIsSetup(rpcResult === true)
        setRetryCount(0) // Reset retry count on success
      }
    } catch (error) {
      console.error('💥 Error inesperado en checkSetupStatus:', error)
      
      // En caso de error crítico, intentar una vez más si no hemos superado el límite
      if (retryCount < 3) {
        console.log(`🔄 Error crítico, reintentando en ${(retryCount + 1) * 1000}ms...`)
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          checkSetupStatus()
        }, (retryCount + 1) * 1000)
        return
      }
      
      // Después de múltiples intentos, asumir que NO está configurado
      setIsSetup(false)
    } finally {
      // Solo marcar como no loading si no vamos a reintentar
      if (retryCount >= 3 || isSetup !== null) {
        setLoading(false)
      }
    }
  }

  return { isSetup, loading, checkSetupStatus }
}
