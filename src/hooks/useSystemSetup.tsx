
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
      // Verificar si hay organizaciones
      const { data: orgs, error } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)

      if (error) {
        console.error('Error verificando setup:', error)
        setIsSetup(false)
      } else {
        setIsSetup((orgs && orgs.length > 0))
      }
    } catch (error) {
      console.error('Error verificando setup:', error)
      setIsSetup(false)
    } finally {
      setLoading(false)
    }
  }

  return { isSetup, loading, checkSetupStatus }
}
