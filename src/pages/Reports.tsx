
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReportsMetricsCards } from '@/components/reports/ReportsMetricsCards'
import { FinancialTab } from '@/components/reports/FinancialTab'
import { ProductivityTab } from '@/components/reports/ProductivityTab'
import { ClientsTab } from '@/components/reports/ClientsTab'
import { CustomTab } from '@/components/reports/CustomTab'

const Reports = () => {
  const handleGenerateReport = () => {
    console.log('Generando reporte personalizado...')
  }

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Reportes"
        description="Análisis y reportes del despacho"
        primaryAction={{
          label: 'Generar Reporte',
          onClick: handleGenerateReport
        }}
      />

      <ReportsMetricsCards />

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
          <FinancialTab />
        </TabsContent>

        <TabsContent value="productivity" className="space-y-6 mt-6">
          <ProductivityTab />
        </TabsContent>

        <TabsContent value="clients" className="space-y-6 mt-6">
          <ClientsTab />
        </TabsContent>

        <TabsContent value="custom" className="space-y-6 mt-6">
          <CustomTab />
        </TabsContent>
      </Tabs>
    </StandardPageContainer>
  )
}

export default Reports
