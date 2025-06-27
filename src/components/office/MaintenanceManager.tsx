
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Search, 
  Wrench, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Euro
} from 'lucide-react'

export const MaintenanceManager = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  // Datos de ejemplo - en la implementación real vendrían de useQuery
  const maintenanceItems = [
    {
      id: '1',
      equipment_name: 'Proyector Sala A',
      maintenance_type: 'preventive',
      scheduled_date: '2024-01-15',
      status: 'scheduled',
      priority: 'medium',
      description: 'Limpieza de filtros y calibración',
      cost: 150
    },
    {
      id: '2',
      equipment_name: 'Aire Acondicionado Planta 2',
      maintenance_type: 'corrective',
      scheduled_date: '2024-01-10',
      status: 'in_progress',
      priority: 'high',
      description: 'Reparación de compresor',
      cost: 750
    }
  ]

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'scheduled': 'Programado',
      'in_progress': 'En Progreso',
      'completed': 'Completado',
      'cancelled': 'Cancelado'
    }
    return labels[status] || status
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'low': 'bg-gray-100 text-gray-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta',
      'urgent': 'Urgente'
    }
    return labels[priority] || priority
  }

  const getMaintenanceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'preventive': 'Preventivo',
      'corrective': 'Correctivo',
      'emergency': 'Emergencia'
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mantenimiento</h2>
          <p className="text-gray-600">Programa y gestiona el mantenimiento de equipos</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Programar Mantenimiento
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar mantenimientos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="scheduled">Programado</SelectItem>
              <SelectItem value="in_progress">En Progreso</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las prioridades</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de mantenimientos */}
      <div className="space-y-4">
        {maintenanceItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium">{item.equipment_name}</h3>
                    <Badge className={getStatusColor(item.status)}>
                      {getStatusLabel(item.status)}
                    </Badge>
                    <Badge className={getPriorityColor(item.priority)}>
                      {getPriorityLabel(item.priority)}
                    </Badge>
                    <Badge variant="outline">
                      {getMaintenanceTypeLabel(item.maintenance_type)}
                    </Badge>
                  </div>

                  <p className="text-gray-600 mb-3">{item.description}</p>

                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Programado: {new Date(item.scheduled_date).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Euro className="h-4 w-4" />
                      <span>Coste: €{item.cost}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  {item.status === 'scheduled' && (
                    <Button variant="outline" size="sm" className="bg-green-50 text-green-700">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {maintenanceItems.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay mantenimientos programados
              </h3>
              <p className="text-gray-500 mb-4">
                Programa el primer mantenimiento para tus equipos
              </p>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Programar Primer Mantenimiento
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
