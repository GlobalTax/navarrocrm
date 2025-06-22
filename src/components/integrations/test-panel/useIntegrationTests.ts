
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { TestResult } from './types'

export const useIntegrationTests = () => {
  const { user } = useApp()
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])

  const runTest = async (testName: string, testFn: () => Promise<TestResult>) => {
    setTestResults(prev => prev.map(result => 
      result.name === testName 
        ? { ...result, status: 'pending', message: 'Ejecutando...' }
        : result
    ))

    try {
      const result = await testFn()
      setTestResults(prev => prev.map(r => r.name === testName ? result : r))
    } catch (error) {
      setTestResults(prev => prev.map(r => 
        r.name === testName 
          ? { 
              name: testName, 
              status: 'error', 
              message: 'Error inesperado',
              details: error instanceof Error ? error.message : 'Error desconocido'
            }
          : r
      ))
    }
  }

  const testDatabaseConnection = async (): Promise<TestResult> => {
    try {
      const { data, error } = await supabase
        .from('organization_integrations')
        .select('id')
        .limit(1)

      if (error) throw error

      return {
        name: 'Conexión Base de Datos',
        status: 'success',
        message: 'Conexión establecida correctamente'
      }
    } catch (error) {
      return {
        name: 'Conexión Base de Datos',
        status: 'error',
        message: 'Error de conexión',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  const testOutlookIntegration = async (): Promise<TestResult> => {
    try {
      if (!user?.org_id) {
        return {
          name: 'Integración Outlook',
          status: 'warning',
          message: 'Usuario sin organización'
        }
      }

      const { data, error } = await supabase
        .from('organization_integrations')
        .select('*')
        .eq('org_id', user.org_id)
        .eq('integration_type', 'outlook')
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (!data) {
        return {
          name: 'Integración Outlook',
          status: 'warning',
          message: 'Configuración no encontrada'
        }
      }

      if (!data.is_enabled) {
        return {
          name: 'Integración Outlook',
          status: 'warning',
          message: 'Integración deshabilitada'
        }
      }

      if (!data.outlook_client_id || !data.outlook_tenant_id) {
        return {
          name: 'Integración Outlook',
          status: 'error',
          message: 'Credenciales incompletas'
        }
      }

      return {
        name: 'Integración Outlook',
        status: 'success',
        message: 'Configuración válida'
      }
    } catch (error) {
      return {
        name: 'Integración Outlook',
        status: 'error',
        message: 'Error de verificación',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  const testUserTokens = async (): Promise<TestResult> => {
    try {
      if (!user?.org_id) {
        return {
          name: 'Tokens Usuario',
          status: 'warning',
          message: 'Usuario sin organización'
        }
      }

      const { data, error } = await supabase
        .from('user_outlook_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('org_id', user.org_id)
        .eq('is_active', true)

      if (error) throw error

      if (!data || data.length === 0) {
        return {
          name: 'Tokens Usuario',
          status: 'warning',
          message: 'No hay tokens activos'
        }
      }

      const activeToken = data[0]
      const isExpired = new Date(activeToken.token_expires_at) <= new Date()

      if (isExpired) {
        return {
          name: 'Tokens Usuario',
          status: 'warning',
          message: 'Token expirado',
          details: `Expiró: ${new Date(activeToken.token_expires_at).toLocaleString('es-ES')}`
        }
      }

      return {
        name: 'Tokens Usuario',
        status: 'success',
        message: 'Token válido y activo'
      }
    } catch (error) {
      return {
        name: 'Tokens Usuario',
        status: 'error',
        message: 'Error verificando tokens',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  const testEdgeFunctions = async (): Promise<TestResult> => {
    try {
      const response = await fetch('https://jzbbbwfnzpwxmuhpbdya.supabase.co/functions/v1/outlook-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6YmJid2ZuenB3eG11aHBiZHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDMxODgsImV4cCI6MjA2NjAxOTE4OH0.NMClKY9QPN77oFVhIv4i0EzGaKvFxX6wJj06l2dTr-8`
        },
        body: JSON.stringify({ action: 'ping' })
      })

      if (response.status === 404) {
        return {
          name: 'Edge Functions',
          status: 'warning',
          message: 'Función no desplegada'
        }
      }

      return {
        name: 'Edge Functions',
        status: 'success',
        message: 'Funciones accesibles'
      }
    } catch (error) {
      return {
        name: 'Edge Functions',
        status: 'warning',
        message: 'No se pueden verificar',
        details: 'Posiblemente no desplegadas'
      }
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([
      { name: 'Conexión Base de Datos', status: 'pending', message: 'Iniciando...' },
      { name: 'Integración Outlook', status: 'pending', message: 'Iniciando...' },
      { name: 'Tokens Usuario', status: 'pending', message: 'Iniciando...' },
      { name: 'Edge Functions', status: 'pending', message: 'Iniciando...' }
    ])

    await runTest('Conexión Base de Datos', testDatabaseConnection)
    await runTest('Integración Outlook', testOutlookIntegration)
    await runTest('Tokens Usuario', testUserTokens)
    await runTest('Edge Functions', testEdgeFunctions)

    setIsRunning(false)
    toast.success('Tests completados')
  }

  return {
    isRunning,
    testResults,
    runAllTests
  }
}
