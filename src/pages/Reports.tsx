
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  Users,
  Clock,
  Euro
} from 'lucide-react'

const Reports = () => {
  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Reportes"
        description="Análisis y reportes del despacho"
        primaryAction={{
          label: 'Generar Reporte',
          onClick: () => console.log('Generate report')
        }}
      />

      {/* Métricas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-slate-900">€12.450</div>
            <div className="text-sm text-slate-600">Ingresos del Mes</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-blue-700">156</div>
            <div className="text-sm text-slate-600">Horas Facturadas</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-emerald-700">89%</div>
            <div className="text-sm text-slate-600">Utilización</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-red-700">28</div>
            <div className="text-sm text-slate-600">DSO Días</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-50 border border-slate-200">
          <TabsTrigger value="financial" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600">
            Financiero
          </TabsTrigger>
          <TabsTrigger value="productivity" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600">
            Productividad
          </TabsTrigger>
          <TabsTrigger value="clients" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600">
            Clientes
          </TabsTrigger>
          <TabsTrigger value="custom" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600">
            Personalizados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-slate-900 flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Ingresos por Mes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>Gráfico de ingresos disponible próximamente</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Facturación por Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-900">Cliente A</span>
                    <span className="text-slate-700">€3.500</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-900">Cliente B</span>
                    <span className="text-slate-700">€2.800</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-900">Cliente C</span>
                    <span className="text-slate-700">€2.100</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-6 mt-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium text-slate-900 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Productividad del Equipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>Reportes de productividad disponibles próximamente</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6 mt-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Análisis de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>Análisis de clientes disponible próximamente</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6 mt-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Reportes Personalizados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-600 mb-4">Crea reportes personalizados según tus necesidades</p>
                <Button className="bg-slate-900 hover:bg-slate-800">
                  <Download className="h-4 w-4 mr-2" />
                  Crear Reporte
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </StandardPageContainer>
  )
}

export default Reports
