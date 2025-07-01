
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { useScheduledReports, useUpdateScheduledReport, useDeleteScheduledReport } from '@/hooks/useScheduledReports'
import { ScheduledReportFormDialog } from './ScheduledReportFormDialog'
import { Plus, Calendar, Mail, BarChart3, Trash2, Edit } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function ScheduledReportsManager() {
  const { data: reports, isLoading } = useScheduledReports()
  const updateReport = useUpdateScheduledReport()
  const deleteReport = useDeleteScheduledReport()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReport, setEditingReport] = useState(null)

  const handleToggleEnabled = (reportId: string, isEnabled: boolean) => {
    updateReport.mutate({
      id: reportId,
      is_enabled: isEnabled
    } as any)
  }

  const handleEdit = (report: any) => {
    setEditingReport(report)
    setIsDialogOpen(true)
  }

  const handleDelete = (reportId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este reporte?')) {
      deleteReport.mutate(reportId)
    }
  }

  const getFrequencyBadge = (frequency: string) => {
    const colors = {
      daily: 'bg-green-100 text-green-800',
      weekly: 'bg-blue-100 text-blue-800',
      monthly: 'bg-purple-100 text-purple-800'
    }
    return colors[frequency as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getReportTypeIcon = (type: string) => {
    const icons = {
      dashboard: BarChart3,
      time_tracking: Calendar,
      financial: Mail,
      cases: Calendar
    }
    const Icon = icons[type as keyof typeof icons] || BarChart3
    return <Icon className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reportes Programados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reportes Programados
          </CardTitle>
          <CardDescription>
            Configura reportes automáticos para recibir métricas clave por email
          </CardDescription>
        </div>
        <Button 
          onClick={() => {
            setEditingReport(null)
            setIsDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Reporte
        </Button>
      </CardHeader>
      <CardContent>
        {!reports || reports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No hay reportes programados</p>
            <p className="text-sm">Crea tu primer reporte automático</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reporte</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Frecuencia</TableHead>
                <TableHead>Próximo envío</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report: any) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{report.report_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {report.email_recipients?.length || 0} destinatarios
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getReportTypeIcon(report.report_type)}
                      <span className="capitalize">{report.report_type.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getFrequencyBadge(report.frequency)}>
                      {report.frequency === 'daily' ? 'Diario' :
                       report.frequency === 'weekly' ? 'Semanal' : 'Mensual'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {report.next_send_date ? 
                      format(new Date(report.next_send_date), 'dd MMM yyyy', { locale: es }) :
                      'No programado'
                    }
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={report.is_enabled}
                      onCheckedChange={(checked) => handleToggleEnabled(report.id, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(report)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(report.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <ScheduledReportFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        report={editingReport}
        onSuccess={() => {
          setIsDialogOpen(false)
          setEditingReport(null)
        }}
      />
    </Card>
  )
}
