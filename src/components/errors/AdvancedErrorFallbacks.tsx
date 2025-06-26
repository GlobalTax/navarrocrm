
import React from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGlobalStateContext } from '@/contexts/GlobalStateContext'
import { useApp } from '@/contexts/AppContext'
import { useErrorService } from '@/services/errorService'
import { AlertTriangle, Wifi, Shield, Database, RefreshCw, Home } from 'lucide-react'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
  componentStack?: string
}

interface NetworkErrorFallbackProps {
  error: Error
  retry: () => void
}

interface AuthErrorFallbackProps {
  error: Error
  onLogin: () => void
}

interface DataLoadErrorFallbackProps {
  error: Error
  retry: () => void
  entity?: string
}

interface PermissionErrorFallbackProps {
  error: Error
}

// Error genérico con información detallada y logging integrado
export const GenericErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary,
  componentStack 
}) => {
  const { addNotification } = useGlobalStateContext()
  const { user } = useApp()
  const { reportError } = useErrorService()

  const handleReportError = () => {
    const context = {
      user: user?.email,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    }

    // Usar el servicio de errores existente
    reportError(error, { componentStack }, context)
    
    addNotification({
      type: 'info',
      title: 'Error Reportado',
      message: 'El error ha sido reportado al equipo de desarrollo',
      autoClose: true,
      duration: 3000
    })
  }

  const handleRetry = () => {
    resetErrorBoundary()
    addNotification({
      type: 'info',
      title: 'Reintentando',
      message: 'Intentando recuperar la aplicación...',
      autoClose: true,
      duration: 2000
    })
  }

  const errorId = `${error.name}-${Date.now()}`

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-600">
            Error Inesperado
          </CardTitle>
          <CardDescription>
            Ha ocurrido un error en la aplicación. Nuestro equipo ha sido notificado.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTitle>Detalles del Error</AlertTitle>
            <AlertDescription className="font-mono text-sm">
              {error.message}
            </AlertDescription>
          </Alert>

          {process.env.NODE_ENV === 'development' && (
            <details className="bg-gray-100 p-4 rounded-lg">
              <summary className="cursor-pointer font-medium mb-2">
                Stack Trace (Solo Desarrollo)
              </summary>
              <pre className="text-xs overflow-auto max-h-40">
                {error.stack}
                {componentStack && (
                  <>
                    {'\n\nComponent Stack:'}
                    {componentStack}
                  </>
                )}
              </pre>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleRetry} variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
            <Button onClick={handleReportError} variant="outline">
              Reportar Error
            </Button>
            <Button 
              onClick={() => window.location.href = '/dashboard'} 
              variant="ghost"
            >
              <Home className="mr-2 h-4 w-4" />
              Ir al Dashboard
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500 mt-4">
            <p>Si el problema persiste, contacta al soporte técnico</p>
            <p className="mt-1">ID de Error: {errorId}</p>
            <a 
              href="mailto:soporte@crmasesoria.com" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              soporte@crmasesoria.com
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Error específico para problemas de red con verificación mejorada
export const NetworkErrorFallback: React.FC<NetworkErrorFallbackProps> = ({ 
  error, 
  retry 
}) => {
  const { addNotification } = useGlobalStateContext()

  const handleRetry = () => {
    retry()
    addNotification({
      type: 'info',
      title: 'Reintentando Conexión',
      message: 'Verificando conectividad...',
      autoClose: true,
      duration: 2000
    })
  }

  const checkConnectivity = async () => {
    try {
      // Verificar conectividad básica
      const response = await fetch(window.location.origin, { 
        method: 'HEAD',
        cache: 'no-cache'
      })
      
      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Conexión Restaurada',
          message: 'La conectividad ha sido restaurada',
          autoClose: true,
          duration: 3000
        })
        retry()
      } else {
        throw new Error('Server not responding')
      }
    } catch {
      addNotification({
        type: 'error',
        title: 'Sin Conexión',
        message: 'Verifica tu conexión a internet',
        autoClose: true,
        duration: 5000
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Wifi className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-xl text-orange-600">
            Error de Conexión
          </CardTitle>
          <CardDescription>
            No se pudo conectar con el servidor
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              {error.message.includes('fetch') || error.message.includes('network')
                ? 'Verifica tu conexión a internet'
                : 'El servidor no está respondiendo'
              }
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-3">
            <Button onClick={handleRetry} variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
            <Button onClick={checkConnectivity} variant="outline">
              Verificar Conexión
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Si el problema persiste, verifica:</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• Tu conexión a internet</li>
              <li>• El estado del servidor</li>
              <li>• Tu configuración de red</li>
              <li>• Si hay trabajos de mantenimiento</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Error específico para problemas de autenticación
export const AuthErrorFallback: React.FC<AuthErrorFallbackProps> = ({ 
  error, 
  onLogin 
}) => {
  const { addNotification } = useGlobalStateContext()

  const handleLogin = () => {
    onLogin()
    addNotification({
      type: 'info',
      title: 'Redirigiendo',
      message: 'Redirigiendo al login...',
      autoClose: true,
      duration: 2000
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl text-blue-600">
            Sesión Expirada
          </CardTitle>
          <CardDescription>
            Tu sesión ha expirado. Por favor, inicia sesión nuevamente.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              {error.message.includes('unauthorized') || error.message.includes('401')
                ? 'No tienes permisos para acceder a este recurso'
                : 'Tu sesión ha expirado por inactividad'
              }
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-3">
            <Button onClick={handleLogin} variant="default">
              Iniciar Sesión
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="ghost"
            >
              Recargar Página
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Si el problema persiste, contacta al administrador</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Error específico para problemas de permisos
export const PermissionErrorFallback: React.FC<PermissionErrorFallbackProps> = ({ error }) => {
  const { addNotification } = useGlobalStateContext()
  const { user } = useApp()

  const handleContactAdmin = () => {
    // En una implementación real, esto enviaría un email o ticket
    const adminContact = {
      userEmail: user?.email,
      requestedResource: window.location.pathname,
      errorMessage: error.message,
      timestamp: new Date().toISOString()
    }
    
    console.log('Permission request:', adminContact)
    
    addNotification({
      type: 'info',
      title: 'Solicitud Enviada',
      message: 'Se ha enviado una solicitud de permisos al administrador',
      autoClose: true,
      duration: 3000
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <Shield className="h-6 w-6 text-purple-600" />
          </div>
          <CardTitle className="text-xl text-purple-600">
            Permisos Insuficientes
          </CardTitle>
          <CardDescription>
            No tienes permisos para acceder a esta funcionalidad
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              {error.message || 'Contacta al administrador para solicitar permisos adicionales'}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-3">
            <Button onClick={handleContactAdmin} variant="default">
              Solicitar Permisos
            </Button>
            <Button 
              onClick={() => window.history.back()} 
              variant="outline"
            >
              Volver
            </Button>
            <Button 
              onClick={() => window.location.href = '/dashboard'} 
              variant="ghost"
            >
              <Home className="mr-2 h-4 w-4" />
              Ir al Dashboard
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Si crees que esto es un error, contacta al soporte</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Error específico para problemas de carga de datos
export const DataLoadErrorFallback: React.FC<DataLoadErrorFallbackProps> = ({ 
  error, 
  retry, 
  entity = 'datos' 
}) => {
  const { addNotification } = useGlobalStateContext()

  const handleRetry = () => {
    retry()
    addNotification({
      type: 'info',
      title: 'Cargando Datos',
      message: `Recargando ${entity}...`,
      autoClose: true,
      duration: 2000
    })
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 min-h-[400px]">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
        <Database className="h-6 w-6 text-red-600" />
      </div>
      
      <Alert variant="destructive" className="max-w-md">
        <AlertTitle>Error al Cargar {entity}</AlertTitle>
        <AlertDescription>
          {error.message || `No se pudieron cargar los ${entity}`}
        </AlertDescription>
      </Alert>

      <div className="flex gap-3">
        <Button onClick={handleRetry} variant="default">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
        <Button 
          onClick={() => window.location.reload()} 
          variant="ghost"
        >
          Recargar Página
        </Button>
      </div>

      <div className="text-center text-sm text-gray-500 max-w-md">
        <p>Si el problema persiste, puede ser debido a:</p>
        <ul className="mt-2 space-y-1">
          <li>• Problemas temporales del servidor</li>
          <li>• Conexión inestable</li>
          <li>• Mantenimiento programado</li>
        </ul>
      </div>
    </div>
  )
}
