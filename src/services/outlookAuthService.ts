import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export interface AuthTokenValidation {
  isValid: boolean
  session: any | null
  token: string | null
  error?: string
}

export interface ConnectionDiagnostic {
  step: string
  success: boolean
  message: string
  data?: any
}

export class OutlookAuthService {
  
  /**
   * Valida el token de sesión actual antes de hacer llamadas
   */
  static async validateAuthToken(): Promise<AuthTokenValidation> {
    try {
      console.log('🔍 [OutlookAuthService] Validando token de autenticación...')
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('❌ [OutlookAuthService] Error obteniendo sesión:', sessionError)
        return {
          isValid: false,
          session: null,
          token: null,
          error: `Error de sesión: ${sessionError.message}`
        }
      }

      if (!session) {
        console.error('❌ [OutlookAuthService] No hay sesión activa')
        return {
          isValid: false,
          session: null,
          token: null,
          error: 'No hay sesión activa. Inicie sesión nuevamente.'
        }
      }

      if (!session.access_token) {
        console.error('❌ [OutlookAuthService] Sesión sin access_token')
        return {
          isValid: false,
          session,
          token: null,
          error: 'Token de acceso faltante. Reinicie sesión.'
        }
      }

      // Verificar si el token está cerca de expirar (menos de 5 minutos)
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0
      const timeUntilExpiry = expiresAt - Date.now()
      const fiveMinutes = 5 * 60 * 1000

      if (timeUntilExpiry < fiveMinutes) {
        console.warn('⚠️ [OutlookAuthService] Token próximo a expirar, renovando...')
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
        
        if (refreshError || !refreshedSession?.access_token) {
          console.error('❌ [OutlookAuthService] Error renovando sesión:', refreshError)
          return {
            isValid: false,
            session,
            token: session.access_token,
            error: 'Error renovando sesión. Reinicie sesión.'
          }
        }

        console.log('✅ [OutlookAuthService] Sesión renovada exitosamente')
        return {
          isValid: true,
          session: refreshedSession,
          token: refreshedSession.access_token
        }
      }

      console.log('✅ [OutlookAuthService] Token válido:', {
        userId: session.user?.id,
        expiresIn: Math.floor(timeUntilExpiry / 1000 / 60) + ' minutos'
      })

      return {
        isValid: true,
        session,
        token: session.access_token
      }

    } catch (error) {
      console.error('❌ [OutlookAuthService] Error inesperado validando token:', error)
      return {
        isValid: false,
        session: null,
        token: null,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }
    }
  }

  /**
   * Ejecuta diagnósticos de la conexión paso a paso
   */
  static async runConnectionDiagnostic(): Promise<ConnectionDiagnostic[]> {
    const diagnostics: ConnectionDiagnostic[] = []

    // Paso 1: Validar token
    const tokenValidation = await this.validateAuthToken()
    diagnostics.push({
      step: 'Token Validation',
      success: tokenValidation.isValid,
      message: tokenValidation.error || 'Token válido',
      data: tokenValidation.isValid ? {
        userId: tokenValidation.session?.user?.id,
        tokenLength: tokenValidation.token?.length
      } : undefined
    })

    if (!tokenValidation.isValid) {
      return diagnostics // No continuar si el token no es válido
    }

    // Paso 2: Probar llamada a get_auth_url
    try {
      const { data, error } = await supabase.functions.invoke('outlook-auth', {
        body: { action: 'get_auth_url' },
        headers: {
          Authorization: `Bearer ${tokenValidation.token}`
        }
      })

      diagnostics.push({
        step: 'Get Auth URL',
        success: !error && data?.auth_url,
        message: error ? `Error: ${error.message}` : 'URL de autorización generada',
        data: data?.auth_url ? { authUrlGenerated: true } : undefined
      })

    } catch (error) {
      diagnostics.push({
        step: 'Get Auth URL',
        success: false,
        message: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`
      })
    }

    // Paso 3: Verificar conexión existente
    try {
      const { data: connectionData, error: connectionError } = await supabase
        .from('user_outlook_tokens')
        .select('*')
        .eq('user_id', tokenValidation.session.user.id)
        .eq('is_active', true)
        .maybeSingle()

      diagnostics.push({
        step: 'Check Existing Connection',
        success: !connectionError,
        message: connectionError ? `Error BD: ${connectionError.message}` : 
                 connectionData ? 'Conexión existente encontrada' : 'Sin conexión previa',
        data: connectionData ? {
          hasConnection: true,
          expiresAt: connectionData.token_expires_at,
          outlookEmail: connectionData.outlook_email
        } : { hasConnection: false }
      })

    } catch (error) {
      diagnostics.push({
        step: 'Check Existing Connection',
        success: false,
        message: `Error verificando conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`
      })
    }

    return diagnostics
  }

  /**
   * Maneja la reconexión automática con retry logic
   */
  static async handleReconnection(maxRetries: number = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 [OutlookAuthService] Intento de reconexión ${attempt}/${maxRetries}`)
        
        const validation = await this.validateAuthToken()
        if (!validation.isValid) {
          throw new Error(validation.error || 'Token inválido')
        }

        const { data, error } = await supabase.functions.invoke('outlook-auth', {
          body: { action: 'get_auth_url' },
          headers: {
            Authorization: `Bearer ${validation.token}`
          }
        })

        if (error) throw error

        if (data?.auth_url) {
          console.log('✅ [OutlookAuthService] Reconexión exitosa')
          return true
        }

      } catch (error) {
        console.error(`❌ [OutlookAuthService] Intento ${attempt} falló:`, error)
        
        if (attempt < maxRetries) {
          // Esperar antes del siguiente intento (backoff exponencial)
          const delay = Math.pow(2, attempt) * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    console.error('❌ [OutlookAuthService] Todos los intentos de reconexión fallaron')
    return false
  }

  /**
   * Obtiene información detallada del estado de conexión
   */
  static async getConnectionStatus(userId: string, orgId: string) {
    try {
      const { data: connectionData, error } = await supabase
        .from('user_outlook_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('org_id', orgId)
        .eq('is_active', true)
        .maybeSingle()

      if (error) {
        console.error('Error obteniendo estado de conexión:', error)
        return { status: 'error', error: error.message }
      }

      if (!connectionData) {
        return { status: 'not_connected' }
      }

      const now = new Date()
      const expiresAt = new Date(connectionData.token_expires_at)
      const isExpired = expiresAt <= now
      const timeUntilExpiry = expiresAt.getTime() - now.getTime()

      return {
        status: isExpired ? 'expired' : 'connected',
        connectionData,
        expiresAt,
        timeUntilExpiry,
        isExpired
      }

    } catch (error) {
      console.error('Error inesperado obteniendo estado:', error)
      return { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }
}