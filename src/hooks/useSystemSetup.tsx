
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
      console.log('Verificando estado del setup...')
      
      // Verificar si hay organizaciones usando una consulta directa
      const { data: orgs, error } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)

      if (error) {
        console.error('Error verificando setup:', error)
        // Si hay error, asumimos que el sistema no está configurado
        setIsSetup(false)
      } else {
        console.log('Organizaciones encontradas:', orgs?.length || 0)
        setIsSetup((orgs && orgs.length > 0))
      }
    } catch (error) {
      console.error('Error en checkSetupStatus:', error)
      setIsSetup(false)
    } finally {
      setLoading(false)
    }
  }

  return { isSetup, loading, checkSetupStatus }
}
