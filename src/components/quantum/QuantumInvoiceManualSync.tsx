import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSyncQuantumInvoices } from "@/hooks/quantum/useQuantumInvoices";
import { useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/contexts/AppContext";

interface QuantumInvoiceManualSyncProps {
  label?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export function QuantumInvoiceManualSync({
  label = "Sincronizar julio 2025 (mes natural)",
  startDate = "2025-07-01",
  endDate = "2025-07-31",
}: QuantumInvoiceManualSyncProps) {
  const [loading, setLoading] = useState(false);
  const [invoiceType, setInvoiceType] = useState<'C' | 'P' | 'ALL'>('C');
  const [from, setFrom] = useState(startDate);
  const [to, setTo] = useState(endDate);
  const syncQuantumInvoices = useSyncQuantumInvoices();
  const queryClient = useQueryClient();
  const { user } = useApp();

  const applyPreset = (preset: 'last365' | 'range2024_2025') => {
    const today = new Date();
    if (preset === 'last365') {
      const past = new Date();
      past.setDate(today.getDate() - 365);
      setFrom(past.toISOString().slice(0, 10));
      setTo(today.toISOString().slice(0, 10));
    } else if (preset === 'range2024_2025') {
      setFrom('2024-01-01');
      setTo('2025-12-31');
    }
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      toast.info(`Sincronizando Quantum: ${from} → ${to} [${invoiceType}]`);

      const orgId = user?.org_id;
      if (!orgId) {
        throw new Error("No se pudo obtener la organización actual");
      }

      const result = await syncQuantumInvoices({
        org_id: orgId as string,
        start_date: from,
        end_date: to,
        invoice_type: invoiceType,
      });

      // Invalidate related queries so the dashboard refreshes
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["quantum-invoices"] }),
        queryClient.invalidateQueries({ queryKey: ["monthly-billing-stats"] }),
        queryClient.invalidateQueries({ queryKey: ["client-billing-stats"] }),
        queryClient.invalidateQueries({ queryKey: ["quantum-sync-history"] }),
      ]);

      toast.success("Sincronización completada", {
        description: typeof result === "string" ? result : "Los datos se han actualizado",
      });
    } catch (e: any) {
      console.error("[QuantumSync] Error:", e);
      toast.error("Error al sincronizar Quantum", {
        description: e?.message ?? "Revisa credenciales y conectividad",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-2">
        <select
          aria-label="Tipo de factura"
          value={invoiceType}
          onChange={(e) => setInvoiceType(e.target.value as any)}
          className="border-0.5 border-black rounded-[10px] px-2 py-1"
          disabled={loading}
        >
          <option value="C">Clientes (C)</option>
          <option value="P">Proveedores (P)</option>
          <option value="ALL">Ambos (C+P)</option>
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border-0.5 border-black rounded-[10px] px-2 py-1"
          disabled={loading}
        />
        <span>→</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border-0.5 border-black rounded-[10px] px-2 py-1"
          disabled={loading}
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => applyPreset('last365')}
          variant="outline"
          size="sm"
          className="border-0.5 border-black rounded-[10px]"
          disabled={loading}
        >
          Últimos 365 días
        </Button>
        <Button
          onClick={() => applyPreset('range2024_2025')}
          variant="outline"
          size="sm"
          className="border-0.5 border-black rounded-[10px]"
          disabled={loading}
        >
          2024-2025
        </Button>
        <Button
          onClick={handleSync}
          disabled={loading}
          className="border-0.5 border-black rounded-[10px]"
        >
          {loading ? "Sincronizando…" : label}
        </Button>
      </div>
    </div>
  );
}
