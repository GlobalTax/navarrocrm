
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Search, 
  Monitor, 
  Edit,
  Trash2,
  User,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { useEquipment } from '@/hooks/useEquipment'
import { EquipmentFormDialog } from './EquipmentFormDialog'
import { Equipment } from '@/types/office'

export const EquipmentManager = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  
  const { data: equipment = [], isLoading } = useEquipment()

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleEdit = (item: Equipment) => {
    setSelectedEquipment(item)
    setIsFormOpen(true)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'available': 'bg-green-100 text-green-800',
      'assigned': 'bg-blue-100 text-blue-800',
      'maintenance': 'bg-yellow-100 text-yellow-800',
      'retired': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'available': 'Disponible',
      'assigned': 'Asignado',
      'maintenance': 'Mantenimiento',
      'retired': 'Retirado'
    }
    return labels[status] || status
  }

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'fair':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'poor':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Monitor className="h-4 w-4 text-gray-500" />
    }
  }

  if (isLoading) {
    return <div>Cargando equipos...</div>
  }

  const categories = [...new Set(equipment.map(item => item.category))]
  const statuses = ['available', 'assigned', 'maintenance', 'retired']

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar equipos..."
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
              {statuses.map(status => (
                <SelectItem key={status} value={status}>
                  {getStatusLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={() => {
              setSelectedEquipment(null)
              setIsFormOpen(true)
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Equipo
          </Button>
        </div>
      </div>

      {/* Grid de equipos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getConditionIcon(item.condition)}
                    {item.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusColor(item.status)}>
                      {getStatusLabel(item.status)}
                    </Badge>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.description && (
                <p className="text-sm text-gray-600">{item.description}</p>
              )}
              
              <div className="space-y-2">
                {item.brand && item.model && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Marca/Modelo:</span>
                    <span className="font-medium">{item.brand} {item.model}</span>
                  </div>
                )}
                
                {item.serial_number && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Serie:</span>
                    <span className="font-mono text-xs">{item.serial_number}</span>
                  </div>
                )}

                {item.current_location && (
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{item.current_location}</span>
                  </div>
                )}

                {item.assigned_to && (
                  <div className="flex items-center gap-1 text-sm">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>Asignado</span>
                  </div>
                )}
              </div>

              {item.warranty_expiry && (
                <div className="flex items-center gap-1 text-sm text-orange-600">
                  <Calendar className="h-4 w-4" />
                  <span>Garantía: {new Date(item.warranty_expiry).toLocaleDateString()}</span>
                </div>
              )}

              {item.purchase_cost && (
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm text-gray-600">Coste:</span>
                  <span className="font-medium">€{item.purchase_cost.toLocaleString()}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  disabled={item.status !== 'available'}
                >
                  Asignar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEdit(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
                ? 'No se encontraron equipos' 
                : 'No hay equipos registrados'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza registrando tu primer equipo'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
              <Button 
                onClick={() => {
                  setSelectedEquipment(null)
                  setIsFormOpen(true)
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Registrar Primer Equipo
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <EquipmentFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        equipment={selectedEquipment}
        onSuccess={() => {
          setIsFormOpen(false)
          setSelectedEquipment(null)
        }}
      />
    </div>
  )
}
