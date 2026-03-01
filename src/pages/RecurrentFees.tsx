import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { format, isAfter } from 'date-fns'
import { es } from 'date-fns/locale'

import { useRecurringFees, useGenerateInvoices, useUpdateRecurringFee, useDeleteRecurringFee } from '@/hooks/useRecurringFees'
import { useAllRecurringFeesHours } from '@/hooks/recurringFees/useRecurringFeeTimeEntries'
import { RecurringFeeForm } from '@/components/recurring-fees/RecurringFeeForm'
import { RecurringFeesMetrics } from '@/components/recurring-fees/RecurringFeesMetrics'
import { RecurringFeesActions } from '@/components/recurring-fees/RecurringFeesActions'
import { RecurringFeesFilters } from '@/components/recurring-fees/RecurringFeesFilters'
import { RecurringFeesList } from '@/components/recurring-fees/RecurringFeesList'
import { RecurringFeesDashboard } from '@/components/recurring-fees/RecurringFeesDashboard'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Link } from 'react-router-dom'

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
  const generateInvoicesMutation = useGenerateInvoices()
  const updateFeeMutation = useUpdateRecurringFee()
  const deleteFeeMutation = useDeleteRecurringFee()

  // Horas consumidas por cuota
  const feesWithHours = recurringFees
    .filter(f => f.status === 'active' && f.included_hours > 0)
    .map(f => ({ id: f.id, frequency: f.frequency, included_hours: f.included_hours, hourly_rate_extra: f.hourly_rate_extra }))
  const { data: hoursMap = {} } = useAllRecurringFeesHours(feesWithHours)

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

  // Verificar si hay filtros activos
  const hasFilters = filters.search !== '' || 
                    filters.status !== 'all' || 
                    filters.frequency !== 'all' || 
                    filters.priority !== 'all'

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
    toast.success('Próximamente: La vista de detalles estará disponible pronto')
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

  const handleNewFee = () => {
    setShowForm(true)
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
    <StandardPageContainer>
      <StandardPageHeader
        title="Cuotas Recurrentes"
        description="Sistema integral de gestión de cuotas recurrentes y facturación automática"
        badges={[
          {
            label: `${metrics.active} activas`,
            variant: 'outline',
            color: 'text-green-600 border-green-200 bg-green-50'
          },
          {
            label: `${metrics.overdue} vencidas`,
            variant: 'outline',
            color: metrics.overdue > 0 ? 'text-red-600 border-red-200 bg-red-50' : 'text-gray-600 border-gray-200 bg-gray-50'
          },
          {
            label: `€${metrics.monthlyRevenue.toFixed(0)}/mes`,
            variant: 'outline',
            color: 'text-blue-600 border-blue-200 bg-blue-50'
          }
        ]}
        primaryAction={{
          label: 'Nueva Cuota',
          onClick: handleNewFee
        }}
        actions={
          <div className="flex gap-2">
            <Link to="/recurring-services/dashboard" className="underline text-sm">Dashboard servicios</Link>
            <Link to="/reports/monthly-service-hours" className="underline text-sm">Reporte mensual</Link>
          </div>
        }
      />

      <RecurringFeesDashboard fees={recurringFees} hoursMap={hoursMap} />

      <RecurringFeesActions
        onNewFee={handleNewFee}
        onGenerateInvoices={handleGenerateInvoices}
        onExportCSV={exportToCSV}
        isGeneratingInvoices={generateInvoicesMutation.isPending}
      />

      <RecurringFeesFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      <RecurringFeesList
        fees={filteredFees}
        hasFilters={hasFilters}
        hoursMap={hoursMap}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onViewDetails={handleViewDetails}
        onNewFee={handleNewFee}
      />

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
    </StandardPageContainer>
  )
}

export default RecurrentFees
