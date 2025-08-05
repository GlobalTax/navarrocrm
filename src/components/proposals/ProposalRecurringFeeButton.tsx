
import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useCreateRecurringFeeFromProposal } from '@/hooks/useRecurringFees'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { CheckCircle, Clock, Repeat, Euro, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ProposalRecurringFeeButtonProps {
  proposal: any
  hasRecurringFee?: boolean
}

export function ProposalRecurringFeeButton({ proposal, hasRecurringFee }: ProposalRecurringFeeButtonProps) {
  const createRecurringFeeMutation = useCreateRecurringFeeFromProposal()

  const canCreateRecurringFee = proposal.status === 'won' && 
    proposal.is_recurring && 
    !hasRecurringFee &&
    (proposal.retainer_amount > 0 || proposal.total_amount > 0)

  const handleCreateRecurringFee = async () => {
    await createRecurringFeeMutation.mutateAsync(proposal.id)
  }

  if (hasRecurringFee) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Cuota recurrente activa</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!canCreateRecurringFee) {
    return null
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-blue-200 bg-blue-50 hover:bg-blue-100">
          <Repeat className="w-4 h-4 mr-2" />
          Crear Cuota Recurrente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Cuota Recurrente</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Detalles de la Cuota</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Propuesta:</span>
                <span className="font-medium">{proposal.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Cliente:</span>
                <span className="font-medium">{proposal.client?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Importe:</span>
                <span className="font-medium text-green-600">
                  {(proposal.retainer_amount || proposal.total_amount).toLocaleString()} €
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Frecuencia:</span>
                <span className="font-medium">
                  {proposal.recurring_frequency === 'monthly' ? 'Mensual' :
                   proposal.recurring_frequency === 'quarterly' ? 'Trimestral' :
                   proposal.recurring_frequency === 'yearly' ? 'Anual' : 'Mensual'}
                </span>
              </div>
              {proposal.included_hours > 0 && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Horas incluidas:</span>
                  <span className="font-medium">{proposal.included_hours}h</span>
                </div>
              )}
              {proposal.contract_start_date && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Inicio:</span>
                  <span className="font-medium">
                    {format(new Date(proposal.contract_start_date), 'dd/MM/yyyy', { locale: es })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">¿Qué sucederá?</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Se creará una cuota recurrente automática</li>
                  <li>Las facturas se generarán según la frecuencia</li>
                  <li>Se hará seguimiento automático de las horas</li>
                  <li>Recibirás notificaciones de vencimientos</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  className="flex-1"
                  disabled={createRecurringFeeMutation.isPending}
                >
                  {createRecurringFeeMutation.isPending ? 'Creando...' : 'Crear Cuota Recurrente'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Confirmar creación?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se creará una cuota recurrente basada en esta propuesta. 
                    Las facturas se generarán automáticamente según la configuración.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCreateRecurringFee}>
                    Crear Cuota
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                Cancelar
              </Button>
            </DialogTrigger>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
