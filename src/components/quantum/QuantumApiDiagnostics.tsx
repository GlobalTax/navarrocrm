import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface DiagResult {
  url_masked?: string;
  results?: {
    bearer?: { ok: boolean; status: number; contentType: string; first200Chars: string };
    apiKey?: { ok: boolean; status: number; contentType: string; first200Chars: string };
  };
  error?: string;
}

export function QuantumApiDiagnostics() {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<DiagResult | null>(null);

  const runTest = async (range?: { start?: string; end?: string }) => {
    try {
      setLoading(true);
      setOutput(null);
      const { data, error } = await supabase.functions.invoke('quantum-diagnostics', {
        body: {
          endpoint: 'invoice',
          start_date: range?.start,
          end_date: range?.end,
          type: 'C',
          page: 1,
        },
      });
      if (error) throw error;
      setOutput(data as DiagResult);
    } catch (e: any) {
      setOutput({ error: e?.message || 'Error desconocido' });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  const start365 = new Date();
  start365.setDate(today.getDate() - 365);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Diagnóstico API Quantum
          {output?.error && <Badge variant="destructive">Error</Badge>}
          {!output?.error && output && (
            <Badge variant={(output.results?.apiKey?.ok || output.results?.bearer?.ok) ? 'default' : 'secondary'}>
              {(output.results?.apiKey?.ok || output.results?.bearer?.ok) ? 'OK' : 'Sin acceso'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 flex-wrap mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => runTest()}
            disabled={loading}
            className="border-0.5 border-black rounded-[10px]"
          >
            Probar sin fechas
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => runTest({ start: start365.toISOString().slice(0,10), end: today.toISOString().slice(0,10) })}
            disabled={loading}
            className="border-0.5 border-black rounded-[10px]"
          >
            Últimos 365 días
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => runTest({ start: '2024-01-01', end: '2025-12-31' })}
            disabled={loading}
            className="border-0.5 border-black rounded-[10px]"
          >
            2024-2025
          </Button>
        </div>

        {loading && (
          <div className="text-sm text-muted-foreground">Lanzando prueba…</div>
        )}

        {output && (
          <ScrollArea className="h-[220px] border rounded-[10px] p-3">
            <div className="space-y-2 text-sm">
              {output.url_masked && (
                <div>
                  <div className="font-medium">URL</div>
                  <div className="text-muted-foreground break-words">{output.url_masked}</div>
                </div>
              )}
              {output.results && (
                <>
                  <div>
                    <div className="font-medium">API-KEY</div>
                    <pre className="bg-muted/40 p-2 rounded-[10px] overflow-x-auto">
                      {JSON.stringify(output.results.apiKey, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <div className="font-medium">Bearer</div>
                    <pre className="bg-muted/40 p-2 rounded-[10px] overflow-x-auto">
                      {JSON.stringify(output.results.bearer, null, 2)}
                    </pre>
                  </div>
                </>
              )}
              {output.error && (
                <div className="text-destructive">{output.error}</div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
