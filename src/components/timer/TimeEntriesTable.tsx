
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, RefreshCw } from 'lucide-react'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { useCases } from '@/hooks/useCases'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

export const TimeEntriesTable = () => {
  const {
    filteredTimeEntries,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    caseFilter,
    setCaseFilter,
    billableFilter,
    setBillableFilter,
    deleteTimeEntry,
    isDeleting
  } = useTimeEntries()

  const { cases } = useCases()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta entrada de tiempo?')) {
      return
    }

    try {
      setDeletingId(id)
      await deleteTimeEntry(id)
      toast.success('Entrada de tiempo eliminada')
    } catch (error) {
      console.error('Error deleting time entry:', error)
      toast.error('Error al eliminar la entrada de tiempo')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getTotalHours = () => {
    const totalMinutes = filteredTimeEntries.reduce((sum, entry) => sum + entry.duration_minutes, 0)
    return (totalMinutes / 60).toFixed(1)
  }

  const getBillableHours = () => {
    const billableMinutes = filteredTimeEntries
      .filter(entry => entry.is_billable)
      .reduce((sum, entry) => sum + entry.duration_minutes, 0)
    return (billableMinutes / 60).toFixed(1)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Registros de Tiempo</CardTitle>
          {error && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          )}
        </div>
        
        {/* Estadísticas */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Total: {getTotalHours()}h</span>
          <span>Facturables: {getBillableHours()}h</span>
          <span>Entradas: {filteredTimeEntries.length}</span>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por descripción, caso o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={caseFilter} onValueChange={setCaseFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por caso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los casos</SelectItem>
              <SelectItem value="none">Sin caso asignado</SelectItem>
              {cases.map((case_) => (
                <SelectItem key={case_.id} value={case_.id}>
                  {case_.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={billableFilter} onValueChange={setBillableFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Facturación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="billable">Facturables</SelectItem>
              <SelectItem value="non-billable">No facturables</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="text-center py-8 text-red-600">
            <p className="font-medium">Error al cargar registros de tiempo</p>
            <p className="text-sm">{error.message}</p>
          </div>
        )}

        {!error && filteredTimeEntries.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay registros de tiempo que mostrar</p>
            {searchTerm || caseFilter !== 'all' || billableFilter !== 'all' ? (
              <p className="text-sm mt-2">Prueba a ajustar los filtros</p>
            ) : (
              <p className="text-sm mt-2">Usa el timer para registrar tu primer entrada de tiempo</p>
            )}
          </div>
        )}

        {!error && filteredTimeEntries.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Caso</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Facturación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTimeEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm">
                      {format(new Date(entry.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="truncate">{entry.description || 'Sin descripción'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {entry.case ? (
                        <div className="text-sm">
                          <p className="font-medium truncate">{entry.case.title}</p>
                          {entry.case.contact && (
                            <p className="text-muted-foreground truncate">
                              {entry.case.contact.name}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sin caso</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {formatDuration(entry.duration_minutes)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.is_billable ? 'default' : 'secondary'}>
                        {entry.is_billable ? 'Facturable' : 'No facturable'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                        disabled={isDeleting || deletingId === entry.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
