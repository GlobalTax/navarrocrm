import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuantumInvoices, useClientBillingStats, useSyncQuantumInvoices } from "@/hooks/quantum/useQuantumInvoices";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Download, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  Euro,
  Calendar,
  FileText,
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "@/components/proposals/utils/proposalFormatters";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const QuantumInvoicesDashboard = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("last3months");
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);

  // Obtener org_id al cargar el componente
  useEffect(() => {
    const getCurrentOrgId = async () => {
      const { data } = await supabase.rpc('get_user_org_id');
      setCurrentOrgId(data);
    };
    getCurrentOrgId();
  }, []);

  // Calcular fechas según el período seleccionado
  const getPeriodDates = () => {
    const now = new Date();
    const startDate = new Date();
    
    switch (selectedPeriod) {
      case "currentMonth":
        startDate.setDate(1);
        break;
      case "last3months":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "last6months":
        startDate.setMonth(now.getMonth() - 6);
        break;
      case "currentYear":
        startDate.setMonth(0, 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 3);
    }
    
    return {
      start_date: startDate.toISOString().split('T')[0],
      end_date: now.toISOString().split('T')[0]
    };
  };

  const periodDates = getPeriodDates();
  
  const { data: invoices, isLoading: loadingInvoices } = useQuantumInvoices(periodDates);
  const { data: clientStats, isLoading: loadingClientStats } = useClientBillingStats();
  const syncInvoices = useSyncQuantumInvoices();

  // Calcular métricas del período
  const totalAmount = invoices?.reduce((sum, invoice) => sum + invoice.total_amount, 0) || 0;
  const totalInvoices = invoices?.length || 0;
  const averageInvoice = totalInvoices > 0 ? totalAmount / totalInvoices : 0;
  const uniqueClients = new Set(invoices?.map(inv => inv.contact_id || inv.client_name)).size;

  const handleSync = async () => {
    if (!currentOrgId) return;
    
    setIsLoading(true);
    try {
      await syncInvoices({
        org_id: currentOrgId,
        start_date: periodDates.start_date,
        end_date: periodDates.end_date
      });
      
      // Refrescar datos
      queryClient.invalidateQueries({ queryKey: ['quantum-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['client-billing-stats'] });
      
      toast.success("Facturas sincronizadas correctamente");
    } catch (error) {
      console.error('Error sincronizando:', error);
      toast.error("Error al sincronizar facturas");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Facturación Quantum</h1>
          <p className="text-muted-foreground">
            Análisis de facturación mensual por cliente
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleSync} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
        </div>
      </div>

      {/* Filtros de período */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Período de análisis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: "currentMonth", label: "Mes actual" },
              { value: "last3months", label: "Últimos 3 meses" },
              { value: "last6months", label: "Últimos 6 meses" },
              { value: "currentYear", label: "Año actual" }
            ].map((period) => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period.value)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Euro className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Facturación Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Facturas</p>
                <p className="text-2xl font-bold">{totalInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Factura Promedio</p>
                <p className="text-2xl font-bold">{formatCurrency(averageInvoice)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Clientes Únicos</p>
                <p className="text-2xl font-bold">{uniqueClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes vistas */}
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Facturas</TabsTrigger>
          <TabsTrigger value="clients">Por Cliente</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Facturas del Período</CardTitle>
              <CardDescription>
                {format(new Date(periodDates.start_date), "d 'de' MMMM", { locale: es })} - {format(new Date(periodDates.end_date), "d 'de' MMMM 'de' yyyy", { locale: es })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingInvoices ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Cargando facturas...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invoices?.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No hay facturas en este período</p>
                      <Button onClick={handleSync} className="mt-4" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sincronizar ahora
                      </Button>
                    </div>
                  ) : (
                    invoices?.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium">{invoice.client_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {invoice.series_and_number} • {format(new Date(invoice.invoice_date), "d 'de' MMMM 'de' yyyy", { locale: es })}
                              </p>
                            </div>
                            {!invoice.contact_id && (
                              <Badge variant="outline" className="text-xs">
                                No mapeado
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{formatCurrency(invoice.total_amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {invoice.invoice_lines?.length || 0} líneas
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Facturación por Cliente</CardTitle>
              <CardDescription>Últimos 12 meses</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingClientStats ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Cargando estadísticas...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientStats?.map((client, index) => (
                    <div
                      key={`${client.contact_id || client.client_name}-${index}`}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{client.client_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {client.invoice_count} facturas • Última: {format(new Date(client.last_invoice_date), "MMM yyyy", { locale: es })}
                            </p>
                          </div>
                          {!client.is_mapped && (
                            <Badge variant="outline" className="text-xs">
                              No mapeado
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(client.total_billed)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(client.total_billed / client.invoice_count)}/factura
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Tendencias de Facturación</CardTitle>
              <CardDescription>Análisis mensual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Gráficos de tendencias próximamente</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};