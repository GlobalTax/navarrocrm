import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, Clock, TrendingUp } from 'lucide-react'

const TimeTracking = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-gray-600">Registra y gestiona el tiempo dedicado a cada caso</p>
        </div>
        <Button className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          Iniciar Timer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Hoy</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6.5h</div>
            <p className="text-xs text-muted-foreground">Meta: 8h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Facturables</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.2h</div>
            <p className="text-xs text-muted-foreground">80% del tiempo total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32h</div>
            <p className="text-xs text-muted-foreground">+4h vs semana anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timer Activo</CardTitle>
            <Pause className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1:23:45</div>
            <p className="text-xs text-muted-foreground">Caso: Empresa ABC</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entradas de Tiempo Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Revisión de contratos</h3>
                <p className="text-sm text-gray-600">Empresa ABC • 2:30h</p>
              </div>
              <Badge variant="secondary">Facturable</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Reunión con cliente</h3>
                <p className="text-sm text-gray-600">Consultoría XYZ • 1:15h</p>
              </div>
              <Badge variant="secondary">Facturable</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Administración general</h3>
                <p className="text-sm text-gray-600">Interno • 0:45h</p>
              </div>
              <Badge variant="outline">No facturable</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TimeTracking