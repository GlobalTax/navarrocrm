
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react'

export default function NylasCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Obtener parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')
        const error = urlParams.get('error')
        const errorDescription = urlParams.get('error_description')

        console.log('Callback recibido:', { code: !!code, state, error, errorDescription })

        if (error) {
          console.error('Error de autenticación de Nylas:', error, errorDescription)
          
          // Si es una ventana popup, enviar error a la ventana padre
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({
              type: 'nylas-auth-error',
              error: error,
              description: errorDescription
            }, window.location.origin)
            
            // Cerrar la ventana después de un breve delay
            setTimeout(() => window.close(), 1000)
            return
          }

          // Si no es popup, redirigir con error
          navigate('/emails/dashboard?error=auth_failed', { replace: true })
          return
        }

        if (code && state) {
          console.log('Código de autorización recibido:', code.substring(0, 10) + '...')
          
          // Si es una ventana popup, enviar código a la ventana padre
          if (window.opener && !window.opener.closed) {
            console.log('Enviando código a ventana padre')
            
            window.opener.postMessage({
              type: 'nylas-auth-success',
              code: code,
              state: state
            }, window.location.origin)
            
            // Cerrar la ventana después de un breve delay
            setTimeout(() => window.close(), 1000)
            return
          }

          // Si no es popup, redirigir con éxito
          navigate('/emails/dashboard?auth=success', { replace: true })
        } else {
          // Sin código ni error, probablemente acceso directo
          console.log('Acceso directo al callback sin parámetros válidos')
          
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({
              type: 'nylas-auth-error',
              error: 'no_code',
              description: 'No se recibió código de autorización'
            }, window.location.origin)
            
            setTimeout(() => window.close(), 1000)
          } else {
            navigate('/emails/dashboard', { replace: true })
          }
        }
      } catch (error) {
        console.error('Error procesando callback de Nylas:', error)
        
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({
            type: 'nylas-auth-error',
            error: 'callback_error',
            description: 'Error procesando la respuesta de autenticación'
          }, window.location.origin)
          
          setTimeout(() => window.close(), 1000)
        } else {
          navigate('/emails/dashboard?error=callback_failed', { replace: true })
        }
      }
    }

    handleCallback()
  }, [navigate])

  // Mostrar interfaz diferente según si es popup o no
  const isPopup = window.opener && !window.opener.closed

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md border-0.5 border-black rounded-[10px] shadow-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {isPopup ? (
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            ) : (
              <CheckCircle className="h-8 w-8 text-green-600" />
            )}
          </div>
          <CardTitle className="text-xl font-semibold">
            {isPopup ? 'Procesando Autenticación...' : 'Autenticación Completada'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            {isPopup 
              ? 'Procesando la respuesta de Nylas. Esta ventana se cerrará automáticamente.'
              : 'La autenticación se ha completado. Serás redirigido en un momento.'
            }
          </p>
          {!isPopup && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Redirigiendo...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
