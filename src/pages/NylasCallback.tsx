
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

        if (error) {
          console.error('Error de autenticación de Nylas:', error, errorDescription)
          
          // Si es una ventana popup, enviar error a la ventana padre
          if (window.opener) {
            window.opener.postMessage({
              type: 'nylas-auth-error',
              error: error,
              description: errorDescription
            }, window.location.origin)
            window.close()
            return
          }

          // Si no es popup, redirigir con error
          navigate('/emails/dashboard?error=auth_failed')
          return
        }

        if (code) {
          console.log('Código de autorización recibido:', code)
          
          // Si es una ventana popup, enviar código a la ventana padre
          if (window.opener) {
            window.opener.postMessage({
              type: 'nylas-auth-success',
              code: code,
              state: state
            }, window.location.origin)
            window.close()
            return
          }

          // Si no es popup, redirigir con éxito
          navigate('/emails/dashboard?auth=success')
        } else {
          // Sin código ni error, probablemente acceso directo
          if (window.opener) {
            window.opener.postMessage({
              type: 'nylas-auth-error',
              error: 'no_code',
              description: 'No se recibió código de autorización'
            }, window.location.origin)
            window.close()
          } else {
            navigate('/emails/dashboard')
          }
        }
      } catch (error) {
        console.error('Error procesando callback de Nylas:', error)
        
        if (window.opener) {
          window.opener.postMessage({
            type: 'nylas-auth-error',
            error: 'callback_error',
            description: 'Error procesando la respuesta de autenticación'
          }, window.location.origin)
          window.close()
        } else {
          navigate('/emails/dashboard?error=callback_failed')
        }
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md border-0.5 border-black rounded-[10px] shadow-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {window.opener ? (
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            ) : (
              <CheckCircle className="h-8 w-8 text-green-600" />
            )}
          </div>
          <CardTitle className="text-xl font-semibold">
            {window.opener ? 'Procesando Autenticación...' : 'Autenticación Completada'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            {window.opener 
              ? 'Procesando la respuesta de Nylas. Esta ventana se cerrará automáticamente.'
              : 'La autenticación se ha completado. Serás redirigido en un momento.'
            }
          </p>
          {!window.opener && (
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
