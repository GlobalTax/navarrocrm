
import React, { useState, useEffect } from 'react'
import { usePWA } from '@/hooks/usePWA'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Download, Smartphone, Wifi, WifiOff, RefreshCw, Settings } from 'lucide-react'

interface PWAInstallPromptProps {
  onClose?: () => void
  showOfflineStatus?: boolean
  showUpdatePrompt?: boolean
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  onClose,
  showOfflineStatus = true,
  showUpdatePrompt = true
}) => {
  const {
    isInstalled,
    isInstallable,
    isOnline,
    isUpdateAvailable,
    isUpdateReady,
    installPWA,
    updatePWA,
    syncData,
    getDeviceInfo,
    getAppInfo
  } = usePWA()

  const [isVisible, setIsVisible] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<any>(null)
  const [appInfo, setAppInfo] = useState<any>(null)

  useEffect(() => {
    setDeviceInfo(getDeviceInfo())
    setAppInfo(getAppInfo())
  }, [getDeviceInfo, getAppInfo])

  useEffect(() => {
    // Mostrar prompt si es instalable y no está instalado
    if (isInstallable && !isInstalled) {
      setIsVisible(true)
    }
  }, [isInstallable, isInstalled])

  const handleInstall = async () => {
    const success = await installPWA()
    if (success) {
      setIsVisible(false)
      onClose?.()
    }
  }

  const handleUpdate = async () => {
    await updatePWA()
  }

  const handleSync = async () => {
    await syncData()
  }

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  // No mostrar si ya está instalado
  if (isInstalled && !isUpdateAvailable) {
    return null
  }

  return (
    <>
      {/* Prompt de instalación */}
      {isVisible && isInstallable && !isInstalled && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <Card className="shadow-lg border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Instalar App</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Instala CRM Asesoría en tu dispositivo para acceso rápido y funcionalidad offline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Download className="h-4 w-4" />
                  <span>Acceso rápido desde el escritorio</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <WifiOff className="h-4 w-4" />
                  <span>Funciona sin conexión</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Settings className="h-4 w-4" />
                  <span>Actualizaciones automáticas</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleInstall} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Instalar
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Más tarde
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Prompt de actualización */}
      {showUpdatePrompt && (isUpdateAvailable || isUpdateReady) && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <Card className="shadow-lg border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">
                    {isUpdateReady ? 'Actualización lista' : 'Nueva versión disponible'}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                {isUpdateReady 
                  ? 'La nueva versión está lista para instalar' 
                  : 'Hay una nueva versión de la aplicación disponible'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Button onClick={handleUpdate} className="flex-1" disabled={!isUpdateReady}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {isUpdateReady ? 'Actualizar' : 'Descargando...'}
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Más tarde
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Indicador de estado offline */}
      {showOfflineStatus && !isOnline && (
        <div className="fixed top-4 right-4 z-40">
          <Card className="shadow-lg border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <WifiOff className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">
                  Modo offline
                </span>
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                  Sin conexión
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Indicador de conexión con sync */}
      {showOfflineStatus && isOnline && (
        <div className="fixed top-4 right-4 z-40">
          <Card className="shadow-lg border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Conectado
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSync}
                  className="h-6 w-6 p-0 hover:bg-green-100"
                >
                  <RefreshCw className="h-3 w-3 text-green-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
