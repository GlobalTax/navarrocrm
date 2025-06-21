
import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { AIUsageStatsCards, AIUs­ageByOrgCard } from '@/components/admin/AIUsageStats'
import { AIUsageTable } from '@/components/admin/AIUsageTable'
import { useAIUsage, useIsSuperAdmin } from '@/hooks/useAIUsage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CalendarDays, 
  Shield, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react'
import { format, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

export default function AIAdmin() {
  const { isSuperAdmin, isLoading: isLoadingRoles } = useIsSuperAdmin()
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  
  const { 
    data: usageData, 
    isLoading: isLoadingUsage, 
    error 
  } = useAIUsage(selectedMonth)

  // Verificar permisos
  if (isLoadingRoles) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    )
  }

  if (!isSuperAdmin) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Shield className="h-5 w-5" />
                Acceso Denegado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Solo los super administradores pueden acceder a esta página.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    toast.error('Error al cargar los datos de uso de IA')
  }

  const handlePreviousMonth = () => {
    setSelectedMonth(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setSelectedMonth(prev => addMonths(prev, 1))
  }

  const isCurrentMonth = format(selectedMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM')

  return (
    <MainLayout>
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🤖 Administración de IA</h1>
            <p className="text-muted-foreground">
              Monitoreo y análisis del uso del asistente de IA
            </p>
          </div>
          
          {/* Selector de mes */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md">
              <CalendarDays className="h-4 w-4" />
              <span className="font-medium min-w-[120px] text-center">
                {format(selectedMonth, 'MMMM yyyy', { locale: es })}
              </span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNextMonth}
              disabled={isCurrentMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Cards de estadísticas */}
        <AIUsageStatsCards 
          stats={usageData?.stats || {
            totalCalls: 0,
            totalTokens: 0,
            totalCost: 0,
            successRate: 0,
            avgDuration: 0,
            callsByOrg: {},
            tokensByOrg: {},
            costByOrg: {}
          }} 
          isLoading={isLoadingUsage} 
        />

        {/* Uso por organización */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <AIUsageByOrgCard 
              stats={usageData?.stats || {
                totalCalls: 0,
                totalTokens: 0,
                totalCost: 0,
                successRate: 0,
                avgDuration: 0,
                callsByOrg: {},
                tokensByOrg: {},
                costByOrg: {}
              }} 
              isLoading={isLoadingUsage} 
            />
          </div>
          
          <div className="lg:col-span-2">
            {/* Alertas y recomendaciones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Alertas y Recomendaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {usageData?.stats.totalCost && usageData.stats.totalCost > 10 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <p className="text-sm text-amber-800">
                        <strong>Costo elevado:</strong> El gasto mensual supera los $10 USD. 
                        Considera revisar el uso y optimizar las consultas.
                      </p>
                    </div>
                  )}
                  
                  {usageData?.stats.successRate && usageData.stats.successRate < 95 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">
                        <strong>Tasa de error alta:</strong> La tasa de éxito es del {usageData.stats.successRate.toFixed(1)}%. 
                        Revisa los logs para identificar problemas.
                      </p>
                    </div>
                  )}
                  
                  {usageData?.stats.totalCalls === 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Sin actividad:</strong> No se han registrado llamadas este mes. 
                        Verifica que el asistente esté funcionando correctamente.
                      </p>
                    </div>
                  )}
                  
                  {(!usageData?.stats.totalCalls || usageData.stats.totalCalls === 0) && 
                   (!usageData?.stats.successRate || usageData.stats.successRate >= 95) &&
                   (!usageData?.stats.totalCost || usageData.stats.totalCost <= 10) && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">
                        <strong>Todo funcionando bien:</strong> No se han detectado problemas importantes.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabla de logs */}
        <AIUsageTable 
          logs={usageData?.logs || []} 
          isLoading={isLoadingUsage} 
        />
      </div>
    </MainLayout>
  )
}
