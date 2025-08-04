import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Play, Pause, MoreHorizontal } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface CaseTimePanelProps {
  caseId: string
}

export function CaseTimePanel({ caseId }: CaseTimePanelProps) {
  const mockTimeEntries = [
    {
      id: '1',
      description: 'Análisis de documentos contractuales',
      duration: 120, // minutos
      date: '2024-01-15',
      user: 'Juan Pérez',
      billable: true
    },
    {
      id: '2',
      description: 'Reunión con cliente',
      duration: 90,
      date: '2024-01-16', 
      user: 'María García',
      billable: true
    },
    {
      id: '3',
      description: 'Investigación jurisprudencial',
      duration: 180,
      date: '2024-01-17',
      user: 'Juan Pérez',
      billable: false
    }
  ]

  const totalHours = mockTimeEntries.reduce((acc, entry) => acc + entry.duration, 0) / 60
  const billableHours = mockTimeEntries.filter(e => e.billable).reduce((acc, entry) => acc + entry.duration, 0) / 60

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="space-y-6">
      {/* Resumen de tiempo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
                <p className="text-sm text-muted-foreground">Total registrado</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{billableHours.toFixed(1)}h</p>
                <p className="text-sm text-muted-foreground">Horas facturables</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{((totalHours - billableHours)).toFixed(1)}h</p>
                <p className="text-sm text-muted-foreground">No facturable</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cronómetro activo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Registrar tiempo
            <Button size="sm">
              <Play className="h-4 w-4 mr-2" />
              Iniciar cronómetro
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Lista de entradas de tiempo */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de tiempo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTimeEntries.map((entry) => (
              <div key={entry.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <h4 className="font-medium">{entry.description}</h4>
                  <p className="text-sm text-muted-foreground">
                    {entry.user} • {new Date(entry.date).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <Badge variant={entry.billable ? "default" : "outline"}>
                  {entry.billable ? "Facturable" : "No facturable"}
                </Badge>
                <span className="font-medium">{formatDuration(entry.duration)}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Editar</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
          
          {mockTimeEntries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay tiempo registrado para este expediente.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}