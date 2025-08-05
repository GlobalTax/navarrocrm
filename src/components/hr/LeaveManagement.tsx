import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Calendar as CalendarIcon,
  Plus,
  Check,
  X,
  Clock,
  User,
  FileText,
  Download,
  Filter
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface LeaveRequest {
  id: string
  employeeName: string
  leaveType: 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'other'
  startDate: string
  endDate: string
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  submittedDate: string
  approvedBy?: string
  approvedDate?: string
  comments?: string
}

interface LeaveBalance {
  employeeId: string
  employeeName: string
  vacationDays: {
    total: number
    used: number
    remaining: number
  }
  sickDays: {
    total: number
    used: number
    remaining: number
  }
  personalDays: {
    total: number
    used: number
    remaining: number
  }
}

interface LeaveManagementProps {
  orgId: string
}

export function LeaveManagement({ orgId }: LeaveManagementProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  // Mock data - replace with actual data fetching
  const leaveRequests: LeaveRequest[] = [
    {
      id: '1',
      employeeName: 'María González',
      leaveType: 'vacation',
      startDate: '2024-02-15',
      endDate: '2024-02-20',
      days: 4,
      reason: 'Vacaciones familiares',
      status: 'pending',
      submittedDate: '2024-01-10'
    },
    {
      id: '2',
      employeeName: 'Carlos Ruiz',
      leaveType: 'sick',
      startDate: '2024-01-22',
      endDate: '2024-01-23',
      days: 2,
      reason: 'Gripe',
      status: 'approved',
      submittedDate: '2024-01-21',
      approvedBy: 'Ana Martín',
      approvedDate: '2024-01-21'
    },
    {
      id: '3',
      employeeName: 'Luis Fernández',
      leaveType: 'personal',
      startDate: '2024-02-01',
      endDate: '2024-02-01',
      days: 1,
      reason: 'Asuntos personales',
      status: 'rejected',
      submittedDate: '2024-01-20',
      approvedBy: 'Ana Martín',
      approvedDate: '2024-01-25',
      comments: 'No hay suficiente personal disponible esa fecha'
    }
  ]

  const leaveBalances: LeaveBalance[] = [
    {
      employeeId: '1',
      employeeName: 'María González',
      vacationDays: { total: 22, used: 8, remaining: 14 },
      sickDays: { total: 10, used: 2, remaining: 8 },
      personalDays: { total: 5, used: 1, remaining: 4 }
    },
    {
      employeeId: '2',
      employeeName: 'Carlos Ruiz',
      vacationDays: { total: 22, used: 12, remaining: 10 },
      sickDays: { total: 10, used: 3, remaining: 7 },
      personalDays: { total: 5, used: 2, remaining: 3 }
    }
  ]

  const getStatusBadge = (status: LeaveRequest['status']) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    
    const labels = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado'
    }

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    )
  }

  const getLeaveTypeLabel = (type: LeaveRequest['leaveType']) => {
    const labels = {
      vacation: 'Vacaciones',
      sick: 'Enfermedad',
      personal: 'Personal',
      maternity: 'Maternidad',
      paternity: 'Paternidad',
      other: 'Otro'
    }
    return labels[type]
  }

  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus
    const matchesType = selectedType === 'all' || request.leaveType === selectedType
    return matchesSearch && matchesStatus && matchesType
  })

  const pendingRequests = leaveRequests.filter(r => r.status === 'pending').length
  const approvedRequests = leaveRequests.filter(r => r.status === 'approved').length
  const totalDaysRequested = leaveRequests.reduce((acc, r) => acc + r.days, 0)

  const handleApprove = (requestId: string) => {
    console.log('Approving request:', requestId)
    // Implement approval logic
  }

  const handleReject = (requestId: string) => {
    console.log('Rejecting request:', requestId)
    // Implement rejection logic
  }

  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingRequests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedRequests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Días</CardTitle>
            <CalendarIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalDaysRequested}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados</CardTitle>
            <User className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{leaveBalances.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Solicitudes de permisos */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Permisos</CardTitle>
          <CardDescription>Gestiona las solicitudes de vacaciones y permisos</CardDescription>
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

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="approved">Aprobados</SelectItem>
                <SelectItem value="rejected">Rechazados</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="vacation">Vacaciones</SelectItem>
                <SelectItem value="sick">Enfermedad</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="maternity">Maternidad</SelectItem>
                <SelectItem value="paternity">Paternidad</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Solicitud
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Nueva Solicitud de Permiso</DialogTitle>
                  <DialogDescription>
                    Crear una nueva solicitud de permiso o vacaciones
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Form fields would go here */}
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Formulario de solicitud en desarrollo</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabla de solicitudes */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Días</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Enviado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.employeeName}
                    </TableCell>
                    <TableCell>{getLeaveTypeLabel(request.leaveType)}</TableCell>
                    <TableCell>
                      {format(new Date(request.startDate), 'dd/MM/yyyy', { locale: es })} - {' '}
                      {format(new Date(request.endDate), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>{request.days}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {format(new Date(request.submittedDate), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {request.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(request.id)}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(request.id)}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Balance de días */}
      <Card>
        <CardHeader>
          <CardTitle>Balance de Días por Empleado</CardTitle>
          <CardDescription>Días disponibles, utilizados y restantes por tipo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Vacaciones</TableHead>
                  <TableHead>Enfermedad</TableHead>
                  <TableHead>Personal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveBalances.map((balance) => (
                  <TableRow key={balance.employeeId}>
                    <TableCell className="font-medium">
                      {balance.employeeName}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{balance.vacationDays.remaining}/{balance.vacationDays.total}</div>
                        <div className="text-muted-foreground">
                          {balance.vacationDays.used} usados
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{balance.sickDays.remaining}/{balance.sickDays.total}</div>
                        <div className="text-muted-foreground">
                          {balance.sickDays.used} usados
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{balance.personalDays.remaining}/{balance.personalDays.total}</div>
                        <div className="text-muted-foreground">
                          {balance.personalDays.used} usados
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}