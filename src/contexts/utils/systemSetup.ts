
import { supabase } from '@/integrations/supabase/client'

export const initializeSystemSetup = async (
  setIsSetup: (setup: boolean | null) => void,
  setSetupLoading: (loading: boolean) => void
) => {
  try {
    console.log('🔧 [SystemSetup] Iniciando verificación mejorada del sistema...')
    
    // Timeout más robusto pero no tan agresivo
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.log('⏰ [SystemSetup] Timeout alcanzado - verificando con fallback')
        resolve(true) // Fallback: asumir configurado después del timeout
      }, 3000) // 3 segundos de timeout
    })

    // Usar la función RPC mejorada
    const queryPromise = supabase
      .rpc('is_system_setup')
      .then(({ data, error }) => {
        if (error) {
          console.log('🚨 [SystemSetup] Error en RPC, usando verificación directa:', error.message)
          
          // Fallback directo a verificación de organizaciones
          return supabase
            .from('organizations')
            .select('id')
            .limit(1)
            .maybeSingle()
            .then(({ data: orgData, error: orgError }) => {
              if (orgError) {
                console.log('🚨 [SystemSetup] Error en fallback:', orgError.message)
                return true // Asumir configurado si hay errores
              }
              const isConfigured = orgData !== null
              console.log('🔧 [SystemSetup] Verificación directa completada:', isConfigured)
              return isConfigured
            })
        }
        
        const isConfigured = data === true
        console.log('✅ [SystemSetup] RPC exitoso - Sistema configurado:', isConfigured)
        return isConfigured
      })

    const systemIsSetup = await Promise.race([queryPromise, timeoutPromise])
    
    console.log('🏁 [SystemSetup] Resultado final:', systemIsSetup)
    setIsSetup(systemIsSetup)
  } catch (error) {
    console.warn('⚠️ [SystemSetup] Error en inicialización:', error)
    setIsSetup(true) // Fallback final: asumir configurado
  } finally {
    setSetupLoading(false)
  }
}

// Nueva función para verificar estado detallado
export const getDetailedSystemStatus = async () => {
  try {
    const { data, error } = await supabase.rpc('get_setup_status')
    
    if (error) {
      console.error('Error obteniendo estado detallado:', error)
      return null
    }
    
    console.log('📊 Estado detallado del sistema:', data)
    return data
  } catch (error) {
    console.error('Error crítico obteniendo estado:', error)
    return null
  }
}
