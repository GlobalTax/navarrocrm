import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Plus, 
  Building2, 
  Users, 
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { useDepartments } from '@/hooks/useDepartments'
import { DepartmentCard } from './DepartmentCard'
import { DepartmentDialog } from './DepartmentDialog'
import type { Department } from '@/hooks/useTeams'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export const DepartmentManagement = () => {
  const { departments, isLoading, deleteDepartment } = useDepartments()
  const [searchTerm, setSearchTerm] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null)

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateDepartment = () => {
    setSelectedDepartment(null)
    setDialogMode('create')
    setShowDialog(true)
  }

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department)
    setDialogMode('edit')
    setShowDialog(true)
  }

  const handleDeleteDepartment = (department: Department) => {
    setDepartmentToDelete(department)
    setShowDeleteAlert(true)
  }

  const confirmDelete = async () => {
    if (departmentToDelete) {
      await deleteDepartment(departmentToDelete.id)
      setShowDeleteAlert(false)
      setDepartmentToDelete(null)
    }
  }

  const activeDepartments = departments.filter(d => d.is_active).length

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border-0.5 border-black rounded-[10px]">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Departamentos Activos</p>
                <p className="text-2xl font-bold">{activeDepartments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Departamentos</p>
                <p className="text-2xl font-bold">{departments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Promedio por Depto</p>
                <p className="text-2xl font-bold">
                  {activeDepartments > 0 ? Math.round(departments.length / activeDepartments * 10) / 10 : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Gestión de Departamentos</span>
            </CardTitle>
            <Button
              onClick={handleCreateDepartment}
              className="bg-primary text-white border-0.5 border-black rounded-[10px] hover-lift"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Departamento
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar departamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-0.5 border-black rounded-[10px]"
            />
          </div>

          {/* Departments Grid */}
          {filteredDepartments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDepartments.map(department => (
                <DepartmentCard
                  key={department.id}
                  department={department}
                  onEdit={handleEditDepartment}
                  onDelete={handleDeleteDepartment}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron departamentos' : 'No hay departamentos'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Intenta con otro término de búsqueda' 
                  : 'Comienza creando tu primer departamento'
                }
              </p>
              {!searchTerm && (
                <Button
                  onClick={handleCreateDepartment}
                  className="bg-primary text-white border-0.5 border-black rounded-[10px] hover-lift"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Departamento
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <DepartmentDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        department={selectedDepartment}
        mode={dialogMode}
      />

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="bg-white border-0.5 border-black rounded-[10px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span>¿Desactivar departamento?</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres desactivar el departamento "{departmentToDelete?.name}"? 
              Esta acción no se puede deshacer y ocultará el departamento de las listas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-0.5 border-black rounded-[10px]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white border-0.5 border-black rounded-[10px]"
            >
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}