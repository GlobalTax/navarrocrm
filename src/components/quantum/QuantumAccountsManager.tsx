import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, AlertCircle, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { quantumLogger } from '@/utils/logging'

// Utility function for formatting currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

interface Cuenta {
  id: string;
  nombre: string;
  balance_actual: number;
  debito: number;
  credito: number;
  datos_completos: any;
  created_at: string;
  updated_at: string;
}

interface SyncHistory {
  id: string;
  sync_date: string;
  status: string;
  message: string;
  records_processed: number;
  error_details: any;
}

export function QuantumAccountsManager() {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  

  const fetchCuentas = async () => {
    try {
      const { data, error } = await supabase
        .from('cuentas')
        .select('*')
        .order('nombre');

      if (error) throw error;
      setCuentas(data || []);
    } catch (error) {
      console.error('Error fetching cuentas:', error);
      toast.error("No se pudieron cargar las cuentas de Quantum");
    }
  };

  const fetchSyncHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('quantum_sync_history')
        .select('*')
        .order('sync_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSyncHistory(data || []);
    } catch (error) {
      console.error('Error fetching sync history:', error);
    }
  };

  const syncQuantumAccounts = async () => {
    setSyncing(true);
    try {
      quantumLogger.info('🚀 Iniciando sincronización con Quantum Economics via Edge Function');
      
      // Llamar a la Edge Function mejorada
      const { data, error } = await supabase.functions.invoke('sync-quantum-accounts');
      
      if (error) {
        console.error('❌ Error en Edge Function:', error);
        throw new Error(error.message || 'Error en la función de sincronización');
      }

      if (!data.success) {
        throw new Error(data.error || 'Error desconocido en la sincronización');
      }

      quantumLogger.info('✅ Sincronización completada', { data });
      toast.success(data.message || "Las cuentas se han sincronizado correctamente");

      // Refrescar los datos
      await Promise.all([fetchCuentas(), fetchSyncHistory()]);
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
      toast.error(`Error en sincronización: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCuentas(), fetchSyncHistory()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const lastSync = syncHistory[0];
  const totalBalance = cuentas.reduce((sum, cuenta) => sum + (cuenta.balance_actual || 0), 0);
  const totalDebit = cuentas.reduce((sum, cuenta) => sum + (cuenta.debito || 0), 0);
  const totalCredit = cuentas.reduce((sum, cuenta) => sum + (cuenta.credito || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cuentas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cuentas.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Débito</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDebit)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Crédito</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCredit)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Estado de sincronización */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sincronización con Quantum</CardTitle>
              <CardDescription>
                Gestiona la sincronización de cuentas desde Quantum Economics
              </CardDescription>
            </div>
            <Button
              onClick={syncQuantumAccounts}
              disabled={syncing}
              className="ml-4"
            >
              {syncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sincronizar
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lastSync && (
            <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
              {lastSync.status === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Última sincronización:</span>
                  <Badge variant={lastSync.status === 'success' ? 'default' : 'destructive'}>
                    {lastSync.status === 'success' ? 'Exitosa' : 'Error'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(lastSync.sync_date).toLocaleString()} - 
                  {lastSync.records_processed} registros procesados
                </div>
                {lastSync.message && (
                  <div className="text-sm mt-1">{lastSync.message}</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de cuentas */}
      <Card>
        <CardHeader>
          <CardTitle>Cuentas de Quantum</CardTitle>
          <CardDescription>
            Listado de todas las cuentas sincronizadas desde Quantum Economics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cuentas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Débito</TableHead>
                  <TableHead className="text-right">Crédito</TableHead>
                  <TableHead>Última actualización</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cuentas.map((cuenta) => (
                  <TableRow key={cuenta.id}>
                    <TableCell className="font-mono text-sm">{cuenta.id}</TableCell>
                    <TableCell className="font-medium">{cuenta.nombre}</TableCell>
                    <TableCell className="text-right">
                      <span className={cuenta.balance_actual >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(cuenta.balance_actual)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {formatCurrency(cuenta.debito)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(cuenta.credito)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(cuenta.updated_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No hay cuentas</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Ejecuta una sincronización para cargar las cuentas desde Quantum
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial de sincronizaciones */}
      {syncHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Sincronizaciones</CardTitle>
            <CardDescription>
              Últimas 10 sincronizaciones realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {syncHistory.map((sync) => (
                <div key={sync.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {sync.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <div className="text-sm font-medium">
                        {new Date(sync.sync_date).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {sync.records_processed} registros procesados
                      </div>
                    </div>
                  </div>
                  <Badge variant={sync.status === 'success' ? 'default' : 'destructive'}>
                    {sync.status === 'success' ? 'Exitosa' : 'Error'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}