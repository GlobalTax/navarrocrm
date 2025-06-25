
import React from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePWA } from '@/hooks/usePWA'
import { Download, Smartphone, Zap, Wifi, Bell, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const PWAInstallButton = () => {
  const { 
    isInstallable, 
    isInstalled, 
    isOnline, 
    installPWA,
    isUpdateAvailable,
    isUpdateReady,
    updatePWA
  } = usePWA()

  // Si hay actualización disponible, mostrar botón de actualización
  if (isUpdateAvailable || isUpdateReady) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={updatePWA}
        className="relative"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        {isUpdateReady ? 'Actualizar' : 'Actualizando...'}
        <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-800">
          Nueva versión
        </Badge>
      </Button>
    )
  }

  // Si ya está instalada, no mostrar nada
  if (isInstalled || !isInstallable) {
    return null
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Download className="h-4 w-4 mr-2" />
          Instalar App
          <Badge variant="secondary" className="ml-2 text-xs">
            PWA
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Instalar CRM Asesoría
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">¿Por qué instalar la app?</CardTitle>
              <CardDescription>
                Obtén una experiencia nativa con funciones avanzadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Acceso instantáneo</p>
                  <p className="text-sm text-muted-foreground">
                    Abre la app directamente desde tu escritorio
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Wifi className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Funciona offline</p>
                  <p className="text-sm text-muted-foreground">
                    Accede a tus datos sin conexión a internet
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Bell className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Notificaciones push</p>
                  <p className="text-sm text-muted-foreground">
                    Recibe alertas importantes al instante
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-muted-foreground">
                {isOnline ? 'En línea' : 'Sin conexión'}
              </span>
            </div>
            
            <Button onClick={installPWA} className="w-full ml-4">
              <Download className="h-4 w-4 mr-2" />
              Instalar Ahora
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
