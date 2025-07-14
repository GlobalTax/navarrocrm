import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, QrCode } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { CreateEquipmentDialog } from './CreateEquipmentDialog'
import { EditEquipmentDialog } from './EditEquipmentDialog'

export function EquipmentInventory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editEquipment, setEditEquipment] = useState<any>(null)

  const { data: equipment = [], isLoading, refetch } = useQuery({
    queryKey: ['equipment-inventory', searchTerm],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('No authenticated user')

      const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.user.id)
        .single()

      if (!userData?.org_id) throw new Error('User not in organization')

      let query = supabase
        .from('equipment_inventory')
        .select(`
          *,
          assigned_to_user:users(name),
          room:office_rooms(name)
        `)
        .eq('org_id', userData.org_id)

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'default'
      case 'assigned': return 'secondary'
      case 'maintenance': return 'destructive'
      case 'retired': return 'outline'
      default: return 'default'
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'default'
      case 'good': return 'secondary'
      case 'fair': return 'destructive'
      case 'poor': return 'outline'
      default: return 'default'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 w-32 bg-muted rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar equipos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Equipo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {equipment.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setEditEquipment(item)}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                {item.qr_code && (
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex gap-2">
                <Badge variant={getStatusColor(item.status)}>
                  {item.status === 'available' ? 'Disponible' :
                   item.status === 'assigned' ? 'Asignado' :
                   item.status === 'maintenance' ? 'Mantenimiento' : 'Retirado'}
                </Badge>
                <Badge variant={getConditionColor(item.condition)}>
                  {item.condition === 'excellent' ? 'Excelente' :
                   item.condition === 'good' ? 'Bueno' :
                   item.condition === 'fair' ? 'Regular' : 'Malo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {item.brand && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Marca:</span> {item.brand}
                </p>
              )}
              {item.model && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Modelo:</span> {item.model}
                </p>
              )}
              {item.category && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Categoría:</span> {item.category}
                </p>
              )}
              {item.assigned_to_user && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Asignado a:</span> {item.assigned_to_user.name}
                </p>
              )}
              {item.room && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Ubicación:</span> {item.room.name}
                </p>
              )}
              {item.serial_number && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">S/N:</span> {item.serial_number}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {equipment.length === 0 && (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay equipos</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No se encontraron equipos con ese criterio de búsqueda.' : 'Comienza agregando tu primer equipo.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Equipo
            </Button>
          )}
        </div>
      )}

      <CreateEquipmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          refetch()
          setCreateDialogOpen(false)
        }}
      />

      {editEquipment && (
        <EditEquipmentDialog
          equipment={editEquipment}
          open={!!editEquipment}
          onOpenChange={() => setEditEquipment(null)}
          onSuccess={() => {
            refetch()
            setEditEquipment(null)
          }}
        />
      )}
    </div>
  )
}