
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export default function NylasCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Procesando autenticación...')
  const { user } = useApp()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Obtener parámetros de la URL
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        console.log('Callback params:', { code: !!code, state, error, errorDescription })

        if (error) {
          console.error('Error de autenticación de OAuth:', error, errorDescription)
          setStatus('error')
          setMessage(`Error de autenticación: ${errorDescription || error}`)
          
          // Redirigir con error después de 3 segundos
          setTimeout(() => {
            navigate('/emails/dashboard?error=auth_failed')
          }, 3000)
          return
        }

        if (!code) {
          console.error('No se recibió código de autorización')
          setStatus('error')
          setMessage('No se recibió código de autorización')
          
          setTimeout(() => {
            navigate('/emails/dashboard?error=no_code')
          }, 3000)
          return
        }

        if (!user?.id || !user?.org_id) {
          console.error('Usuario no encontrado o sin organización')
          setStatus('error')
          setMessage('Usuario no encontrado. Por favor, inicie sesión nuevamente.')
          
          setTimeout(() => {
            navigate('/login')
          }, 3000)
          return
        }

        console.log('Intercambiando código por token...')
        setMessage('Intercambiando código de autorización...')

        // Intercambiar código por token
        const { data, error: exchangeError } = await supabase.functions.invoke('nylas-auth', {
          body: {
            action: 'exchange_code',
            code: code,
            user_id: user.id,
            org_id: user.org_id
          }
        })

        if (exchangeError) {
          console.error('Error intercambiando código:', exchangeError)
          setStatus('error')
          setMessage('Error al intercambiar código de autorización')
          
          setTimeout(() => {
            navigate('/emails/dashboard?error=exchange_failed')
          }, 3000)
          return
        }

        if (data?.success) {
          console.log('Autenticación exitosa:', data)
          setStatus('success')
          setMessage(`¡Conexión establecida exitosamente! Email: ${data.email}`)
          
          // Redirigir con éxito después de 2 segundos
          setTimeout(() => {
            navigate('/emails/dashboard?auth=success')
          }, 2000)
        } else {
          throw new Error('Respuesta inesperada del servidor')
        }

      } catch (error) {
        console.error('Error procesando callback:', error)
        setStatus('error')
        setMessage('Error procesando la respuesta de autenticación')
        
        setTimeout(() => {
          navigate('/emails/dashboard?error=callback_failed')
        }, 3000)
      }
    }

    handleCallback()
  }, [searchParams, navigate, user])

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-600" />
      case 'error':
        return <AlertTriangle className="h-8 w-8 text-red-600" />
    }
  }

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Procesando Autenticación...'
      case 'success':
        return 'Autenticación Exitosa'
      case 'error':
        return 'Error de Autenticación'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md border-0.5 border-black rounded-[10px] shadow-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-xl font-semibold">
            {getStatusTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            {message}
          </p>
          {status === 'loading' && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Configurando conexión con Gmail...</span>
            </div>
          )}
          {status === 'success' && (
            <div className="text-sm text-gray-500">
              Redirigiendo al dashboard...
            </div>
          )}
          {status === 'error' && (
            <div className="text-sm text-gray-500">
              Redirigiendo en unos segundos...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
