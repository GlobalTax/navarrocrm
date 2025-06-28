
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Filter, Calendar } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

export const CustomTab = () => {
  const [reportType, setReportType] = useState<string>('')
  const [period, setPeriod] = useState<string>('')

  const handleGenerateReport = () => {
    console.log('Generando reporte:', { reportType, period })
    // Aquí implementarías la lógica de generación real
  }

  const reportTypes = [
    { value: 'revenue', label: 'Reporte de Ingresos' },
    { value: 'productivity', label: 'Reporte de Productividad' },
    { value: 'clients', label: 'Análisis de Clientes' },
    { value: 'time-tracking', label: 'Control de Tiempo' },
    { value: 'proposals', label: 'Análisis de Propuestas' }
  ]

  const periods = [
    { value: 'last-week', label: 'Última Semana' },
    { value: 'last-month', label: 'Último Mes' },
    { value: 'last-quarter', label: 'Último Trimestre' },
    { value: 'last-year', label: 'Último Año' },
    { value: 'custom', label: 'Período Personalizado' }
  ]

  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generador de Reportes Personalizados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tipo de Reporte</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo de reporte" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Período</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un período" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleGenerateReport}
              disabled={!reportType || !period}
              className="bg-slate-900 hover:bg-slate-800"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generar Reporte
            </Button>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avanzados
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-slate-900">
            Reportes Programados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-slate-600" />
                <div>
                  <div className="font-medium text-slate-900">Reporte Mensual de Ingresos</div>
                  <div className="text-sm text-slate-600">Se envía cada 1 del mes</div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Editar
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-slate-600" />
                <div>
                  <div className="font-medium text-slate-900">Análisis Semanal de Productividad</div>
                  <div className="text-sm text-slate-600">Se envía cada lunes</div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Editar
              </Button>
            </div>

            <Button variant="outline" className="w-full mt-4">
              + Programar Nuevo Reporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
