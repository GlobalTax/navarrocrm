
import React, { useState, useEffect } from 'react'
import { usePWA } from '@/hooks/usePWA'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Smartphone, 
  Info, 
  Database, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react'

export const PWAInfoPanel: React.FC = () => {
  const {
    isInstalled,
    isOnline,
    isInstallable,
    getDeviceInfo,
    getAppInfo,
    clearCache,
    getCacheStats,
    checkConnectivity
  } = usePWA()

  const [cacheStats, setCacheStats] = useState<any[]>([])
  const [deviceInfo, setDeviceInfo] = useState<any>(null)
  const [appInfo, setAppInfo] = useState<any>(null)
  const [connectivity, setConnectivity] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadInfo = async () => {
      setIsLoading(true)
      try {
        setDeviceInfo(getDeviceInfo())
        setAppInfo(getAppInfo())
        
        const stats = await getCacheStats()
        setCacheStats(stats)
        
        const online = await checkConnectivity()
        setConnectivity(online)
      } catch (error) {
        console.error('Error loading PWA info:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInfo()
  }, [getDeviceInfo, getAppInfo, getCacheStats, checkConnectivity])

  const handleClearCache = async () => {
    try {
      const success = await clearCache()
      if (success) {
        const stats = await getCacheStats()
        setCacheStats(stats)
      }
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  }

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-600" />
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-gray-600">Cargando información...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estado General de PWA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Estado de la PWA
          </CardTitle>
          <CardDescription>
            Información general sobre el estado de la aplicación web progresiva
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="flex items-center gap-2">
                {getStatusIcon(isInstalled)}
                <span className="font-medium">Aplicación instalada</span>
              </span>
              <Badge variant={isInstalled ? 'default' : 'secondary'}>
                {isInstalled ? 'Sí' : 'No'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="flex items-center gap-2">
                {getStatusIcon(isInstallable)}
                <span className="font-medium">Instalable</span>
              </span>
              <Badge variant={isInstallable ? 'default' : 'secondary'}>
                {isInstallable ? 'Sí' : 'No'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="flex items-center gap-2">
                {isOnline ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-red-600" />}
                <span className="font-medium">Estado de conexión</span>
              </span>
              <Badge variant={isOnline ? 'default' : 'destructive'}>
                {isOnline ? 'En línea' : 'Offline'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="flex items-center gap-2">
                {getStatusIcon(connectivity !== false)}
                <span className="font-medium">Servidor</span>
              </span>
              <Badge variant={connectivity ? 'default' : 'destructive'}>
                {connectivity === null ? 'Verificando...' : connectivity ? 'Conectado' : 'Error'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información de la Aplicación */}
      {appInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Información de la Aplicación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Nombre</label>
                <p className="text-sm bg-gray-50 p-2 rounded">{appInfo.name}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Versión</label>
                <p className="text-sm bg-gray-50 p-2 rounded">{appInfo.version}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Build</label>
                <p className="text-sm bg-gray-50 p-2 rounded">{appInfo.build}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Entorno</label>
                <p className="text-sm bg-gray-50 p-2 rounded">{appInfo.environment}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex flex-wrap gap-2">
              <Badge variant={appInfo.isPWA ? 'default' : 'secondary'}>
                {appInfo.isPWA ? 'Es PWA' : 'No es PWA'}
              </Badge>
              <Badge variant={appInfo.isStandalone ? 'default' : 'secondary'}>
                {appInfo.isStandalone ? 'Modo Standalone' : 'En navegador'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información del Dispositivo */}
      {deviceInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Información del Dispositivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Plataforma</label>
                <p className="text-sm bg-gray-50 p-2 rounded">{deviceInfo.platform}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Idioma</label>
                <p className="text-sm bg-gray-50 p-2 rounded">{deviceInfo.language}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Memoria del dispositivo</label>
                <p className="text-sm bg-gray-50 p-2 rounded">
                  {deviceInfo.deviceMemory ? `${deviceInfo.deviceMemory} GB` : 'No disponible'}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Núcleos de CPU</label>
                <p className="text-sm bg-gray-50 p-2 rounded">{deviceInfo.hardwareConcurrency}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Puntos táctiles</label>
                <p className="text-sm bg-gray-50 p-2 rounded">{deviceInfo.maxTouchPoints}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Tipo de dispositivo</label>
                <Badge variant={deviceInfo.isMobile ? 'default' : 'secondary'}>
                  {deviceInfo.isMobile ? 'Dispositivo móvil' : 'Escritorio'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas de Cache */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Cache y Almacenamiento
          </CardTitle>
          <CardDescription>
            Gestión del almacenamiento en cache de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cacheStats.length > 0 ? (
            <div className="space-y-3">
              {cacheStats.map((cache, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Database className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">{cache.name}</p>
                      <p className="text-xs text-gray-600">
                        {cache.size} elementos almacenados
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {cache.size}
                  </Badge>
                </div>
              ))}
              <Separator />
              <Button 
                variant="outline" 
                onClick={handleClearCache}
                className="w-full"
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar Todo el Cache
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600">No hay datos de cache disponibles</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
