
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const useSystemSetup = () => {
  const [isSetup, setIsSetup] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSetupStatus()
  }, [])

  const checkSetupStatus = async () => {
    try {
      console.log('🔍 Verificando estado del setup del sistema...')
      
      // Primero intentar usar la función RPC
      const { data: rpcResult, error: rpcError } = await supabase.rpc('is_system_setup')

      if (rpcError) {
        console.warn('⚠️ Error en RPC is_system_setup:', rpcError.message)
        // Fallback: verificar directamente la tabla organizations
        console.log('🔄 Intentando verificación directa...')
        
        const { data: orgs, error: orgError } = await supabase
          .from('organizations')
          .select('id')
          .limit(1)
        
        if (orgError) {
          console.error('❌ Error verificando organizations directamente:', orgError.message)
          // Si ambos métodos fallan, asumir que NO está configurado
          console.log('📝 Asumiendo sistema NO configurado por los errores')
          setIsSetup(false)
        } else {
          const setupStatus = orgs && orgs.length > 0
          console.log('✅ Verificación directa exitosa. Sistema configurado:', setupStatus)
          setIsSetup(setupStatus)
        }
      } else {
        console.log('✅ RPC exitoso. Sistema configurado:', rpcResult)
        setIsSetup(rpcResult === true)
      }
    } catch (error) {
      console.error('💥 Error inesperado en checkSetupStatus:', error)
      // En caso de error crítico, asumir que NO está configurado para permitir setup
      setIsSetup(false)
    } finally {
      setLoading(false)
    }
  }

  return { isSetup, loading, checkSetupStatus }
}
