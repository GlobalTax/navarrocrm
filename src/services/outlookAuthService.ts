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
   * Inicia el proceso de autenticación OAuth con Microsoft
   */
  static async startOAuthFlow(): Promise<{ success: boolean; authUrl?: string; error?: string }> {
    try {
      console.log('🚀 [OutlookAuthService] Iniciando flujo OAuth...')
      
      const validation = await this.validateAuthToken()
      if (!validation.isValid) {
        console.warn('⚠️ [OutlookAuthService] Token inválido para OAuth:', validation.error)
        return { success: false, error: validation.error }
      }

      const { data, error } = await supabase.functions.invoke('outlook-auth', {
        body: { action: 'get_auth_url' },
        headers: {
          Authorization: `Bearer ${validation.token}`
        }
      })

      if (error) {
        console.error('❌ [OutlookAuthService] Error obteniendo URL de auth:', error)
        return { success: false, error: error.message }
      }

      if (!data?.auth_url) {
        console.error('❌ [OutlookAuthService] URL de autorización no recibida')
        return { success: false, error: 'No se pudo generar la URL de autorización' }
      }

      console.log('✅ [OutlookAuthService] URL de OAuth generada exitosamente')
      return { success: true, authUrl: data.auth_url }

    } catch (error) {
      console.error('❌ [OutlookAuthService] Error inesperado en OAuth:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }

  /**
   * Maneja el código de autorización OAuth y completa la conexión
   */
  static async handleOAuthCallback(code: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 [OutlookAuthService] Procesando callback OAuth...')
      
      const validation = await this.validateAuthToken()
      if (!validation.isValid) {
        return { success: false, error: validation.error }
      }

      const { data, error } = await supabase.functions.invoke('outlook-auth', {
        body: { 
          action: 'exchange_code',
          code: code
        },
        headers: {
          Authorization: `Bearer ${validation.token}`
        }
      })

      if (error) {
        console.error('❌ [OutlookAuthService] Error en exchange_code:', error)
        return { success: false, error: error.message }
      }

      if (!data?.success) {
        console.error('❌ [OutlookAuthService] Exchange code falló:', data)
        return { success: false, error: 'Error completando la autorización' }
      }

      console.log('✅ [OutlookAuthService] OAuth completado exitosamente')
      toast.success('Conexión de Outlook establecida correctamente')
      return { success: true }

    } catch (error) {
      console.error('❌ [OutlookAuthService] Error inesperado en callback:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }

  /**
   * Maneja la reconexión automática con retry logic
   */
  static async handleReconnection(maxRetries: number = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 [OutlookAuthService] Intento de reconexión ${attempt}/${maxRetries}`)
        
        const result = await this.startOAuthFlow()
        if (result.success && result.authUrl) {
          console.log('✅ [OutlookAuthService] Reconexión exitosa')
          return true
        }

        throw new Error(result.error || 'Error en reconexión')

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