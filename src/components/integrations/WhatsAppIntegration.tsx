
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { 
  MessageCircle, 
  Phone, 
  Settings, 
  Send, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Users
} from 'lucide-react'

export function WhatsAppIntegration() {
  const [isConnected, setIsConnected] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [testMessage, setTestMessage] = useState('')
  const [autoReminders, setAutoReminders] = useState(true)
  const [appointmentConfirms, setAppointmentConfirms] = useState(true)

  const connectionStatus = isConnected ? 'connected' : 'disconnected'

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      default:
        return 'bg-red-50 text-red-700 border-red-200'
    }
  }

  const handleConnect = () => {
    // Aquí iría la lógica de conexión con WhatsApp Business API
    console.log('Conectando con WhatsApp Business API...')
    setIsConnected(true)
  }

  const handleSendTest = () => {
    // Lógica para enviar mensaje de prueba
    console.log('Enviando mensaje de prueba:', testMessage)
  }

  return (
    <div className="space-y-6">
      {/* Estado de Conexión */}
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">WhatsApp Business API</CardTitle>
                <p className="text-sm text-gray-600">Comunicación directa con clientes</p>
              </div>
            </div>
            <Badge className={`${getStatusColor()} text-xs font-medium border flex items-center gap-1`}>
              {getStatusIcon()}
              {isConnected ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Configuración Inicial</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Para usar WhatsApp Business API necesitas configurar tu número empresarial
                </p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="phone">Número de WhatsApp Business</Label>
                    <Input
                      id="phone"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+34 600 000 000"
                      className="border-0.5 border-black rounded-[10px]"
                    />
                  </div>
                  <Button onClick={handleConnect} className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Conectar WhatsApp Business
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="settings" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </TabsTrigger>
                <TabsTrigger value="templates">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Plantillas
                </TabsTrigger>
                <TabsTrigger value="test">
                  <Send className="h-4 w-4 mr-2" />
                  Pruebas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="settings" className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium">Recordatorios Automáticos</h4>
                      <p className="text-sm text-gray-600">Enviar recordatorios de citas y vencimientos</p>
                    </div>
                    <Switch
                      checked={autoReminders}
                      onCheckedChange={setAutoReminders}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium">Confirmaciones de Cita</h4>
                      <p className="text-sm text-gray-600">Solicitar confirmación de asistencia</p>
                    </div>
                    <Switch
                      checked={appointmentConfirms}
                      onCheckedChange={setAppointmentConfirms}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="templates" className="space-y-4">
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium">Recordatorio de Cita</h4>
                    </div>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      "Hola {'{nombre}'}, te recordamos tu cita para el {'{fecha}'} a las {'{hora}'}. 
                      Por favor confirma tu asistencia respondiendo SÍ o NO."
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <h4 className="font-medium">Vencimiento Legal</h4>
                    </div>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      "Estimado/a {'{nombre}'}, te informamos que el plazo para {'{tramite}'} 
                      vence el {'{fecha}'}. Contacta con nosotros si necesitas ayuda."
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <h4 className="font-medium">Estado de Expediente</h4>
                    </div>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      "Tu expediente {'{numero}'} ha sido actualizado. 
                      Estado actual: {'{estado}'}. Puedes consultarlo en tu portal de cliente."
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="test" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="test-message">Mensaje de Prueba</Label>
                    <Textarea
                      id="test-message"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      placeholder="Escribe un mensaje de prueba..."
                      className="border-0.5 border-black rounded-[10px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="test-phone">Número de Destino</Label>
                    <Input
                      id="test-phone"
                      placeholder="+34 600 000 000"
                      className="border-0.5 border-black rounded-[10px]"
                    />
                  </div>
                  <Button onClick={handleSendTest} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Mensaje de Prueba
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas */}
      {isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0.5 border-black rounded-[10px]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Send className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">247</p>
                  <p className="text-sm text-gray-600">Mensajes Enviados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0.5 border-black rounded-[10px]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">89%</p>
                  <p className="text-sm text-gray-600">Tasa de Entrega</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0.5 border-black rounded-[10px]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-sm text-gray-600">Respuestas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
