
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
      
      // Usar la función de Supabase para verificar si el sistema está configurado
      const { data, error } = await supabase.rpc('is_system_setup')

      if (error) {
        console.error('Error verificando setup:', error)
        // Si hay error, verificar manualmente
        const { data: orgs, error: orgError } = await supabase
          .from('organizations')
          .select('id')
          .limit(1)
        
        if (orgError) {
          console.error('Error manual verificando setup:', orgError)
          setIsSetup(false)
        } else {
          setIsSetup((orgs && orgs.length > 0))
        }
      } else {
        console.log('Sistema configurado:', data)
        setIsSetup(data === true)
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
