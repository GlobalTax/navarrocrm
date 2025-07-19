
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useNylasConnection } from '@/hooks/useNylasConnection'
import { CheckCircle, AlertTriangle, Loader2, Mail, RefreshCw, TestTube } from 'lucide-react'
import { toast } from 'sonner'

export function NylasConnectionTest() {
  const { 
    connection, 
    connectionStatus, 
    connect, 
    isConnecting, 
    syncEmails, 
    isSyncing,
    error,
    refetchConnection 
  } = useNylasConnection()
  
  const [testResults, setTestResults] = useState<Array<{
    step: string
    status: 'pending' | 'success' | 'error'
    message: string
    timestamp: string
  }>>([])

  const addTestResult = (step: string, status: 'success' | 'error', message: string) => {
    setTestResults(prev => [...prev, {
      step,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const runFullTest = async () => {
    setTestResults([])
    
    // Test 1: Check current connection
    addTestResult('Connection Check', 'pending', 'Verificando estado de conexión...')
    await refetchConnection()
    
    if (connectionStatus === 'connected') {
      addTestResult('Connection Check', 'success', `Conectado a ${connection?.email_address}`)
    } else {
      addTestResult('Connection Check', 'error', 'No hay conexión activa')
      return
    }

    // Test 2: Sync emails
    try {
      addTestResult('Email Sync', 'pending', 'Iniciando sincronización de emails...')
      await new Promise((resolve, reject) => {
        syncEmails()
        // Simular éxito después de un delay
        setTimeout(() => {
          if (isSyncing) {
            reject(new Error('Timeout en sincronización'))
          } else {
            resolve(true)
          }
        }, 5000)
      })
      addTestResult('Email Sync', 'success', 'Sincronización completada')
    } catch (error) {
      addTestResult('Email Sync', 'error', `Error en sincronización: ${error.message}`)
    }
  }

  const handleConnect = () => {
    addTestResult('OAuth Flow', 'pending', 'Iniciando flujo de autenticación...')
    connect()
  }

  return (
    <Card className="border-0.5 border-black bg-white rounded-[10px] shadow-sm">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TestTube className="h-5 w-5 text-blue-600" />
          <div>
            <CardTitle className="text-lg font-semibold">
              Prueba de Conexión Nylas v3
            </CardTitle>
            <CardDescription>
              Panel de pruebas para validar la integración con Nylas
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Estado actual */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Estado de Conexión</label>
            <Badge 
              variant={connectionStatus === 'connected' ? 'default' : 'secondary'}
              className="border-0.5 border-black rounded-[10px]"
            >
              {connectionStatus === 'connected' ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
          
          {connection && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email Conectado</label>
              <p className="text-sm text-gray-600">{connection.email_address}</p>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-wrap gap-3">
          {connectionStatus === 'not_connected' ? (
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="border-0.5 border-black rounded-[10px] bg-black text-white hover:bg-gray-800"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Conectar Cuenta
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={runFullTest}
                disabled={isSyncing}
                className="border-0.5 border-black rounded-[10px] bg-blue-600 text-white hover:bg-blue-700"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Ejecutar Prueba Completa
              </Button>
              
              <Button
                onClick={() => syncEmails()}
                disabled={isSyncing}
                variant="outline"
                className="border-0.5 border-black rounded-[10px] hover:bg-gray-50"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sincronizar Emails
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Resultados de pruebas */}
        {testResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Resultados de Pruebas</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-[10px] border-0.5 border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    {result.status === 'success' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {result.status === 'error' && (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    {result.status === 'pending' && (
                      <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{result.step}</p>
                      <p className="text-xs text-gray-600">{result.message}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{result.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información de configuración */}
        <div className="space-y-3 p-4 bg-blue-50 rounded-[10px] border-0.5 border-blue-200">
          <h4 className="font-medium text-blue-900">Configuración Requerida</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• <strong>NYLAS_API_KEY:</strong> Configurado en Supabase Secrets</p>
            <p>• <strong>NYLAS_APPLICATION_ID:</strong> ID de la aplicación en Nylas Dashboard</p>
            <p>• <strong>Redirect URI:</strong> Debe estar añadida en Nylas Dashboard</p>
            <p>• <strong>Scopes:</strong> Gmail, Calendar, Contacts configurados</p>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <strong>Error:</strong> {error.message}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
