
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const useSystemSetup = () => {
  const [isSetup, setIsSetup] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('id')
          .limit(1)
        
        if (error) {
          console.log('No organizations found, system needs setup')
          setIsSetup(false)
        } else {
          setIsSetup(data && data.length > 0)
        }
      } catch (error) {
        console.log('Error checking setup, assuming needs setup')
        setIsSetup(false)
      } finally {
        setLoading(false)
      }
    }

    checkSetup()
  }, [])

  return { isSetup, loading }
}
