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
  const [multiOutput, setMultiOutput] = useState<Array<{ type: 'C' | 'P'; data: DiagResult }> | null>(null);
  const [diagType, setDiagType] = useState<'C' | 'P' | 'ALL'>('C');
  const [full, setFull] = useState(true);

  const runTest = async (range?: { start?: string; end?: string }) => {
    try {
      setLoading(true);
      setOutput(null);
      setMultiOutput(null);

      if (diagType === 'ALL') {
        const types: Array<'C' | 'P'> = ['C', 'P'];
        const results: Array<{ type: 'C' | 'P'; data: DiagResult }> = [];
        for (const t of types) {
          const { data, error } = await supabase.functions.invoke('quantum-diagnostics', {
            body: {
              endpoint: 'invoice',
              full,
              start_date: range?.start,
              end_date: range?.end,
              type: t,
            },
          });
          if (error) {
            results.push({ type: t, data: { error: error.message } });
          } else {
            results.push({ type: t, data: data as DiagResult });
          }
        }
        setMultiOutput(results);
      } else {
        const { data, error } = await supabase.functions.invoke('quantum-diagnostics', {
          body: {
            endpoint: 'invoice',
            full,
            start_date: range?.start,
            end_date: range?.end,
            type: diagType,
          },
        });
        if (error) throw error;
        setOutput(data as DiagResult);
      }
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
        <div className="flex gap-2 flex-wrap mb-4 items-center">
          <select
            aria-label="Tipo"
            value={diagType}
            onChange={(e) => setDiagType(e.target.value as 'C' | 'P' | 'ALL')}
            className="border-0.5 border-black rounded-[10px] px-2 py-1"
            disabled={loading}
          >
            <option value="C">Clientes (C)</option>
            <option value="P">Proveedores (P)</option>
            <option value="ALL">Ambos (C+P)</option>
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={full}
              onChange={(e) => setFull(e.target.checked)}
              disabled={loading}
              className="border-0.5 border-black rounded-[10px]"
            />
            Full (/invoice/full)
          </label>

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

        {multiOutput && multiOutput.length > 0 && (
          <ScrollArea className="h-[220px] border rounded-[10px] p-3 mb-3">
            <div className="space-y-4 text-sm">
              {multiOutput.map(({ type, data }) => (
                <div key={type} className="space-y-2">
                  <div className="font-medium">Resultado tipo {type}</div>
                  {data.url_masked && (
                    <div className="text-muted-foreground break-words">{data.url_masked}</div>
                  )}
                  {data.results && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <div className="font-medium">API-KEY</div>
                        <pre className="bg-muted/40 p-2 rounded-[10px] overflow-x-auto">
                          {JSON.stringify(data.results.apiKey, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <div className="font-medium">Bearer</div>
                        <pre className="bg-muted/40 p-2 rounded-[10px] overflow-x-auto">
                          {JSON.stringify(data.results.bearer, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  {data.error && (
                    <div className="text-destructive">{data.error}</div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {output && !multiOutput && (
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
