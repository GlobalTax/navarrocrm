
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useCreateScheduledReport, useUpdateScheduledReport } from '@/hooks/useScheduledReports'
import { useApp } from '@/contexts/AppContext'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface ScheduledReportFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report?: any
  onSuccess: () => void
}

export function ScheduledReportFormDialog({ 
  open, 
  onOpenChange, 
  report, 
  onSuccess 
}: ScheduledReportFormDialogProps) {
  const { user } = useApp()
  const createReport = useCreateScheduledReport()
  const updateReport = useUpdateScheduledReport()

  const [formData, setFormData] = useState({
    report_name: '',
    report_type: 'dashboard' as 'dashboard' | 'time_tracking' | 'financial' | 'cases',
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    email_recipients: [] as string[],
    metrics_included: [] as string[],
    is_enabled: true
  })

  const [newEmail, setNewEmail] = useState('')

  const availableMetrics = {
    dashboard: [
      'total_cases',
      'active_cases', 
      'total_contacts',
      'billable_hours',
      'revenue_metrics'
    ],
    time_tracking: [
      'total_hours',
      'billable_hours',
      'utilization_rate',
      'top_performers',
      'project_breakdown'
    ],
    financial: [
      'revenue',
      'expenses',
      'profit_margin',
      'outstanding_invoices',
      'payment_trends'
    ],
    cases: [
      'new_cases',
      'closed_cases',
      'case_status_distribution',
      'overdue_tasks',
      'case_completion_rate'
    ]
  }

  useEffect(() => {
    if (report) {
      setFormData({
        report_name: report.report_name || '',
        report_type: report.report_type || 'dashboard',
        frequency: report.frequency || 'weekly',
        email_recipients: report.email_recipients || [],
        metrics_included: report.metrics_included || [],
        is_enabled: report.is_enabled ?? true
      })
    } else {
      setFormData({
        report_name: '',
        report_type: 'dashboard',
        frequency: 'weekly',
        email_recipients: [],
        metrics_included: [],
        is_enabled: true
      })
    }
  }, [report, open])

  const handleAddEmail = () => {
    if (newEmail && !formData.email_recipients.includes(newEmail)) {
      setFormData(prev => ({
        ...prev,
        email_recipients: [...prev.email_recipients, newEmail]
      }))
      setNewEmail('')
    }
  }

  const handleRemoveEmail = (email: string) => {
    setFormData(prev => ({
      ...prev,
      email_recipients: prev.email_recipients.filter(e => e !== email)
    }))
  }

  const handleMetricToggle = (metric: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      metrics_included: checked 
        ? [...prev.metrics_included, metric]
        : prev.metrics_included.filter(m => m !== metric)
    }))
  }

  const calculateNextSendDate = () => {
    const now = new Date()
    switch (formData.frequency) {
      case 'daily':
        now.setDate(now.getDate() + 1)
        break
      case 'weekly':
        now.setDate(now.getDate() + 7)
        break
      case 'monthly':
        now.setMonth(now.getMonth() + 1)
        break
    }
    return now.toISOString()
  }

  const handleSubmit = () => {
    if (!user?.org_id || !user?.id) return

    const reportData = {
      ...formData,
      org_id: user.org_id,
      user_id: user.id,
      next_send_date: calculateNextSendDate()
    }

    if (report?.id) {
      updateReport.mutate({ id: report.id, ...reportData } as any)
    } else {
      createReport.mutate(reportData)
    }
    
    onSuccess()
  }

  const isValid = formData.report_name && formData.email_recipients.length > 0 && formData.metrics_included.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {report ? 'Editar Reporte' : 'Nuevo Reporte Programado'}
          </DialogTitle>
          <DialogDescription>
            Configura un reporte automático con las métricas que necesitas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="report_name">Nombre del Reporte</Label>
              <Input
                id="report_name"
                value={formData.report_name}
                onChange={(e) => setFormData(prev => ({ ...prev, report_name: e.target.value }))}
                placeholder="Ej: Reporte Semanal de Productividad"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="report_type">Tipo de Reporte</Label>
                <Select
                  value={formData.report_type}
                  onValueChange={(value: any) => setFormData(prev => ({ 
                    ...prev, 
                    report_type: value,
                    metrics_included: [] // Reset metrics when type changes
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dashboard">Dashboard General</SelectItem>
                    <SelectItem value="time_tracking">Seguimiento de Tiempo</SelectItem>
                    <SelectItem value="financial">Financiero</SelectItem>
                    <SelectItem value="cases">Casos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="frequency">Frecuencia</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, frequency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Destinatarios */}
          <div>
            <Label>Destinatarios de Email</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@ejemplo.com"
                onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
              />
              <Button type="button" onClick={handleAddEmail}>
                Añadir
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.email_recipients.map((email) => (
                <Badge key={email} variant="secondary" className="pr-1">
                  {email}
                  <button
                    onClick={() => handleRemoveEmail(email)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Métricas */}
          <div>
            <Label>Métricas a Incluir</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {availableMetrics[formData.report_type].map((metric) => (
                <div key={metric} className="flex items-center space-x-2">
                  <Checkbox
                    id={metric}
                    checked={formData.metrics_included.includes(metric)}
                    onCheckedChange={(checked) => handleMetricToggle(metric, !!checked)}
                  />
                  <Label htmlFor={metric} className="text-sm">
                    {metric.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!isValid || createReport.isPending || updateReport.isPending}
            >
              {createReport.isPending || updateReport.isPending ? 'Guardando...' : 
               report ? 'Actualizar' : 'Crear Reporte'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
