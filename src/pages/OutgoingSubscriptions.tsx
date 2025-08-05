import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, CreditCard, TrendingDown, AlertTriangle } from 'lucide-react'

const OutgoingSubscriptions = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suscripciones Pagadas</h1>
          <p className="text-gray-600">Gestiona las suscripciones y servicios que pagas</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Agregar Suscripción
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suscripciones Activas</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Servicios contratados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Mensual</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€1,450</div>
            <p className="text-xs text-muted-foreground">-€50 vs mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Pagos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€580</div>
            <p className="text-xs text-muted-foreground">En los próximos 7 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Anual</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€17,400</div>
            <p className="text-xs text-muted-foreground">Proyección actual</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suscripciones Actuales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Microsoft 365 Business</h3>
                <p className="text-sm text-gray-600">Software • €15/usuario/mes</p>
                <p className="text-xs text-gray-500">Próximo pago: 15 Ene 2025</p>
              </div>
              <Badge variant="secondary">Activa</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Adobe Creative Suite</h3>
                <p className="text-sm text-gray-600">Software • €59/mes</p>
                <p className="text-xs text-gray-500">Próximo pago: 20 Ene 2025</p>
              </div>
              <Badge variant="secondary">Activa</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Servidor Cloud AWS</h3>
                <p className="text-sm text-gray-600">Infraestructura • €120/mes</p>
                <p className="text-xs text-gray-500">Próximo pago: 1 Feb 2025</p>
              </div>
              <Badge variant="secondary">Activa</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Legal Database Pro</h3>
                <p className="text-sm text-gray-600">Base de datos • €299/mes</p>
                <p className="text-xs text-gray-500">Próximo pago: 5 Feb 2025</p>
              </div>
              <Badge variant="destructive">Vence pronto</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OutgoingSubscriptions