
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Euro, Calendar, AlertCircle, FileText } from 'lucide-react'
import { useRecurringFees } from '@/hooks/useRecurringFees'
import { RecurringFeeCard } from '@/components/recurring-fees/RecurringFeeCard'
import { ContactRecurringFeeForm } from './ContactRecurringFeeForm'
import { useDeleteRecurringFee, useUpdateRecurringFee } from '@/hooks/recurringFees/useRecurringFeesMutations'
import { useNavigate } from 'react-router-dom'
import type { RecurringFee } from '@/types/recurringFees'

interface ContactRecurringFeesTabProps {
  contactId: string
  contactName: string
}

export const ContactRecurringFeesTab = ({ contactId, contactName }: ContactRecurringFeesTabProps) => {
  const navigate = useNavigate()
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [editingFee, setEditingFee] = useState<RecurringFee | null>(null)

  const { data: recurringFees = [], isLoading, refetch } = useRecurringFees({ 
    client_id: contactId 
  })

  const deleteRecurringFee = useDeleteRecurringFee()
  const updateRecurringFee = useUpdateRecurringFee()

  // Métricas calculadas
  const activeFeesCount = recurringFees.filter(fee => fee.status === 'active').length
  const totalMonthlyAmount = recurringFees
    .filter(fee => fee.status === 'active')
    .reduce((sum, fee) => {
      switch (fee.frequency) {
        case 'monthly': return sum + fee.amount
        case 'quarterly': return sum + (fee.amount / 3)
        case 'yearly': return sum + (fee.amount / 12)
        default: return sum
      }
    }, 0)

  const overdueFeesCount = recurringFees.filter(fee => 
    fee.status === 'active' && 
    new Date(fee.next_billing_date) < new Date()
  ).length

  const handleEdit = (fee: RecurringFee) => {
    setEditingFee(fee)
  }

  const handleDelete = async (fee: RecurringFee) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la cuota "${fee.name}"?`)) {
      await deleteRecurringFee.mutateAsync(fee.id)
      refetch()
    }
  }

  const handleToggleStatus = async (fee: RecurringFee) => {
    const newStatus = fee.status === 'active' ? 'paused' : 'active'
    await updateRecurringFee.mutateAsync({
      id: fee.id,
      data: { status: newStatus }
    })
    refetch()
  }

  const handleViewDetails = (fee: RecurringFee) => {
    navigate(`/recurring-fees?id=${fee.id}`)
  }

  const handleCloseForm = () => {
    setIsCreateFormOpen(false)
    setEditingFee(null)
    refetch()
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Cuotas Recurrentes</h3>
          <p className="text-sm text-muted-foreground">
            Gestión de facturación recurrente para {contactName}
          </p>
        </div>
        <Button onClick={() => setIsCreateFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cuota
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Euro className="w-4 h-4 text-green-600" />
              Ingresos Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              €{totalMonthlyAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Basado en cuotas activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Cuotas Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {activeFeesCount}
            </div>
            <p className="text-xs text-muted-foreground">
              De {recurringFees.length} totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              Vencidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overdueFeesCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      {recurringFees.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Euro className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No hay cuotas recurrentes
            </h3>
            <p className="text-muted-foreground mb-4">
              Este contacto no tiene cuotas recurrentes configuradas.
            </p>
            <Button onClick={() => setIsCreateFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Cuota
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recurringFees.map((fee) => (
            <div key={fee.id} className="space-y-4">
              {fee.proposal && (
                <div className="text-sm bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-700">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">Propuesta asociada:</span>
                  </div>
                  <div className="mt-1 text-blue-600">
                    <p className="font-medium">{fee.proposal.title}</p>
                    <p className="text-xs">
                      #{fee.proposal.proposal_number} • {fee.proposal.status}
                    </p>
                  </div>
                </div>
              )}
              
              <RecurringFeeCard
                recurringFee={fee}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onViewDetails={handleViewDetails}
              />
            </div>
          ))}
        </div>
      )}

      <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Cuota Recurrente para {contactName}</DialogTitle>
          </DialogHeader>
          <ContactRecurringFeeForm
            contactId={contactId}
            onSuccess={handleCloseForm}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingFee} onOpenChange={(open) => !open && setEditingFee(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cuota Recurrente</DialogTitle>
          </DialogHeader>
          {editingFee && (
            <ContactRecurringFeeForm
              contactId={contactId}
              recurringFee={editingFee}
              onSuccess={handleCloseForm}
              onCancel={handleCloseForm}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
