import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Clock, 
  Play, 
  Pause, 
  Plus, 
  Timer, 
  Euro,
  Calendar,
  User,
  Search
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

interface CaseTimePanelProps {
  caseId: string
}

interface TimeEntry {
  id: string
  description: string
  duration_minutes: number
  is_billable: boolean
  created_at: string
  user: {
    email: string
  }
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export const CaseTimePanel = ({ caseId }: CaseTimePanelProps) => {
  const { user } = useApp()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerMinutes, setTimerMinutes] = useState(0)
  const [newEntryDescription, setNewEntryDescription] = useState('')
  const [newEntryDuration, setNewEntryDuration] = useState('')
  const [newEntryBillable, setNewEntryBillable] = useState(true)

  const { data: timeEntries = [], isLoading, error } = useQuery({
    queryKey: ['case-time-entries', caseId, user?.org_id],
    queryFn: async (): Promise<TimeEntry[]> => {
      if (!caseId || !user?.org_id) return []

      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          id,
          description,
          duration_minutes,
          is_billable,
          created_at,
          user:users!time_entries_user_id_fkey(email)
        `)
        .eq('case_id', caseId)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as TimeEntry[]
    },
    enabled: !!caseId && !!user?.org_id,
  })

  const createTimeEntryMutation = useMutation({
    mutationFn: async (entry: { description: string; duration_minutes: number; is_billable: boolean }) => {
      if (!user?.id || !user?.org_id) throw new Error('Usuario no autenticado')

      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          case_id: caseId,
          user_id: user.id,
          org_id: user.org_id,
          description: entry.description,
          duration_minutes: entry.duration_minutes,
          is_billable: entry.is_billable
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-time-entries'] })
      toast.success('Tiempo registrado exitosamente')
      setNewEntryDescription('')
      setNewEntryDuration('')
    },
    onError: () => {
      toast.error('Error al registrar el tiempo')
    }
  })

  const handleAddTimeEntry = () => {
    if (!newEntryDescription.trim() || !newEntryDuration) {
      toast.error('Completa todos los campos requeridos')
      return
    }

    const duration = parseInt(newEntryDuration)
    if (isNaN(duration) || duration <= 0) {
      toast.error('La duración debe ser un número positivo')
      return
    }

    createTimeEntryMutation.mutate({
      description: newEntryDescription,
      duration_minutes: duration,
      is_billable: newEntryBillable
    })
  }

  const filteredEntries = timeEntries.filter(entry =>
    entry.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalMinutes = timeEntries.reduce((sum, entry) => sum + entry.duration_minutes, 0)
  const billableMinutes = timeEntries.filter(entry => entry.is_billable).reduce((sum, entry) => sum + entry.duration_minutes, 0)
  const nonBillableMinutes = totalMinutes - billableMinutes

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Registro de Tiempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            Error al cargar los registros de tiempo
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Temporizador activo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Temporizador Activo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-primary">
                {formatDuration(timerMinutes)}
              </div>
              <div className="text-sm text-muted-foreground">
                {isTimerRunning ? 'En progreso' : 'Pausado'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isTimerRunning ? "secondary" : "default"}
                size="sm"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="gap-2"
              >
                {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isTimerRunning ? 'Pausar' : 'Iniciar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agregar nuevo registro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Registrar Tiempo Manualmente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Descripción</label>
              <Textarea
                placeholder="Describe en qué trabajaste..."
                value={newEntryDescription}
                onChange={(e) => setNewEntryDescription(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Duración (minutos)</label>
                <Input
                  type="number"
                  placeholder="120"
                  value={newEntryDuration}
                  onChange={(e) => setNewEntryDuration(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="billable"
                  checked={newEntryBillable}
                  onChange={(e) => setNewEntryBillable(e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="billable" className="text-sm font-medium text-foreground">
                  Tiempo facturable
                </label>
              </div>
            </div>
            
            <Button 
              onClick={handleAddTimeEntry}
              disabled={createTimeEntryMutation.isPending}
              className="w-full gap-2"
            >
              <Clock className="h-4 w-4" />
              {createTimeEntryMutation.isPending ? 'Registrando...' : 'Registrar Tiempo'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de registros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Historial de Tiempo
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{formatDuration(totalMinutes)}</div>
              <div className="text-xs text-muted-foreground">Tiempo Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chart-1">{formatDuration(billableMinutes)}</div>
              <div className="text-xs text-muted-foreground">Facturable</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chart-2">{formatDuration(nonBillableMinutes)}</div>
              <div className="text-xs text-muted-foreground">No Facturable</div>
            </div>
          </div>

          {/* Búsqueda */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar registros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Skeleton className="w-10 h-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="w-16 h-6" />
                </div>
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              {timeEntries.length === 0 ? (
                <p className="text-muted-foreground">No hay tiempo registrado para este expediente</p>
              ) : (
                <p className="text-muted-foreground">No se encontraron registros con ese término de búsqueda</p>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className={`flex-shrink-0 p-2 rounded-lg ${entry.is_billable ? 'bg-chart-1/10 text-chart-1' : 'bg-muted text-muted-foreground'}`}>
                    <Euro className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-foreground mb-1">
                          {entry.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {entry.user?.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(entry.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant={entry.is_billable ? "default" : "secondary"}>
                          {entry.is_billable ? 'Facturable' : 'No facturable'}
                        </Badge>
                        <div className="text-sm font-semibold text-foreground">
                          {formatDuration(entry.duration_minutes)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}