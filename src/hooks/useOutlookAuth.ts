import { useState, useCallback } from 'react'
import { OutlookAuthService } from '@/services/outlookAuthService'
import { toast } from 'sonner'

export interface OutlookAuthState {
  isConnecting: boolean
  isConnected: boolean
  error: string | null
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'error' | 'expired'
}

export function useOutlookAuth() {
  const [state, setState] = useState<OutlookAuthState>({
    isConnecting: false,
    isConnected: false,
    error: null,
    connectionStatus: 'idle'
  })

  const startConnection = useCallback(async () => {
    setState(prev => ({ 
      ...prev, 
      isConnecting: true, 
      error: null, 
      connectionStatus: 'connecting' 
    }))

    try {
      // Validar autenticación antes de continuar
      console.log('🔍 [useOutlookAuth] Validando estado de autenticación...')
      const tokenValidation = await OutlookAuthService.validateAuthToken()
      if (!tokenValidation.isValid) {
        throw new Error(`Error de autenticación: ${tokenValidation.error}`)
      }

      console.log('✅ [useOutlookAuth] Token validado, iniciando OAuth...')
      const result = await OutlookAuthService.startOAuthFlow()
      
      if (!result.success) {
        throw new Error(result.error || 'Error iniciando OAuth')
      }

      if (!result.authUrl) {
        throw new Error('URL de autorización no disponible')
      }

      console.log('🔗 [useOutlookAuth] Abriendo ventana de autorización...', {
        authUrl: result.authUrl.substring(0, 100) + '...'
      })

      // Abrir popup para OAuth
      const popup = window.open(
        result.authUrl,
        'outlook-auth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      )

      if (!popup) {
        throw new Error('No se pudo abrir la ventana de autorización. Verifique que los popups estén habilitados.')
      }

      console.log('✅ [useOutlookAuth] Ventana popup abierta exitosamente')

      // Escuchar mensaje del popup
      const handleMessage = async (event: MessageEvent) => {
        console.log('📨 [useOutlookAuth] Mensaje recibido:', {
          origin: event.origin,
          type: event.data?.type,
          hasCode: !!event.data?.code
        })

        // Permitir mensajes de cualquier origen para el OAuth callback
        if (event.data?.type === 'OUTLOOK_AUTH_CODE' && event.data?.code) {
          console.log('📨 [useOutlookAuth] Código de autorización recibido, procesando...')
          window.removeEventListener('message', handleMessage)
          
          // No cerrar el popup inmediatamente para debug
          setTimeout(() => popup.close(), 2000)

          try {
            // Procesar código de autorización
            console.log('🔄 [useOutlookAuth] Llamando handleOAuthCallback...')
            const callbackResult = await OutlookAuthService.handleOAuthCallback(event.data.code)
            console.log('📝 [useOutlookAuth] Resultado del callback:', callbackResult)
            
            if (callbackResult.success) {
              setState(prev => ({ 
                ...prev, 
                isConnecting: false, 
                isConnected: true, 
                connectionStatus: 'connected' 
              }))
              toast.success('Conexión establecida correctamente')
              console.log('✅ [useOutlookAuth] Estado actualizado a conectado')
            } else {
              throw new Error(callbackResult.error || 'Error completando autorización')
            }
          } catch (callbackError) {
            console.error('❌ [useOutlookAuth] Error en callback:', callbackError)
            setState(prev => ({ 
              ...prev, 
              isConnecting: false, 
              error: callbackError instanceof Error ? callbackError.message : 'Error procesando autorización',
              connectionStatus: 'error'
            }))
            toast.error(`Error de autorización: ${callbackError instanceof Error ? callbackError.message : 'Error desconocido'}`)
          }
        } else {
          console.log('📨 [useOutlookAuth] Mensaje ignorado - tipo no válido o sin código')
        }
      }

      window.addEventListener('message', handleMessage)
      console.log('👂 [useOutlookAuth] Event listener añadido para mensajes')

      // Verificar periódicamente si la ventana se cerró
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          console.log('🚪 [useOutlookAuth] Ventana popup cerrada')
          clearInterval(checkClosed)
          window.removeEventListener('message', handleMessage)
          
          // Solo mostrar error si no se completó la conexión
          setState(prev => {
            if (!prev.isConnected && prev.connectionStatus === 'connecting') {
              return {
                ...prev,
                isConnecting: false,
                error: 'Ventana de autorización cerrada sin completar la conexión',
                connectionStatus: 'error'
              }
            }
            return prev
          })
        }
      }, 1000)

      // Timeout para cerrar popup si no responde (5 minutos)
      setTimeout(() => {
        if (!popup.closed) {
          console.log('⏰ [useOutlookAuth] Timeout alcanzado, cerrando ventana')
          popup.close()
          clearInterval(checkClosed)
          window.removeEventListener('message', handleMessage)
          setState(prev => ({ 
            ...prev, 
            isConnecting: false, 
            error: 'Tiempo de espera agotado (5 minutos)',
            connectionStatus: 'error'
          }))
          toast.error('Tiempo de espera agotado. Intente nuevamente.')
        }
      }, 300000)
    } catch (error) {
      console.error('❌ [useOutlookAuth] Error en conexión OAuth:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      
      setState(prev => ({ 
        ...prev, 
        isConnecting: false, 
        error: errorMessage,
        connectionStatus: 'error'
      }))
      
      toast.error(`Error de conexión: ${errorMessage}`)
    }
  }, [])

  const runDiagnostic = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }))
      
      const diagnostics = await OutlookAuthService.runConnectionDiagnostic()
      
      const hasErrors = diagnostics.some(d => !d.success)
      if (hasErrors) {
        const errorMessages = diagnostics
          .filter(d => !d.success)
          .map(d => `${d.step}: ${d.message}`)
          .join('; ')
        
        setState(prev => ({ 
          ...prev, 
          error: errorMessages,
          connectionStatus: 'error'
        }))
      } else {
        setState(prev => ({ 
          ...prev, 
          connectionStatus: 'connected',
          isConnected: true
        }))
      }
      
      return diagnostics
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error en diagnóstico'
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        connectionStatus: 'error'
      }))
      throw error
    }
  }, [])

  const checkConnection = useCallback(async () => {
    try {
      // Implementar verificación de estado
      const diagnostics = await OutlookAuthService.runConnectionDiagnostic()
      const hasValidConnection = diagnostics.every(d => d.success)
      
      setState(prev => ({
        ...prev,
        isConnected: hasValidConnection,
        connectionStatus: hasValidConnection ? 'connected' : 'error'
      }))
      
      return hasValidConnection
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnected: false,
        connectionStatus: 'error',
        error: error instanceof Error ? error.message : 'Error verificando conexión'
      }))
      return false
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      isConnecting: false,
      isConnected: false,
      error: null,
      connectionStatus: 'idle'
    })
  }, [])

  return {
    ...state,
    startConnection,
    runDiagnostic,
    checkConnection,
    reset
  }
}