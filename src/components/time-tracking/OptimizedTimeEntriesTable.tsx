import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Trash2, Edit, Copy, MoreHorizontal, Calendar, DollarSign } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useTimeEntries } from '@/features/time-tracking'
import { format, isToday, isYesterday } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

export const OptimizedTimeEntriesTable = () => {
  const {
    filteredTimeEntries,
    isLoading,
    deleteTimeEntry,
    isDeleting
  } = useTimeEntries()

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta entrada?')) {
      return
    }

    try {
      setDeletingId(id)
      await deleteTimeEntry(id)
      toast.success('Entrada eliminada')
    } catch (error) {
      console.error('Error deleting time entry:', error)
      toast.error('Error al eliminar la entrada')
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

  const formatSmartDate = (dateString: string) => {
    const date = new Date(dateString)
    
    if (isToday(date)) return 'Hoy'
    if (isYesterday(date)) return 'Ayer'
    
    return format(date, 'dd/MM', { locale: es })
  }

  const getTotalStats = () => {
    const totalMinutes = filteredTimeEntries.reduce((sum, entry) => sum + entry.duration_minutes, 0)
    const billableMinutes = filteredTimeEntries
      .filter(entry => entry.is_billable)
      .reduce((sum, entry) => sum + entry.duration_minutes, 0)
    
    return {
      total: (totalMinutes / 60).toFixed(1),
      billable: (billableMinutes / 60).toFixed(1),
      rate: totalMinutes > 0 ? Math.round((billableMinutes / totalMinutes) * 100) : 0,
      entries: filteredTimeEntries.length
    }
  }

  const stats = getTotalStats()

  // Agrupar entradas por fecha
  const groupedEntries = filteredTimeEntries.reduce((groups, entry) => {
    const date = new Date(entry.created_at).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(entry)
    return groups
  }, {} as Record<string, typeof filteredTimeEntries>)

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
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Registros de Tiempo
          </CardTitle>
          
          {/* Stats compactas */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{stats.total}h</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{stats.billable}h</div>
              <div className="text-xs text-gray-500">Facturable</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{stats.rate}%</div>
              <div className="text-xs text-gray-500">Tasa</div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredTimeEntries.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No hay registros de tiempo</p>
            <p className="text-sm text-gray-400 mt-1">Usa el timer para crear tu primera entrada</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEntries).map(([dateString, entries]) => {
              const dayMinutes = entries.reduce((sum, entry) => sum + entry.duration_minutes, 0)
              const dayBillableMinutes = entries.filter(e => e.is_billable).reduce((sum, entry) => sum + entry.duration_minutes, 0)
              
              return (
                <div key={dateString} className="space-y-3">
                  {/* Header del día */}
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-900">
                        {formatSmartDate(entries[0].created_at)}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {entries.length} {entries.length === 1 ? 'entrada' : 'entradas'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-600">
                        <DollarSign className="h-3 w-3 inline mr-1" />
                        {formatDuration(dayBillableMinutes)}
                      </span>
                      <span className="font-medium">
                        Total: {formatDuration(dayMinutes)}
                      </span>
                    </div>
                  </div>

                  {/* Entradas del día */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="w-16">Hora</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead className="w-32">Caso</TableHead>
                          <TableHead className="w-20">Tiempo</TableHead>
                          <TableHead className="w-24">Tipo</TableHead>
                          <TableHead className="w-16"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entries.map((entry) => (
                          <TableRow key={entry.id} className="hover:bg-gray-50">
                            <TableCell className="text-sm text-gray-500">
                              {format(new Date(entry.created_at), 'HH:mm')}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <p className="text-sm truncate">
                                  {entry.description || 'Sin descripción'}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {entry.case ? (
                                <div className="text-xs">
                                  <p className="font-medium truncate">{entry.case.title}</p>
                                  {entry.case.contact && (
                                    <p className="text-gray-500 truncate">
                                      {entry.case.contact.name}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">Sin caso</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-sm font-medium">
                                {formatDuration(entry.duration_minutes)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={entry.is_billable ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {entry.is_billable ? 'Fact.' : 'No fact.'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(entry.id)}
                                    disabled={isDeleting || deletingId === entry.id}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
