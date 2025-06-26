
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Plus, 
  FileText, 
  Calendar, 
  Users, 
  Download,
  Settings,
  Clock
} from 'lucide-react'
import { CustomReport } from '@/types/analytics'

interface CustomReportsPanelProps {
  reports: CustomReport[]
  onCreateReport: () => void
}

export const CustomReportsPanel: React.FC<CustomReportsPanelProps> = ({
  reports,
  onCreateReport
}) => {
  const [selectedReport, setSelectedReport] = useState<CustomReport | null>(null)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getScheduleBadgeColor = (schedule?: string) => {
    switch (schedule) {
      case 'daily': return 'bg-green-100 text-green-800'
      case 'weekly': return 'bg-blue-100 text-blue-800'
      case 'monthly': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Reportes Personalizados</h3>
          <p className="text-gray-600">Crea y gestiona reportes automatizados</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={onCreateReport}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Reporte
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Reporte Personalizado</DialogTitle>
              <DialogDescription>
                Esta funcionalidad estará disponible próximamente
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de reportes */}
      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No hay reportes personalizados
            </h3>
            <p className="text-gray-500 text-center max-w-md mb-4">
              Crea tu primer reporte personalizado para automatizar el análisis de datos específicos de tu despacho.
            </p>
            <Button onClick={onCreateReport}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Reporte
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{report.name}</CardTitle>
                    {report.description && (
                      <CardDescription className="mt-1">
                        {report.description}
                      </CardDescription>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Métricas incluidas */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Métricas incluidas:</h4>
                  <div className="flex flex-wrap gap-1">
                    {report.metrics.slice(0, 3).map((metric) => (
                      <Badge key={metric} variant="outline" className="text-xs">
                        {metric}
                      </Badge>
                    ))}
                    {report.metrics.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{report.metrics.length - 3} más
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Programación */}
                {report.schedule && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <Badge className={getScheduleBadgeColor(report.schedule)}>
                      {report.schedule === 'daily' ? 'Diario' : 
                       report.schedule === 'weekly' ? 'Semanal' : 'Mensual'}
                    </Badge>
                  </div>
                )}

                {/* Destinatarios */}
                {report.recipients.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {report.recipients.length} destinatario{report.recipients.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {/* Última generación */}
                {report.lastGenerated && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Último: {formatDate(report.lastGenerated)}</span>
                  </div>
                )}

                {/* Próxima generación */}
                {report.nextGeneration && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Próximo: {formatDate(report.nextGeneration)}</span>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Ver Reporte
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Plantillas de reportes */}
      <div>
        <h4 className="text-md font-semibold mb-4">Plantillas de Reportes</h4>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Reporte Financiero Mensual",
              description: "Análisis completo de ingresos, gastos y rentabilidad",
              metrics: ["Ingresos", "MRR", "Conversión", "Rentabilidad"]
            },
            {
              name: "Productividad del Equipo",
              description: "Métricas de rendimiento y utilización del personal",
              metrics: ["Horas facturables", "Utilización", "Casos completados"]
            },
            {
              name: "Análisis de Clientes",
              description: "Comportamiento y valor de cartera de clientes",
              metrics: ["CLV", "Churn", "Satisfacción", "Nuevos clientes"]
            }
          ].map((template, index) => (
            <Card key={index} className="border-dashed border-2 hover:border-blue-300 transition-colors">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.description}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {template.metrics.map((metric) => (
                      <Badge key={metric} variant="outline" className="text-xs">
                        {metric}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button size="sm" variant="outline" className="w-full" onClick={onCreateReport}>
                    <Plus className="h-4 w-4 mr-2" />
                    Usar Plantilla
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
