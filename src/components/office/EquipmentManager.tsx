
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Monitor, 
  Settings,
  Edit,
  Trash2,
  Package
} from 'lucide-react'
import { useEquipment, useUpdateEquipment } from '@/hooks/useEquipment'
import { EquipmentFormDialog } from './EquipmentFormDialog'
import { Equipment } from '@/types/office'

export const EquipmentManager = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  
  const { data: equipment = [], isLoading } = useEquipment()
  const updateEquipment = useUpdateEquipment()

  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.current_location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (item: Equipment) => {
    setSelectedEquipment(item)
    setIsFormOpen(true)
  }

  const handleRetire = (item: Equipment) => {
    if (confirm(`¿Estás seguro de que quieres dar de baja "${item.name}"?`)) {
      updateEquipment.mutate({ id: item.id, status: 'retired' })
    }
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
      'retired': 'Dado de baja'
    }
    return labels[status] || status
  }

  const getConditionColor = (condition: string) => {
    const colors: Record<string, string> = {
      'excellent': 'bg-green-100 text-green-800',
      'good': 'bg-blue-100 text-blue-800',
      'fair': 'bg-yellow-100 text-yellow-800',
      'poor': 'bg-red-100 text-red-800'
    }
    return colors[condition] || 'bg-gray-100 text-gray-800'
  }

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      'excellent': 'Excelente',
      'good': 'Bueno',
      'fair': 'Regular',
      'poor': 'Malo'
    }
    return labels[condition] || condition
  }

  if (isLoading) {
    return <div>Cargando equipos...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header con búsqueda y botón crear */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar equipos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
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

      {/* Grid de equipos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusColor(item.status)}>
                      {getStatusLabel(item.status)}
                    </Badge>
                    <Badge className={getConditionColor(item.condition)}>
                      {getConditionLabel(item.condition)}
                    </Badge>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRetire(item)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.description && (
                <p className="text-sm text-gray-600">{item.description}</p>
              )}
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Categoría:</span>
                  <p className="text-gray-600 capitalize">{item.category}</p>
                </div>
                {item.brand && (
                  <div>
                    <span className="font-medium">Marca:</span>
                    <p className="text-gray-600">{item.brand}</p>
                  </div>
                )}
                {item.model && (
                  <div>
                    <span className="font-medium">Modelo:</span>
                    <p className="text-gray-600">{item.model}</p>
                  </div>
                )}
                {item.current_location && (
                  <div>
                    <span className="font-medium">Ubicación:</span>
                    <p className="text-gray-600">{item.current_location}</p>
                  </div>
                )}
              </div>

              {item.serial_number && (
                <div>
                  <span className="text-xs text-gray-500">S/N: {item.serial_number}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 flex items-center gap-1"
                  onClick={() => handleEdit(item)}
                >
                  <Settings className="h-4 w-4" />
                  Gestionar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron equipos' : 'No hay equipos registrados'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza registrando tu primer equipo de oficina'
              }
            </p>
            {!searchTerm && (
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
