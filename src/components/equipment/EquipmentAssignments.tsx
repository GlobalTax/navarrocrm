import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Users, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { CreateAssignmentDialog } from './CreateAssignmentDialog'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function EquipmentAssignments() {
  const [searchTerm, setSearchTerm] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const { data: assignments = [], isLoading, refetch } = useQuery({
    queryKey: ['equipment-assignments', searchTerm],
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
        .from('equipment_assignments')
        .select(`
          *,
          equipment:equipment_inventory(name, brand, model, category),
          assigned_to_user:users!equipment_assignments_assigned_to_fkey(name, email),
          assigned_by_user:users!equipment_assignments_assigned_by_fkey(name)
        `)
        .eq('org_id', userData.org_id)

      if (searchTerm) {
        query = query.or(`equipment.name.ilike.%${searchTerm}%,assigned_to_user.name.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'returned': return 'secondary'
      case 'overdue': return 'destructive'
      default: return 'outline'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa'
      case 'returned': return 'Devuelto'
      case 'overdue': return 'Vencida'
      default: return status
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
            placeholder="Buscar asignaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Asignación
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assignments.map((assignment) => (
          <Card key={assignment.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  {assignment.equipment?.name || 'Equipo no disponible'}
                </CardTitle>
                <Badge variant={getStatusColor(assignment.status)}>
                  {getStatusText(assignment.status)}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {assignment.equipment?.brand} {assignment.equipment?.model}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Asignado a:</span>
                <span>{assignment.assigned_to_user?.name || 'Usuario no disponible'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Desde:</span>
                <span>{format(new Date(assignment.start_date), 'dd/MM/yyyy', { locale: es })}</span>
              </div>

              {assignment.end_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Hasta:</span>
                  <span>{format(new Date(assignment.end_date), 'dd/MM/yyyy', { locale: es })}</span>
                </div>
              )}

              {assignment.location && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Ubicación:</span> {assignment.location}
                </p>
              )}

              {assignment.purpose && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Propósito:</span> {assignment.purpose}
                </p>
              )}

              {assignment.return_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Devuelto:</span>
                  <span>{format(new Date(assignment.return_date), 'dd/MM/yyyy', { locale: es })}</span>
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-2 border-t">
                Asignado por {assignment.assigned_by_user?.name} • {format(new Date(assignment.created_at), 'dd/MM/yyyy', { locale: es })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay asignaciones</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No se encontraron asignaciones con ese criterio de búsqueda.' : 'Comienza asignando equipos a los empleados.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Asignación
            </Button>
          )}
        </div>
      )}

      <CreateAssignmentDialog
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