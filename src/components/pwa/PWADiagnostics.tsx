
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { usePWA } from '@/hooks/usePWA'
import { 
  Smartphone, 
  Wifi, 
  Database, 
  Info, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export const PWADiagnostics = () => {
  const { 
    getDeviceInfo, 
    getAppInfo, 
    getCacheStats, 
    clearCache,
    isOnline,
    isInstalled,
    checkConnectivity
  } = usePWA()
  
  const [deviceInfo, setDeviceInfo] = useState<any>(null)
  const [appInfo, setAppInfo] = useState<any>(null)
  const [cacheStats, setCacheStats] = useState<any[]>([])
  const [connectivity, setConnectivity] = useState<boolean | null>(null)

  useEffect(() => {
    const loadDiagnostics = async () => {
      setDeviceInfo(getDeviceInfo())
      setAppInfo(getAppInfo())
      
      const stats = await getCacheStats()
      setCacheStats(stats)
      
      const online = await checkConnectivity()
      setConnectivity(online)
    }

    loadDiagnostics()
  }, [getDeviceInfo, getAppInfo, getCacheStats, checkConnectivity])

  const handleClearCache = async () => {
    const success = await clearCache()
    if (success) {
      const stats = await getCacheStats()
      setCacheStats(stats)
    }
  }

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-600" />
    )
  }

  return (
    <div className="space-y-6">
      {/* Estado General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Estado de la PWA
          </CardTitle>
          <CardDescription>
            Información general sobre el estado de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {getStatusIcon(isInstalled)}
              Aplicación instalada
            </span>
            <Badge variant={isInstalled ? 'default' : 'secondary'}>
              {isInstalled ? 'Sí' : 'No'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {getStatusIcon(isOnline)}
              Conectividad
            </span>
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {isOnline ? 'En línea' : 'Offline'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {getStatusIcon(connectivity !== false)}
              Conectividad del servidor
            </span>
            <Badge variant={connectivity ? 'default' : 'destructive'}>
              {connectivity === null ? 'Verificando...' : connectivity ? 'OK' : 'Error'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Información del Dispositivo */}
      {deviceInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Información del Dispositivo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Plataforma:</span>
                <p className="text-muted-foreground">{deviceInfo.platform}</p>
              </div>
              <div>
                <span className="font-medium">Idioma:</span>
                <p className="text-muted-foreground">{deviceInfo.language}</p>
              </div>
              <div>
                <span className="font-medium">Memoria del dispositivo:</span>
                <p className="text-muted-foreground">
                  {deviceInfo.deviceMemory ? `${deviceInfo.deviceMemory} GB` : 'No disponible'}
                </p>
              </div>
              <div>
                <span className="font-medium">Núcleos de CPU:</span>
                <p className="text-muted-foreground">{deviceInfo.hardwareConcurrency}</p>
              </div>
              <div>
                <span className="font-medium">Puntos táctiles:</span>
                <p className="text-muted-foreground">{deviceInfo.maxTouchPoints}</p>
              </div>
              <div>
                <span className="font-medium">Dispositivo móvil:</span>
                <p className="text-muted-foreground">{deviceInfo.isMobile ? 'Sí' : 'No'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información de la App */}
      {appInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Información de la Aplicación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Nombre:</span>
                <p className="text-muted-foreground">{appInfo.name}</p>
              </div>
              <div>
                <span className="font-medium">Versión:</span>
                <p className="text-muted-foreground">{appInfo.version}</p>
              </div>
              <div>
                <span className="font-medium">Build:</span>
                <p className="text-muted-foreground">{appInfo.build}</p>
              </div>
              <div>
                <span className="font-medium">Entorno:</span>
                <p className="text-muted-foreground">{appInfo.environment}</p>
              </div>
              <div>
                <span className="font-medium">Modo standalone:</span>
                <p className="text-muted-foreground">{appInfo.isStandalone ? 'Sí' : 'No'}</p>
              </div>
              <div>
                <span className="font-medium">Es PWA:</span>
                <p className="text-muted-foreground">{appInfo.isPWA ? 'Sí' : 'No'}</p>
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
            Estadísticas de Cache
          </CardTitle>
          <CardDescription>
            Información sobre el almacenamiento en cache de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cacheStats.length > 0 ? (
            <div className="space-y-3">
              {cacheStats.map((cache, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{cache.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {cache.size} elementos almacenados
                    </p>
                  </div>
                  <Badge variant="outline">
                    {cache.size}
                  </Badge>
                </div>
              ))}
              <Separator />
              <Button 
                variant="outline" 
                onClick={handleClearCache}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar Cache
              </Button>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No hay datos de cache disponibles
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
