
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

const SETUP_CHECK_TIMEOUT = 2000 // Reducido a 2 segundos

export const useSystemSetup = () => {
  const [isSetup, setIsSetup] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSetup = async () => {
      let timeoutId: NodeJS.Timeout

      try {
        console.log('🔧 [useSystemSetup] Verificando configuración del sistema...')
        
        // Timeout de seguridad más agresivo
        const controller = new AbortController()
        timeoutId = setTimeout(() => {
          console.warn('⏰ [useSystemSetup] Timeout en verificación - asumiendo sistema configurado')
          controller.abort()
        }, SETUP_CHECK_TIMEOUT)
        
        // Consulta más eficiente - solo verificamos si existe alguna organización
        const { data, error } = await supabase
          .from('organizations')
          .select('id')
          .limit(1)
          .single()
          .abortSignal(controller.signal)
        
        clearTimeout(timeoutId)
        
        if (error) {
          if (error.code === 'PGRST116') {
            // No hay datos - sistema no configurado
            console.log('🔧 [useSystemSetup] No se encontraron organizaciones - sistema necesita configuración')
            setIsSetup(false)
          } else {
            console.log('🔧 [useSystemSetup] Error consultando organizations:', error.message)
            // En caso de error, asumir que está configurado para no bloquear
            setIsSetup(true)
          }
        } else {
          console.log('🔧 [useSystemSetup] Sistema configurado correctamente')
          setIsSetup(true)
        }
      } catch (error: any) {
        if (timeoutId) clearTimeout(timeoutId)
        
        if (error.name === 'AbortError') {
          console.warn('🔧 [useSystemSetup] Verificación cancelada por timeout - asumiendo configurado')
          setIsSetup(true) // Cambio: asumir configurado por defecto
        } else {
          console.error('🔧 [useSystemSetup] Error crítico verificando setup:', error)
          setIsSetup(true) // Cambio: asumir configurado en caso de error
        }
      } finally {
        console.log('🔧 [useSystemSetup] Finalizando verificación de setup')
        setLoading(false)
      }
    }

    checkSetup()
  }, [])

  return { isSetup, loading }
}
