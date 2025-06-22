
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Download, 
  Filter, 
  Search, 
  TrendingUp, 
  Clock, 
  Users, 
  Euro,
  FileText,
  AlertTriangle,
  Zap
} from 'lucide-react'
import { useRecurringFees, useGenerateInvoices, useUpdateRecurringFee, useDeleteRecurringFee } from '@/hooks/useRecurringFees'
import { useClients } from '@/hooks/useClients'
import { RecurringFeeForm } from '@/components/recurring-fees/RecurringFeeForm'
import { RecurringFeeCard } from '@/components/recurring-fees/RecurringFeeCard'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { format, isAfter } from 'date-fns'
import { es } from 'date-fns/locale'

const RecurrentFees = () => {
  const [filters, setFilters] = useState({
    status: 'all',
    client: '',
    frequency: 'all',
    priority: 'all',
    search: ''
  })
  const [showForm, setShowForm] = useState(false)
  const [editingFee, setEditingFee] = useState(null)
  const [deletingFee, setDeletingFee] = useState(null)

  const { data: recurringFees = [], isLoading } = useRecurringFees(filters)
  const { clients } = useClients()
  const generateInvoicesMutation = useGenerateInvoices()
  const updateFeeMutation = useUpdateRecurringFee()
  const deleteFeeMutation = useDeleteRecurringFee()
  const { toast } = useToast()

  // Filtrar por búsqueda de texto
  const filteredFees = recurringFees.filter(fee => 
    filters.search === '' || 
    fee.name.toLowerCase().includes(filters.search.toLowerCase()) ||
    fee.client?.name.toLowerCase().includes(filters.search.toLowerCase()) ||
    fee.description?.toLowerCase().includes(filters.search.toLowerCase())
  )

  // Calcular métricas
  const metrics = {
    total: recurringFees.length,
    active: recurringFees.filter(f => f.status === 'active').length,
    overdue: recurringFees.filter(f => f.status === 'active' && isAfter(new Date(), new Date(f.next_billing_date))).length,
    monthlyRevenue: recurringFees
      .filter(f => f.status === 'active')
      .reduce((sum, f) => {
        const multiplier = f.frequency === 'yearly' ? 1/12 : 
                          f.frequency === 'quarterly' ? 1/3 : 1
        return sum + (f.amount * multiplier)
      }, 0)
  }

  const handleEdit = (fee) => {
    setEditingFee(fee)
    setShowForm(true)
  }

  const handleDelete = (fee) => {
    setDeletingFee(fee)
  }

  const confirmDelete = async () => {
    if (deletingFee) {
      await deleteFeeMutation.mutateAsync(deletingFee.id)
      setDeletingFee(null)
    }
  }

  const handleToggleStatus = async (fee) => {
    const newStatus = fee.status === 'active' ? 'paused' : 'active'
    await updateFeeMutation.mutateAsync({
      id: fee.id,
      data: { status: newStatus }
    })
  }

  const handleViewDetails = (fee) => {
    // TODO: Implementar vista de detalles
    toast({
      title: 'Próximamente',
      description: 'La vista de detalles estará disponible pronto'
    })
  }

  const handleGenerateInvoices = async () => {
    await generateInvoicesMutation.mutateAsync()
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingFee(null)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingFee(null)
  }

  const exportToCSV = () => {
    const headers = ['Nombre', 'Cliente', 'Importe', 'Frecuencia', 'Estado', 'Próxima Facturación']
    const csvData = filteredFees.map(fee => [
      fee.name,
      fee.client?.name || '',
      fee.amount.toFixed(2),
      fee.frequency,
      fee.status,
      format(new Date(fee.next_billing_date), 'dd/MM/yyyy')
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cuotas-recurrentes-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cuotas Recurrentes</h1>
        <p className="text-gray-600">
          Sistema integral de gestión de cuotas recurrentes y facturación automática
        </p>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cuotas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.active} activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.monthlyRevenue.toFixed(0)} €
            </div>
            <p className="text-xs text-muted-foreground">
              Estimado mensual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.active}</div>
            <p className="text-xs text-muted-foreground">
              En funcionamiento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.overdue}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Acciones principales */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Cuota Recurrente
          </Button>
          <Button 
            variant="outline" 
            onClick={handleGenerateInvoices}
            disabled={generateInvoicesMutation.isPending}
          >
            <Zap className="w-4 h-4 mr-2" />
            {generateInvoicesMutation.isPending ? 'Generando...' : 'Generar Facturas'}
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cuotas..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="paused">Pausado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.frequency}
              onValueChange={(value) => setFilters(prev => ({ ...prev, frequency: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Frecuencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las frecuencias</SelectItem>
                <SelectItem value="monthly">Mensual</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priority}
              onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => setFilters({ status: 'all', client: '', frequency: 'all', priority: 'all', search: '' })}
            >
              <Filter className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de cuotas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFees.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay cuotas recurrentes</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.status !== 'all' || filters.frequency !== 'all' || filters.priority !== 'all'
                ? 'No se encontraron cuotas que coincidan con los filtros.'
                : 'Comienza creando tu primera cuota recurrente.'}
            </p>
            {!filters.search && filters.status === 'all' && filters.frequency === 'all' && filters.priority === 'all' && (
              <Button className="mt-4" onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Cuota Recurrente
              </Button>
            )}
          </div>
        ) : (
          filteredFees.map((fee) => (
            <RecurringFeeCard
              key={fee.id}
              recurringFee={fee}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onViewDetails={handleViewDetails}
            />
          ))
        )}
      </div>

      {/* Dialog para formulario */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFee ? 'Editar Cuota Recurrente' : 'Nueva Cuota Recurrente'}
            </DialogTitle>
          </DialogHeader>
          <RecurringFeeForm
            recurringFee={editingFee}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={!!deletingFee} onOpenChange={() => setDeletingFee(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la cuota recurrente
              "{deletingFee?.name}" y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default RecurrentFees
