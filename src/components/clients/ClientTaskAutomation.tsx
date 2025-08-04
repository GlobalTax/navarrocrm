import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Settings, Calendar, CheckCircle, AlertCircle } from 'lucide-react'
import { useRecurringFees } from '@/features/billing'
import { TaskTemplateDialog } from './TaskTemplateDialog'
import type { RecurringFee } from '@/types/recurringFees'

interface ClientTaskAutomationProps {
  clientId: string
  clientName: string
}

interface TaskTemplate {
  id: string
  name: string
  description: string
  days_before_billing: number
  estimated_hours: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to?: string
}

export const ClientTaskAutomation = ({ clientId, clientName }: ClientTaskAutomationProps) => {
  const [selectedFee, setSelectedFee] = useState<RecurringFee | null>(null)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)

  const { data: recurringFees = [], isLoading } = useRecurringFees({ 
    client_id: clientId 
  })

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'monthly': return 'Mensual'
      case 'quarterly': return 'Trimestral'
      case 'yearly': return 'Anual'
      default: return frequency
    }
  }

  const getNextBillingDate = (fee: RecurringFee) => {
    if (!fee.next_billing_date) return 'No definida'
    const date = new Date(fee.next_billing_date)
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const mockTaskTemplates: TaskTemplate[] = [
    {
      id: '1',
      name: 'Preparar facturación',
      description: 'Revisar horas del período y preparar documentos para facturación',
      days_before_billing: 3,
      estimated_hours: 1,
      priority: 'high',
    },
    {
      id: '2', 
      name: 'Recordatorio de pago',
      description: 'Enviar recordatorio amable sobre próxima fecha de facturación',
      days_before_billing: 7,
      estimated_hours: 0.5,
      priority: 'medium',
    }
  ]

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (recurringFees.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No hay cuotas recurrentes
          </h3>
          <p className="text-muted-foreground mb-4">
            Este cliente no tiene cuotas recurrentes configuradas. Las tareas automáticas se basan en las cuotas recurrentes.
          </p>
          <Button variant="outline" size="sm">
            Configurar cuota recurrente
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-foreground">Automatización de Tareas</h3>
          <p className="text-sm text-muted-foreground">
            Configura tareas automáticas basadas en las cuotas recurrentes de {clientName}
          </p>
        </div>
        
        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Plantilla
            </Button>
          </DialogTrigger>
          <TaskTemplateDialog
            isOpen={isTemplateDialogOpen}
            onClose={() => setIsTemplateDialogOpen(false)}
          />
        </Dialog>
      </div>

      {/* Cuotas Recurrentes */}
      <div className="grid gap-4">
        {recurringFees.map((fee) => (
          <Card key={fee.id} className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{fee.name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="h-5">
                      {getFrequencyLabel(fee.frequency)}
                    </Badge>
                    <span>€{fee.amount}</span>
                    <span>•</span>
                    <span>Próxima: {getNextBillingDate(fee)}</span>
                  </div>
                </div>
                <Badge 
                  variant={fee.status === 'active' ? 'default' : 'secondary'}
                  className="h-5"
                >
                  {fee.status === 'active' ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>{mockTaskTemplates.length} tareas automáticas configuradas</span>
                </div>

                {/* Templates activas para esta cuota */}
                <div className="space-y-2">
                  {mockTaskTemplates.map((template) => (
                    <div 
                      key={template.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium">{template.name}</h4>
                          <Badge variant="outline" className="h-4 text-xs">
                            {template.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Se crea {template.days_before_billing} días antes de la facturación
                        </p>
                      </div>
                      
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    Próximas tareas se crearán automáticamente
                  </div>
                  <Button size="sm" variant="outline">
                    Configurar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}