
import { supabase } from '@/integrations/supabase/client'
import { TestResult } from '../types'

export const integrationTestService = {
  async testDatabaseConnection(): Promise<TestResult> {
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
  },

  async testOutlookIntegration(orgId: string): Promise<TestResult> {
    try {
      if (!orgId) {
        return {
          name: 'Integración Outlook',
          status: 'warning',
          message: 'Usuario sin organización'
        }
      }

      const { data, error } = await supabase
        .from('organization_integrations')
        .select('*')
        .eq('org_id', orgId)
        .eq('integration_type', 'outlook')
        .maybeSingle()

      if (error) throw error

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
  },

  async testUserTokens(userId: string, orgId: string): Promise<TestResult> {
    try {
      if (!orgId) {
        return {
          name: 'Tokens Usuario',
          status: 'warning',
          message: 'Usuario sin organización'
        }
      }

      const { data, error } = await supabase
        .from('user_outlook_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('org_id', orgId)
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
  },

  async testEdgeFunctions(): Promise<TestResult> {
    try {
      // Obtener el token de sesión actual
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        return {
          name: 'Edge Functions',
          status: 'warning',
          message: 'Sin sesión activa'
        }
      }

      const response = await supabase.functions.invoke('outlook-auth', {
        body: { action: 'ping' }
      })

      if (response.error) {
        return {
          name: 'Edge Functions',
          status: 'warning',
          message: 'Función no disponible',
          details: response.error.message
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
}
