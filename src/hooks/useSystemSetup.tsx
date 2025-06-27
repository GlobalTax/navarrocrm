
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

const SETUP_CHECK_TIMEOUT = 10000 // Aumentado a 10 segundos para ser más robusto

export const useSystemSetup = () => {
  const [isSetup, setIsSetup] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSetup = async () => {
      let timeoutId: NodeJS.Timeout

      try {
        console.log('🔧 [useSystemSetup] Verificando configuración del sistema...')
        
        // Crear timeout de seguridad más robusto
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('TIMEOUT'))
          }, SETUP_CHECK_TIMEOUT)
        })
        
        // Consulta optimizada para verificar si existe alguna organización
        const queryPromise = supabase
          .from('organizations')
          .select('id')
          .limit(1)
          .maybeSingle()
        
        // Ejecutar con timeout
        const result = await Promise.race([queryPromise, timeoutPromise])
        
        clearTimeout(timeoutId)
        
        const { data, error } = result
        
        if (error) {
          console.log('🔧 [useSystemSetup] Error consultando organizations:', error.message)
          // En caso de error, asumir que está configurado para no bloquear
          setIsSetup(true)
        } else if (data) {
          console.log('🔧 [useSystemSetup] Sistema configurado correctamente')
          setIsSetup(true)
        } else {
          // No hay datos - sistema no configurado
          console.log('🔧 [useSystemSetup] No se encontraron organizaciones - sistema necesita configuración')
          setIsSetup(false)
        }
      } catch (error: any) {
        if (timeoutId) clearTimeout(timeoutId)
        
        if (error.message === 'TIMEOUT') {
          console.warn('⏰ [useSystemSetup] Timeout en verificación - asumiendo sistema configurado por robustez')
          setIsSetup(true) // Fallback robusto: asumir configurado
        } else {
          console.error('🔧 [useSystemSetup] Error crítico verificando setup:', error)
          setIsSetup(true) // Fallback robusto: asumir configurado
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
