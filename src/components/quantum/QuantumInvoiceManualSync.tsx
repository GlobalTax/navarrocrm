import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSyncQuantumInvoices } from "@/hooks/quantum/useQuantumInvoices";
import { useQueryClient } from "@tanstack/react-query";

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
  const syncQuantumInvoices = useSyncQuantumInvoices();
  const queryClient = useQueryClient();

  const handleSync = async () => {
    try {
      setLoading(true);
      toast.info(`Sincronizando Quantum: ${startDate} → ${endDate}`);

      const { data: orgId, error: orgErr } = await supabase.rpc("get_user_org_id");
      if (orgErr || !orgId) {
        throw new Error("No se pudo obtener la organización actual");
      }

      const result = await syncQuantumInvoices({
        org_id: orgId as string,
        start_date: startDate,
        end_date: endDate,
      });

      // Invalidate related queries so the dashboard refreshes
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["quantum-invoices"] }),
        queryClient.invalidateQueries({ queryKey: ["monthly-billing-stats"] }),
        queryClient.invalidateQueries({ queryKey: ["client-billing-stats"] }),
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
    <div className="flex items-center">
      <Button
        onClick={handleSync}
        disabled={loading}
        className="border-0.5 border-black rounded-[10px]"
      >
        {loading ? "Sincronizando…" : label}
      </Button>
    </div>
  );
}
