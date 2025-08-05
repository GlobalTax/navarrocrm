import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar as CalendarIcon, Clock, Users } from 'lucide-react'

const Calendar = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
          <p className="text-gray-600">Gestiona citas, reuniones y eventos importantes</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Cita
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
            <CalendarIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">2 reuniones, 2 llamadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">+3 más que la anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próxima Cita</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15:30</div>
            <p className="text-xs text-muted-foreground">Reunión con cliente</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Vista Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Vista de calendario</p>
                  <p className="text-sm text-gray-400">Integración de calendario próximamente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Próximas Citas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                  <p className="font-medium">Consulta legal</p>
                  <p className="text-sm text-gray-600">Empresa ABC</p>
                  <p className="text-xs text-gray-500">Hoy 15:30 - 16:30</p>
                </div>
                <div className="p-3 border-l-4 border-green-500 bg-green-50">
                  <p className="font-medium">Reunión de seguimiento</p>
                  <p className="text-sm text-gray-600">Consultoría XYZ</p>
                  <p className="text-xs text-gray-500">Mañana 10:00 - 11:00</p>
                </div>
                <div className="p-3 border-l-4 border-purple-500 bg-purple-50">
                  <p className="font-medium">Firma de contrato</p>
                  <p className="text-sm text-gray-600">Cliente DEF</p>
                  <p className="text-xs text-gray-500">Viernes 14:00 - 15:00</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Calendar