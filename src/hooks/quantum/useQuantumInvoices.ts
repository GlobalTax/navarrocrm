import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface QuantumInvoice {
  id: string;
  quantum_invoice_id: string;
  contact_id: string | null;
  quantum_customer_id: string;
  client_name: string;
  series_and_number: string;
  invoice_date: string;
  total_amount_without_taxes: number;
  total_amount: number;
  invoice_lines: any[];
  quantum_data: any;
  created_at: string;
  updated_at: string;
  contact?: {
    id: string;
    name: string;
  };
}

export interface QuantumInvoiceFilters {
  start_date?: string;
  end_date?: string;
  contact_id?: string;
  client_name?: string;
}

export const useQuantumInvoices = (filters?: QuantumInvoiceFilters) => {
  // Obtener org_id del usuario actual
  const getCurrentOrgId = async () => {
    const { data } = await supabase.rpc('get_user_org_id');
    return data;
  };

  return useQuery({
    queryKey: ['quantum-invoices', filters],
    queryFn: async () => {
      const currentOrgId = await getCurrentOrgId();
      if (!currentOrgId) return [];

      console.log('🧾 [Query] Obteniendo facturas de Quantum para org:', currentOrgId);

      let query = supabase
        .from('quantum_invoices')
        .select(`
          *,
          contact:contacts(id, name)
        `)
        .eq('org_id', currentOrgId)
        .order('invoice_date', { ascending: false });

      // Aplicar filtros
      if (filters?.start_date) {
        query = query.gte('invoice_date', filters.start_date);
      }
      
      if (filters?.end_date) {
        query = query.lte('invoice_date', filters.end_date);
      }
      
      if (filters?.contact_id) {
        query = query.eq('contact_id', filters.contact_id);
      }
      
      if (filters?.client_name) {
        query = query.ilike('client_name', `%${filters.client_name}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [Error] Error obteniendo facturas:', error);
        throw error;
      }

      console.log(`✅ [Success] Facturas obtenidas: ${data?.length || 0}`);
      return data as QuantumInvoice[];
    },
  });
};

// Hook para estadísticas de facturación mensual
export const useMonthlyBillingStats = (year: number = new Date().getFullYear()) => {
  return useQuery({
    queryKey: ['monthly-billing-stats', year],
    queryFn: async () => {
      const currentOrgId = await supabase.rpc('get_user_org_id');
      if (!currentOrgId.data) return [];

      console.log('📊 [Query] Obteniendo estadísticas mensuales para año:', year);

      // Usar consulta directa ya que no existe esa función RPC
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      
      const { data, error } = await supabase
        .from('quantum_invoices')
        .select('invoice_date, total_amount')
        .eq('org_id', currentOrgId.data)
        .gte('invoice_date', startDate)
        .lte('invoice_date', endDate);

      if (error) {
        console.error('❌ [Error] Error obteniendo estadísticas:', error);
        throw error;
      }

      return data || [];
    },
  });
};

// Hook para facturación por cliente
export const useClientBillingStats = (period_months: number = 12) => {
  return useQuery({
    queryKey: ['client-billing-stats', period_months],
    queryFn: async () => {
      const currentOrgId = await supabase.rpc('get_user_org_id');
      if (!currentOrgId.data) return [];

      console.log('👥 [Query] Obteniendo estadísticas por cliente para últimos', period_months, 'meses');

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - period_months);

      const { data, error } = await supabase
        .from('quantum_invoices')
        .select('contact_id, client_name, total_amount, invoice_date, contact:contacts(id, name)')
        .eq('org_id', currentOrgId.data)
        .gte('invoice_date', startDate.toISOString().split('T')[0])
        .order('total_amount', { ascending: false });

      if (error) {
        console.error('❌ [Error] Error obteniendo estadísticas por cliente:', error);
        throw error;
      }

      // Agrupar por cliente
      const clientStats = data.reduce((acc: any[], invoice) => {
        const clientKey = invoice.contact_id || invoice.client_name;
        const existingClient = acc.find(c => 
          (c.contact_id === invoice.contact_id && invoice.contact_id) || 
          (c.client_name === invoice.client_name && !invoice.contact_id)
        );

        if (existingClient) {
          existingClient.total_billed += invoice.total_amount;
          existingClient.invoice_count += 1;
          existingClient.last_invoice_date = invoice.invoice_date > existingClient.last_invoice_date 
            ? invoice.invoice_date 
            : existingClient.last_invoice_date;
        } else {
          acc.push({
            contact_id: invoice.contact_id,
            client_name: invoice.contact?.name || invoice.client_name,
            total_billed: invoice.total_amount,
            invoice_count: 1,
            last_invoice_date: invoice.invoice_date,
            is_mapped: !!invoice.contact_id
          });
        }

        return acc;
      }, []);

      // Ordenar por facturación total
      clientStats.sort((a, b) => b.total_billed - a.total_billed);

      console.log(`✅ [Success] Estadísticas de ${clientStats.length} clientes obtenidas`);
      return clientStats;
    },
  });
};

// Hook para sincronizar facturas
export const useSyncQuantumInvoices = () => {
  return async (params: { 
    org_id: string; 
    start_date?: string; 
    end_date?: string;
    invoice_type?: 'C' | 'P' | 'ALL';
    full?: boolean;
  }) => {
    console.log('🔄 [Sync] Iniciando sincronización de facturas');

    const { data, error } = await supabase.functions.invoke('sync-quantum-invoices', {
      body: params
    });

    if (error) {
      console.error('❌ [Error] Error en sincronización:', error);
      throw error;
    }

    console.log('✅ [Success] Sincronización completada:', data);
    return data;
  };
};