/**
 * Obtención centralizada de org_id para evitar inconsistencias
 */

import { supabase } from '@/integrations/supabase/client'

/**
 * Obtiene el org_id del usuario autenticado de forma consistente
 */
export const getUserOrgId = async (): Promise<string> => {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  
  if (userError) {
    throw new Error(`Error de autenticación: ${userError.message}`)
  }
  
  if (!userData?.user) {
    throw new Error('Usuario no autenticado')
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('org_id')
    .eq('id', userData.user.id)
    .single()

  if (profileError) {
    throw new Error(`Error al obtener perfil de usuario: ${profileError.message}`)
  }

  if (!userProfile?.org_id) {
    throw new Error('No se pudo obtener la organización del usuario')
  }

  return userProfile.org_id
}

/**
 * Hook para obtener org_id de forma reactiva
 */
export const useUserOrgId = () => {
  const [orgId, setOrgId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrgId = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const id = await getUserOrgId()
        setOrgId(id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrgId()
  }, [])

  return { orgId, isLoading, error }
}

// Importar React hooks si no están disponibles
import { useState, useEffect } from 'react'