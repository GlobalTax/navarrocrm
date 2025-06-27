
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Settings, 
  Calendar, 
  AlertTriangle,
  Plus,
  Wrench
} from 'lucide-react'

export const MaintenanceManager = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mantenimiento de Equipos</h2>
          <p className="text-gray-600">Gestiona el mantenimiento preventivo y correctivo</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Programar Mantenimiento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-2xl font-bold text-orange-600">0</p>
              <p className="text-sm text-gray-500">Mantenimientos pendientes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Calendar className="h-5 w-5" />
              Programados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-2xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-500">Para este mes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Wrench className="h-5 w-5" />
              Completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-2xl font-bold text-green-600">0</p>
              <p className="text-sm text-gray-500">Este mes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay mantenimientos programados
          </h3>
          <p className="text-gray-500 mb-4">
            Programa mantenimientos preventivos para mantener tus equipos en óptimas condiciones
          </p>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Programar Primer Mantenimiento
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
