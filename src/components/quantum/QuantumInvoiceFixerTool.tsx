import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { RefreshCw, Database, AlertTriangle, CheckCircle } from "lucide-react";

interface InvoiceAuditResult {
  totalInvoices: number;
  clientInvoices: number;
  providerInvoices: number;
  emptyLines: number;
  unmappedContacts: number;
  avgAmount: number;
  earliestDate: string;
  latestDate: string;
}

export function QuantumInvoiceFixerTool() {
  const [loading, setLoading] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [auditResult, setAuditResult] = useState<InvoiceAuditResult | null>(null);
  const [fixResult, setFixResult] = useState<{ fixed: number; errors: number } | null>(null);
  const { user } = useApp();
  
  // Use org_id from user context
  const currentOrganization = user?.org_id ? { id: user.org_id } : null;

  const runAudit = async () => {
    if (!currentOrganization?.id) return;
    
    setAuditing(true);
    try {
      const { data, error } = await supabase
        .from("quantum_invoices")
        .select("*")
        .eq("org_id", currentOrganization.id);

      if (error) throw error;

      const invoices = data || [];
      const result: InvoiceAuditResult = {
        totalInvoices: invoices.length,
        clientInvoices: invoices.filter(inv => (inv.quantum_data as any)?.type === 'C').length,
        providerInvoices: invoices.filter(inv => (inv.quantum_data as any)?.type === 'P').length,
        emptyLines: invoices.filter(inv => !inv.invoice_lines || (inv.invoice_lines as any[]).length === 0).length,
        unmappedContacts: invoices.filter(inv => !inv.contact_id).length,
        avgAmount: invoices.length > 0 ? invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) / invoices.length : 0,
        earliestDate: invoices.reduce((min, inv) => !min || inv.invoice_date < min ? inv.invoice_date : min, ''),
        latestDate: invoices.reduce((max, inv) => !max || inv.invoice_date > max ? inv.invoice_date : max, '')
      };

      setAuditResult(result);
      toast.success("Auditoría completada", {
        description: `Se analizaron ${result.totalInvoices} facturas`,
      });
    } catch (error) {
      console.error("Error en auditoría:", error);
      toast.error("Error en auditoría", {
        description: "No se pudo completar la auditoría de facturas"
      });
    } finally {
      setAuditing(false);
    }
  };

  const fixInvoiceLines = async () => {
    if (!currentOrganization?.id) return;
    
    setFixing(true);
    try {
      // Obtener facturas con líneas vacías
      const { data: invoicesData, error: fetchError } = await supabase
        .from("quantum_invoices")
        .select("*")
        .eq("org_id", currentOrganization.id)
        .or("invoice_lines.is.null,invoice_lines.eq.[]");

      if (fetchError) throw fetchError;

      let fixed = 0;
      let errors = 0;

      for (const invoice of invoicesData || []) {
        try {
          // Procesar líneas de factura desde los datos fiscales
          const processedLines = [];
          const quantumData = invoice.quantum_data as any;
          if (quantumData?.tax && Array.isArray(quantumData.tax)) {
            for (const taxItem of quantumData.tax) {
              processedLines.push({
                id: `${invoice.quantum_invoice_id}-${taxItem.codigo || 'line'}`,
                description: taxItem.goodServices || 'Servicios profesionales',
                quantity: 1,
                unit_price: parseFloat(taxItem.taxableBase) || 0,
                tax_rate: parseFloat(taxItem.percentage) || 0,
                tax_amount: parseFloat(taxItem.amount) || 0,
                total_amount: (parseFloat(taxItem.taxableBase) || 0) + (parseFloat(taxItem.amount) || 0),
                tax_code: taxItem.codigo,
                tax_type: taxItem.taxType,
                account: taxItem.account
              });
            }
          }

          // Actualizar solo si hay líneas que procesar
          if (processedLines.length > 0) {
            const { error: updateError } = await supabase
              .from("quantum_invoices")
              .update({ invoice_lines: processedLines })
              .eq("id", invoice.id);

            if (updateError) {
              console.error(`Error actualizando factura ${invoice.quantum_invoice_id}:`, updateError);
              errors++;
            } else {
              fixed++;
            }
          }
        } catch (error) {
          console.error(`Error procesando factura ${invoice.quantum_invoice_id}:`, error);
          errors++;
        }
      }

      setFixResult({ fixed, errors });
      toast.success("Reparación completada", {
        description: `Se repararon ${fixed} facturas, ${errors} errores`
      });
    } catch (error) {
      console.error("Error reparando facturas:", error);
      toast.error("Error en reparación", {
        description: "No se pudo completar la reparación de facturas"
      });
    } finally {
      setFixing(false);
    }
  };

  const testSync = async (type: 'C' | 'P' | 'ALL', full = false) => {
    if (!currentOrganization?.id) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('sync-quantum-invoices', {
        body: {
          org_id: currentOrganization.id,
          start_date: '2025-01-01',
          end_date: '2025-12-31',
          invoice_type: type,
          full,
          sync_type: 'manual'
        }
      });

      if (error) throw error;

      toast.success("Sincronización exitosa", {
        description: `Sincronización tipo ${type} ${full ? '(completa)' : ''} completada`
      });
      
      // Refrescar auditoría
      setTimeout(runAudit, 1000);
    } catch (error: any) {
      console.error("Error en sincronización:", error);
      toast.error("Error en sincronización", {
        description: `Error sincronizando tipo ${type}: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0.5 border-black rounded-[10px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Herramienta de Diagnóstico y Reparación
        </CardTitle>
        <CardDescription>
          Audita y repara problemas en los datos de facturación de Quantum
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auditoría */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">1. Auditoría de Datos</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={runAudit}
              disabled={auditing}
              className="border-0.5 border-black rounded-[10px]"
            >
              {auditing ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Ejecutar Auditoría"}
            </Button>
          </div>

          {auditResult && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-2xl font-bold">{auditResult.totalInvoices}</div>
                <div className="text-sm text-muted-foreground">Total facturas</div>
              </div>
              <div className="space-y-1">
                <div className="flex gap-1">
                  <Badge variant="outline" className="border-0.5 rounded-[10px]">C: {auditResult.clientInvoices}</Badge>
                  <Badge variant="outline" className="border-0.5 rounded-[10px]">P: {auditResult.providerInvoices}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">Por tipo</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-amber-600">{auditResult.emptyLines}</div>
                <div className="text-sm text-muted-foreground">Líneas vacías</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-red-600">{auditResult.unmappedContacts}</div>
                <div className="text-sm text-muted-foreground">Sin contacto</div>
              </div>
            </div>
          )}

          {auditResult && auditResult.emptyLines > 0 && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Hay {auditResult.emptyLines} facturas con líneas de factura vacías. Esto significa que los datos fiscales no se están procesando correctamente.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Separator />

        {/* Reparación */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">2. Reparar Líneas de Factura</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fixInvoiceLines}
              disabled={fixing || !auditResult || auditResult.emptyLines === 0}
              className="border-0.5 border-black rounded-[10px]"
            >
              {fixing ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Reparar Líneas"}
            </Button>
          </div>

          {fixResult && (
            <Alert className={fixResult.errors > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Reparación completada: {fixResult.fixed} facturas reparadas, {fixResult.errors} errores
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Separator />

        {/* Pruebas de Sincronización */}
        <div className="space-y-3">
          <h3 className="font-medium">3. Pruebas de Sincronización</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => testSync('C', false)}
              disabled={loading}
              className="border-0.5 border-black rounded-[10px]"
            >
              Sync C (básico)
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => testSync('P', false)}
              disabled={loading}
              className="border-0.5 border-black rounded-[10px]"
            >
              Sync P (básico)
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => testSync('ALL', false)}
              disabled={loading}
              className="border-0.5 border-black rounded-[10px]"
            >
              Sync ALL (básico)
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => testSync('C', true)}
              disabled={loading}
              className="border-0.5 border-black rounded-[10px]"
            >
              Sync C (full)
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => testSync('P', true)}
              disabled={loading}
              className="border-0.5 border-black rounded-[10px]"
            >
              Sync P (full)
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => testSync('ALL', true)}
              disabled={loading}
              className="border-0.5 border-black rounded-[10px]"
            >
              Sync ALL (full)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}