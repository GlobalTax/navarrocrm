import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Wrench, Calendar, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { CreateMaintenanceDialog } from './CreateMaintenanceDialog'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function EquipmentMaintenance() {
  const [searchTerm, setSearchTerm] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const { data: maintenance = [], isLoading, refetch } = useQuery({
    queryKey: ['equipment-maintenance', searchTerm],
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
        .from('equipment_maintenance')
        .select(`
          *,
          equipment:equipment_inventory(name, brand, model, category)
        `)
        .eq('org_id', userData.org_id)

      if (searchTerm) {
        query = query.or(`equipment.name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query.order('scheduled_date', { ascending: false })
      if (error) throw error
      return data || []
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default'
      case 'in_progress': return 'secondary'
      case 'completed': return 'outline'
      case 'cancelled': return 'destructive'
      default: return 'outline'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programado'
      case 'in_progress': return 'En Progreso'
      case 'completed': return 'Completado'
      case 'cancelled': return 'Cancelado'
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'outline'
      case 'medium': return 'secondary'
      case 'high': return 'destructive'
      case 'urgent': return 'destructive'
      default: return 'outline'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'Baja'
      case 'medium': return 'Media'
      case 'high': return 'Alta'
      case 'urgent': return 'Urgente'
      default: return priority
    }
  }

  const isOverdue = (scheduledDate: string, status: string) => {
    return status === 'scheduled' && new Date(scheduledDate) < new Date()
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
            placeholder="Buscar mantenimientos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Programar Mantenimiento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {maintenance.map((item) => (
          <Card 
            key={item.id} 
            className={`hover:shadow-md transition-shadow ${
              isOverdue(item.scheduled_date, item.status) ? 'border-destructive' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  {item.equipment?.name || 'Equipo no disponible'}
                </CardTitle>
                <div className="flex gap-1">
                  {isOverdue(item.scheduled_date, item.status) && (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  )}
                  <Badge variant={getStatusColor(item.status)}>
                    {getStatusText(item.status)}
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {item.equipment?.brand} {item.equipment?.model}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <Badge variant={getPriorityColor(item.priority)}>
                  {getPriorityText(item.priority)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {item.maintenance_type === 'preventive' ? 'Preventivo' : 'Correctivo'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Programado:</span>
                <span className={isOverdue(item.scheduled_date, item.status) ? 'text-destructive' : ''}>
                  {format(new Date(item.scheduled_date), 'dd/MM/yyyy', { locale: es })}
                </span>
              </div>

              {item.completed_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Completado:</span>
                  <span>{format(new Date(item.completed_date), 'dd/MM/yyyy', { locale: es })}</span>
                </div>
              )}


              {item.description && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Descripción:</span> {item.description}
                </p>
              )}

              {item.cost && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Costo:</span> €{item.cost}
                </p>
              )}

              {item.issues_found && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Problemas:</span> {item.issues_found}
                </p>
              )}

              {item.actions_taken && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Acciones:</span> {item.actions_taken}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {maintenance.length === 0 && (
        <div className="text-center py-8">
          <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay mantenimientos</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No se encontraron mantenimientos con ese criterio de búsqueda.' : 'Programa el primer mantenimiento de equipos.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Programar Mantenimiento
            </Button>
          )}
        </div>
      )}

      <CreateMaintenanceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          refetch()
          setCreateDialogOpen(false)
        }}
      />
    </div>
  )
}