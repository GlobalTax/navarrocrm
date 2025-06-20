
import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Filter, RefreshCw } from 'lucide-react'
import { useCases, Case } from '@/hooks/useCases'
import { CaseFormDialog } from '@/components/cases/CaseFormDialog'
import { CaseDetailDialog } from '@/components/cases/CaseDetailDialog'
import { CaseTable } from '@/components/cases/CaseTable'

const Cases = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)

  const {
    filteredCases,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter
  } = useCases()

  const handleCreateCase = () => {
    setSelectedCase(null)
    setIsCreateDialogOpen(true)
  }

  const handleEditCase = (case_: Case) => {
    setSelectedCase(case_)
    setIsEditDialogOpen(true)
  }

  const handleViewCase = (case_: Case) => {
    setSelectedCase(case_)
    setIsDetailDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setIsDetailDialogOpen(false)
    setSelectedCase(null)
  }

  const handleRefresh = () => {
    refetch()
  }

  const hasFilters = searchTerm || statusFilter !== 'all'

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expedientes</h1>
            <p className="text-gray-600">Gestiona todos los casos y expedientes de tus clientes</p>
          </div>
          <Button onClick={handleCreateCase} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Expediente
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Expedientes ({filteredCases.length})</CardTitle>
              {error && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reintentar
                </Button>
              )}
            </div>
            
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por título, descripción o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="open">Abierto</SelectItem>
                    <SelectItem value="in_progress">En Progreso</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="closed">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="text-center py-8 text-red-600">
                <p className="font-medium">Error al cargar expedientes</p>
                <p className="text-sm">{error.message}</p>
                <Button variant="outline" onClick={handleRefresh} className="mt-2">
                  Reintentar
                </Button>
              </div>
            )}
            
            {!error && isLoading && (
              <div className="flex justify-center py-8">
                <div className="text-gray-500">Cargando expedientes...</div>
              </div>
            )}
            
            {!error && !isLoading && filteredCases.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">
                  {hasFilters 
                    ? 'No se encontraron expedientes con los filtros aplicados' 
                    : 'No hay expedientes registrados'
                  }
                </div>
                {!hasFilters && (
                  <Button onClick={handleCreateCase}>
                    Crear primer expediente
                  </Button>
                )}
              </div>
            )}
            
            {!error && !isLoading && filteredCases.length > 0 && (
              <CaseTable
                cases={filteredCases}
                onViewCase={handleViewCase}
                onEditCase={handleEditCase}
              />
            )}
          </CardContent>
        </Card>

        <CaseFormDialog
          case_={selectedCase}
          open={isCreateDialogOpen || isEditDialogOpen}
          onClose={handleDialogClose}
        />

        <CaseDetailDialog
          case_={selectedCase}
          open={isDetailDialogOpen}
          onClose={handleDialogClose}
          onEdit={handleEditCase}
        />
      </div>
    </MainLayout>
  )
}

export default Cases
