
import { useState } from 'react'
import { Plus, Filter, Download, MoreVertical, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { CaseTable } from '@/components/cases/CaseTable'
import { CaseDetailDialog } from '@/components/cases/CaseDetailDialog'
import { MatterFormDialog } from '@/components/cases/MatterFormDialog'
import { useCases, Case } from '@/hooks/useCases'
import { usePracticeAreas } from '@/hooks/usePracticeAreas'
import { useUsers } from '@/hooks/useUsers'
import { useMatterTemplates } from '@/hooks/useMatterTemplates'

export default function Cases() {
  const { 
    filteredCases, 
    isLoading, 
    searchTerm, 
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    practiceAreaFilter,
    setPracticeAreaFilter,
    solicitorFilter,
    setSolicitorFilter,
    createCase,
    isCreating
  } = useCases()

  const { practiceAreas = [] } = usePracticeAreas()
  const { users = [] } = useUsers()
  const { templates = [] } = useMatterTemplates()

  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedCases, setSelectedCases] = useState<string[]>([])

  const handleViewCase = (case_: Case) => {
    setSelectedCase(case_)
    setIsDetailOpen(true)
  }

  const handleEditCase = (case_: Case) => {
    setSelectedCase(case_)
    setIsFormOpen(true)
  }

  const handleSelectCase = (caseId: string, selected: boolean) => {
    if (selected) {
      setSelectedCases([...selectedCases, caseId])
    } else {
      setSelectedCases(selectedCases.filter(id => id !== caseId))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedCases(filteredCases.map(c => c.id))
    } else {
      setSelectedCases([])
    }
  }

  const stats = {
    total: filteredCases.length,
    open: filteredCases.filter(c => c.status === 'open').length,
    closed: filteredCases.filter(c => c.status === 'closed').length,
    on_hold: filteredCases.filter(c => c.status === 'on_hold').length
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando expedientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expedientes</h1>
            <p className="text-gray-600">Gestiona todos los expedientes de la firma</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Plantillas
                  <MoreVertical className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {templates.map((template) => (
                  <DropdownMenuItem key={template.id}>
                    {template.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Plantilla
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Expediente
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abiertos</CardTitle>
              <Badge className="bg-green-100 text-green-800">{stats.open}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.open}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Espera</CardTitle>
              <Badge className="bg-yellow-100 text-yellow-800">{stats.on_hold}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.on_hold}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cerrados</CardTitle>
              <Badge className="bg-gray-100 text-gray-800">{stats.closed}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar expedientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="open">Abierto</SelectItem>
                    <SelectItem value="on_hold">En espera</SelectItem>
                    <SelectItem value="closed">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={practiceAreaFilter} onValueChange={setPracticeAreaFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Área de práctica" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las áreas</SelectItem>
                    {practiceAreas.map((area) => (
                      <SelectItem key={area.id} value={area.name}>{area.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={solicitorFilter} onValueChange={setSolicitorFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Abogado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los abogados</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>{user.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Más filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedCases.length > 0 && (
          <Card className="mb-4">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedCases.length} expediente(s) seleccionado(s)
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Cambiar estado</Button>
                  <Button variant="outline" size="sm">Asignar abogado</Button>
                  <Button variant="outline" size="sm">Exportar seleccionados</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Card>
          <CardHeader>
            <Tabs defaultValue="matters" className="w-full">
              <TabsList>
                <TabsTrigger value="matters">
                  Expedientes ({filteredCases.length})
                </TabsTrigger>
                <TabsTrigger value="stages">
                  Etapas
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="matters">
                <CaseTable
                  cases={filteredCases}
                  onViewCase={handleViewCase}
                  onEditCase={handleEditCase}
                  selectedCases={selectedCases}
                  onSelectCase={handleSelectCase}
                  onSelectAll={handleSelectAll}
                />
              </TabsContent>
              
              <TabsContent value="stages">
                <div className="text-center py-8 text-muted-foreground">
                  <p>La gestión de etapas estará disponible próximamente</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>

        {/* Dialogs */}
        <CaseDetailDialog
          case_={selectedCase}
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
        />

        <MatterFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={createCase}
          isLoading={isCreating}
        />
      </div>
    </div>
  )
}
