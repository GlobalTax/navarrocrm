
import { supabase } from '@/integrations/supabase/client'
import { setupCache } from './authCache'

export const checkSystemSetup = async (): Promise<boolean> => {
  try {
    // Verificar caché primero
    const now = Date.now()
    if (setupCache.isSetup !== null && (now - setupCache.timestamp) < setupCache.CACHE_DURATION) {
      console.log('📋 [SystemSetup] Usando caché para setup:', setupCache.isSetup)
      return setupCache.isSetup
    }

    console.log('🔧 [SystemSetup] Verificando configuración del sistema...')
    
    // Consulta con timeout mejorado usando Promise.race
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT')), 8000)
    })

    const queryPromise = supabase
      .from('organizations')
      .select('id')
      .limit(1)
      .maybeSingle()

    try {
      const result = await Promise.race([queryPromise, timeoutPromise])
      const { data, error } = result

      const systemIsSetup = !error && data !== null
      
      // Actualizar caché
      setupCache.isSetup = systemIsSetup
      setupCache.timestamp = now
      
      console.log('✅ [SystemSetup] Setup verificado:', systemIsSetup)
      return systemIsSetup
    } catch (fetchError: any) {
      if (fetchError.message === 'TIMEOUT') {
        console.warn('⏰ [SystemSetup] Timeout en verificación setup - asumiendo configurado')
        setupCache.isSetup = true
        setupCache.timestamp = now
        return true
      } else {
        throw fetchError
      }
    }
  } catch (error: any) {
    console.error('❌ [SystemSetup] Error verificando setup:', error)
    // Fallback seguro
    setupCache.isSetup = true
    setupCache.timestamp = Date.now()
    return true
  }
}
