import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Clock, 
  UserCheck, 
  UserX, 
  MapPin, 
  Calendar as CalendarIcon,
  Download,
  Filter,
  PlayCircle,
  PauseCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface AttendanceRecord {
  id: string
  employeeName: string
  date: string
  checkIn: string
  checkOut?: string
  breakTime: number
  totalHours: number
  location: 'office' | 'remote' | 'field'
  status: 'present' | 'late' | 'absent' | 'partial'
  notes?: string
}

interface AttendanceControlProps {
  orgId: string
}

export function AttendanceControl({ orgId }: AttendanceControlProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [filterEmployee, setFilterEmployee] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTimer, setActiveTimer] = useState<string | null>(null)

  // Mock data - replace with actual data fetching
  const attendanceRecords: AttendanceRecord[] = [
    {
      id: '1',
      employeeName: 'María González',
      date: '2024-01-15',
      checkIn: '09:00',
      checkOut: '18:00',
      breakTime: 60,
      totalHours: 8,
      location: 'office',
      status: 'present'
    },
    {
      id: '2',
      employeeName: 'Carlos Ruiz',
      date: '2024-01-15',
      checkIn: '09:15',
      checkOut: '17:45',
      breakTime: 45,
      totalHours: 7.75,
      location: 'remote',
      status: 'late'
    },
    {
      id: '3',
      employeeName: 'Ana Martín',
      date: '2024-01-15',
      checkIn: '09:00',
      breakTime: 0,
      totalHours: 0,
      location: 'office',
      status: 'partial',
      notes: 'Salida temprana por cita médica'
    }
  ]

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const variants = {
      present: 'bg-green-100 text-green-800',
      late: 'bg-yellow-100 text-yellow-800',
      absent: 'bg-red-100 text-red-800',
      partial: 'bg-blue-100 text-blue-800'
    }
    
    const labels = {
      present: 'Presente',
      late: 'Tardanza',
      absent: 'Ausente',
      partial: 'Parcial'
    }

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    )
  }

  const getLocationIcon = (location: AttendanceRecord['location']) => {
    const icons = {
      office: <MapPin className="h-4 w-4" />,
      remote: <Clock className="h-4 w-4" />,
      field: <UserCheck className="h-4 w-4" />
    }
    return icons[location]
  }

  const toggleTimer = (employeeId: string) => {
    if (activeTimer === employeeId) {
      setActiveTimer(null)
    } else {
      setActiveTimer(employeeId)
    }
  }

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus
    const matchesDate = record.date === format(selectedDate, 'yyyy-MM-dd')
    return matchesSearch && matchesStatus && matchesDate
  })

  const todayStats = {
    present: attendanceRecords.filter(r => r.status === 'present').length,
    late: attendanceRecords.filter(r => r.status === 'late').length,
    absent: attendanceRecords.filter(r => r.status === 'absent').length,
    avgHours: attendanceRecords.reduce((acc, r) => acc + r.totalHours, 0) / attendanceRecords.length
  }

  return (
    <div className="space-y-6">
      {/* Métricas del día */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presentes</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{todayStats.present}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tardanzas</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{todayStats.late}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausentes</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{todayStats.absent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Promedio</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {todayStats.avgHours.toFixed(1)}h
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y controles */}
      <Card>
        <CardHeader>
          <CardTitle>Control de Asistencia</CardTitle>
          <CardDescription>Gestiona el fichaje y horarios del personal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Buscar empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-fit">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'dd/MM/yyyy', { locale: es })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="present">Presentes</SelectItem>
                <SelectItem value="late">Tardanzas</SelectItem>
                <SelectItem value="absent">Ausentes</SelectItem>
                <SelectItem value="partial">Parciales</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          {/* Tabla de asistencia */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Salida</TableHead>
                  <TableHead>Descanso</TableHead>
                  <TableHead>Total Horas</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.employeeName}
                    </TableCell>
                    <TableCell>{record.checkIn}</TableCell>
                    <TableCell>{record.checkOut || '-'}</TableCell>
                    <TableCell>{record.breakTime}min</TableCell>
                    <TableCell>{record.totalHours}h</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getLocationIcon(record.location)}
                        <span className="capitalize">{record.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTimer(record.id)}
                        >
                          {activeTimer === record.id ? (
                            <PauseCircle className="h-4 w-4" />
                          ) : (
                            <PlayCircle className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay registros de asistencia para la fecha seleccionada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}