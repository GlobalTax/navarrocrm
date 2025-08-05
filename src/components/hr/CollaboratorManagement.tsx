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
import { 
  Building, 
  Plus,
  Euro,
  FileText,
  Mail,
  Phone,
  User,
  Calendar,
  TrendingUp,
  Download,
  Edit,
  Eye
} from 'lucide-react'

interface Collaborator {
  id: string
  name: string
  email: string
  phone?: string
  companyName?: string
  vatNumber?: string
  hourlyRate: number
  specializations: string[]
  servicesOffered: string[]
  status: 'active' | 'inactive' | 'pending'
  totalProjects: number
  totalInvoiced: number
  lastProjectDate: string
  preferredPayment: 'transfer' | 'check' | 'cash'
  paymentTerms: number
  collaborationSince: string
}

interface CollaboratorManagementProps {
  orgId: string
}

export function CollaboratorManagement({ orgId }: CollaboratorManagementProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Mock data - replace with actual data fetching
  const collaborators: Collaborator[] = [
    {
      id: '1',
      name: 'Elena Rodríguez',
      email: 'elena@freelance.com',
      phone: '+34 666 123 456',
      companyName: 'Elena Consulting SL',
      vatNumber: 'ESB12345678',
      hourlyRate: 85,
      specializations: ['Derecho Laboral', 'Recursos Humanos'],
      servicesOffered: ['Consultoría Legal', 'Formación', 'Auditorías'],
      status: 'active',
      totalProjects: 12,
      totalInvoiced: 15400,
      lastProjectDate: '2024-01-10',
      preferredPayment: 'transfer',
      paymentTerms: 30,
      collaborationSince: '2023-03-15'
    },
    {
      id: '2',
      name: 'Miguel Sánchez',
      email: 'miguel@consultores.es',
      phone: '+34 677 987 654',
      companyName: 'Sánchez & Asociados',
      vatNumber: 'ESB87654321',
      hourlyRate: 120,
      specializations: ['Derecho Mercantil', 'Societario'],
      servicesOffered: ['Consultoría Jurídica', 'Representación Legal'],
      status: 'active',
      totalProjects: 8,
      totalInvoiced: 28900,
      lastProjectDate: '2024-01-05',
      preferredPayment: 'transfer',
      paymentTerms: 15,
      collaborationSince: '2022-11-20'
    },
    {
      id: '3',
      name: 'Laura Martín',
      email: 'laura.martin@freelance.com',
      phone: '+34 688 456 789',
      hourlyRate: 65,
      specializations: ['Diseño Gráfico', 'Marketing Digital'],
      servicesOffered: ['Diseño Web', 'Campañas Publicitarias', 'Social Media'],
      status: 'pending',
      totalProjects: 3,
      totalInvoiced: 4200,
      lastProjectDate: '2023-12-20',
      preferredPayment: 'transfer',
      paymentTerms: 30,
      collaborationSince: '2023-12-01'
    }
  ]

  const getStatusBadge = (status: Collaborator['status']) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
    
    const labels = {
      active: 'Activo',
      inactive: 'Inactivo',
      pending: 'Pendiente'
    }

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    )
  }

  const filteredCollaborators = collaborators.filter(collaborator => {
    const matchesSearch = collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collaborator.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || collaborator.status === selectedStatus
    const matchesSpecialization = selectedSpecialization === 'all' || 
                                 collaborator.specializations.some(spec => 
                                   spec.toLowerCase().includes(selectedSpecialization.toLowerCase())
                                 )
    return matchesSearch && matchesStatus && matchesSpecialization
  })

  const totalCollaborators = collaborators.length
  const activeCollaborators = collaborators.filter(c => c.status === 'active').length
  const totalInvoiced = collaborators.reduce((acc, c) => acc + c.totalInvoiced, 0)
  const avgRate = collaborators.reduce((acc, c) => acc + c.hourlyRate, 0) / collaborators.length

  const allSpecializations = Array.from(
    new Set(collaborators.flatMap(c => c.specializations))
  )

  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Colaboradores</CardTitle>
            <Building className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalCollaborators}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCollaborators}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
            <Euro className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              €{totalInvoiced.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarifa Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              €{avgRate.toFixed(0)}/h
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gestión de colaboradores */}
      <Card>
        <CardHeader>
          <CardTitle>Colaboradores Autónomos</CardTitle>
          <CardDescription>Gestiona freelancers y colaboradores externos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Buscar colaborador..."
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
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Especialización" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {allSpecializations.map(spec => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Colaborador
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>Nuevo Colaborador</DialogTitle>
                  <DialogDescription>
                    Registra un nuevo colaborador autónomo o freelancer
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Form fields would go here */}
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Formulario de registro en desarrollo</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabla de colaboradores */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Especialización</TableHead>
                  <TableHead>Tarifa/Hora</TableHead>
                  <TableHead>Proyectos</TableHead>
                  <TableHead>Facturado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCollaborators.map((collaborator) => (
                  <TableRow key={collaborator.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{collaborator.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {collaborator.email}
                        </div>
                        {collaborator.companyName && (
                          <div className="text-sm text-muted-foreground">
                            {collaborator.companyName}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {collaborator.specializations.slice(0, 2).map((spec, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {collaborator.specializations.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{collaborator.specializations.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">€{collaborator.hourlyRate}/h</div>
                    </TableCell>
                    <TableCell>{collaborator.totalProjects}</TableCell>
                    <TableCell>
                      <div className="font-medium">
                        €{collaborator.totalInvoiced.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(collaborator.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCollaborators.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron colaboradores que coincidan con los filtros</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas por especialización */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Especialización</CardTitle>
          <CardDescription>Colaboradores y facturación por área de especialización</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allSpecializations.map((specialization) => {
              const specsCollaborators = collaborators.filter(c => 
                c.specializations.includes(specialization)
              )
              const specsInvoiced = specsCollaborators.reduce((acc, c) => acc + c.totalInvoiced, 0)
              
              return (
                <Card key={specialization} className="p-4">
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <h4 className="text-sm font-semibold">{specialization}</h4>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{specsCollaborators.length}</div>
                    <p className="text-xs text-muted-foreground">
                      €{specsInvoiced.toLocaleString()} facturados
                    </p>
                  </div>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}