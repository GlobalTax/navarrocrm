
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

  const addTestResult = (step: string, status: 'pending' | 'success' | 'error', message: string) => {
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
      await new Promise<void>((resolve, reject) => {
        syncEmails()
        // Simular verificación después de un delay
        setTimeout(() => {
          if (isSyncing) {
            reject(new Error('Timeout en sincronización'))
          } else {
            resolve()
          }
        }, 5000)
      })
      addTestResult('Email Sync', 'success', 'Sincronización completada')
    } catch (error) {
      addTestResult('Email Sync', 'error', `Error en sincronización: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleConnect = () => {
    addTestResult('OAuth Flow', 'pending', 'Iniciando flujo de autenticación...')
    connect()
  }

  const runConfigurationTest = async () => {
    setTestResults([])
    
    // Test configuration
    addTestResult('Configuration Check', 'pending', 'Verificando configuración de Nylas...')
    
    try {
      const response = await fetch('/api/nylas/config-check', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const config = await response.json()
        addTestResult('Configuration Check', 'success', 
          `Configuración OK - API Key: ${config.hasApiKey ? '✓' : '✗'}, App ID: ${config.hasAppId ? '✓' : '✗'}`)
      } else {
        addTestResult('Configuration Check', 'error', 'Error verificando configuración')
      }
    } catch (error) {
      addTestResult('Configuration Check', 'error', 'No se pudo verificar la configuración')
    }
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
              Panel de pruebas para validar la integración con Nylas API v3
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
          <Button
            onClick={runConfigurationTest}
            variant="outline"
            className="border-0.5 border-black rounded-[10px] hover:bg-gray-50"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Verificar Configuración
          </Button>

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
                Prueba Completa
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

        {/* Información de configuración mejorada */}
        <div className="space-y-3 p-4 bg-blue-50 rounded-[10px] border-0.5 border-blue-200">
          <h4 className="font-medium text-blue-900">Configuración Requerida</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• <strong>NYLAS_API_KEY:</strong> Tu API key de Nylas (configurado en Supabase Secrets)</p>
            <p>• <strong>NYLAS_APPLICATION_ID:</strong> ID de tu aplicación en Nylas Dashboard</p>
            <p>• <strong>NYLAS_API_URI:</strong> https://api.us.nylas.com (o .eu según tu región)</p>
            <p>• <strong>Redirect URI:</strong> Debe estar configurada en Nylas Dashboard</p>
            <p>• <strong>Scopes requeridos:</strong> Gmail (lectura/escritura), Calendar, Contacts</p>
          </div>
          <div className="mt-3 p-2 bg-blue-100 rounded border">
            <p className="text-xs text-blue-700">
              <strong>Nota:</strong> La Redirect URI actual es: <code className="bg-white px-1 rounded">{window.location.origin}/nylas/callback</code>
            </p>
          </div>
        </div>

        {/* Guía de configuración paso a paso */}
        <div className="space-y-3 p-4 bg-amber-50 rounded-[10px] border-0.5 border-amber-200">
          <h4 className="font-medium text-amber-900">Pasos de Configuración</h4>
          <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
            <li>Ve al <a href="https://dashboard.nylas.com" target="_blank" rel="noopener noreferrer" className="underline">Dashboard de Nylas</a></li>
            <li>Selecciona tu aplicación o crea una nueva</li>
            <li>En "Hosted Authentication" → "Callback URIs", añade: <code className="bg-white px-1 rounded">{window.location.origin}/nylas/callback</code></li>
            <li>Copia tu Application ID y configúralo en Supabase Secrets como NYLAS_APPLICATION_ID</li>
            <li>Copia tu API Key y configúralo en Supabase Secrets como NYLAS_API_KEY</li>
          </ol>
        </div>

        {/* Error display mejorado */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <strong>Error:</strong> {error.message}
              {error.message.includes('redirect_uri') && (
                <div className="mt-2 text-xs">
                  <p>Posible solución: Verifica que la redirect URI esté configurada en el Dashboard de Nylas.</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
