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
      const result = await OutlookAuthService.startOAuthFlow()
      
      if (!result.success) {
        throw new Error(result.error || 'Error iniciando OAuth')
      }

      if (!result.authUrl) {
        throw new Error('URL de autorización no disponible')
      }

      // Abrir popup para OAuth
      const popup = window.open(
        result.authUrl,
        'outlook-auth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      )

      if (!popup) {
        throw new Error('No se pudo abrir la ventana de autorización. Verifique que los popups estén habilitados.')
      }

      // Escuchar mensaje del popup
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return

        if (event.data.type === 'OUTLOOK_AUTH_CODE' && event.data.code) {
          window.removeEventListener('message', handleMessage)
          popup.close()

          // Procesar código de autorización
          const callbackResult = await OutlookAuthService.handleOAuthCallback(event.data.code)
          
          if (callbackResult.success) {
            setState(prev => ({ 
              ...prev, 
              isConnecting: false, 
              isConnected: true, 
              connectionStatus: 'connected' 
            }))
            toast.success('Conexión establecida correctamente')
          } else {
            throw new Error(callbackResult.error || 'Error completando autorización')
          }
        }
      }

      window.addEventListener('message', handleMessage)

      // Timeout para cerrar popup si no responde
      setTimeout(() => {
        if (!popup.closed) {
          popup.close()
          window.removeEventListener('message', handleMessage)
          setState(prev => ({ 
            ...prev, 
            isConnecting: false, 
            error: 'Tiempo de espera agotado',
            connectionStatus: 'error'
          }))
          toast.error('Tiempo de espera agotado. Intente nuevamente.')
        }
      }, 300000) // 5 minutos

    } catch (error) {
      console.error('Error en conexión OAuth:', error)
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