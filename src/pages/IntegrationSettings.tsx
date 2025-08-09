import { useState } from 'react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export default function IntegrationSettings() {
  const [testing, setTesting] = useState(false)
  const [endpoint, setEndpoint] = useState<'invoice' | 'customers'>('invoice')
  const [result, setResult] = useState<any>(null)

  const handleTest = async () => {
    try {
      setTesting(true)
      setResult(null)
      const { data, error } = await supabase.functions.invoke('quantum-diagnostics', {
        body: { endpoint }
      })
      if (error) throw error
      setResult(data)
      toast.success('Test de conexión ejecutado', { description: `CT: ${data?.results?.bearer?.contentType || 'n/a'}` })
    } catch (e: any) {
      toast.error('Error en test de conexión', { description: e?.message })
    } finally {
      setTesting(false)
    }
  }

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Integraciones"
        description="Configura y verifica integraciones externas"
      />

      <Card>
        <CardHeader>
          <CardTitle>Quantum Economics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyId">quantum_company_id</Label>
              <Input id="companyId" placeholder="Se guarda en Supabase Secrets" disabled className="border-0.5 border-black rounded-[10px]" />
            </div>
            <div>
              <Label htmlFor="token">quantum_api_token</Label>
              <Input id="token" placeholder="Se guarda en Supabase Secrets" disabled className="border-0.5 border-black rounded-[10px]" />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <div className="w-full md:w-64">
              <Label>Endpoint a probar</Label>
              <select
                className="w-full h-10 border-0.5 border-black rounded-[10px] px-3"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value as any)}
              >
                <option value="invoice">Facturas (invoice)</option>
                <option value="customers">Clientes (customers)</option>
              </select>
            </div>
            <Button onClick={handleTest} disabled={testing} className="border-0.5 border-black rounded-[10px]">
              {testing ? 'Probando…' : 'Probar conexión'}
            </Button>
          </div>

          {result && (
            <div className="mt-4 text-sm">
              <div className="font-medium mb-1">Resultado</div>
              <pre className="whitespace-pre-wrap break-words p-3 rounded border-0.5 border-black bg-muted/20">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          <p className="text-xs text-muted-foreground">Nota: las credenciales se gestionan como Supabase Secrets por seguridad.</p>
        </CardContent>
      </Card>
    </StandardPageContainer>
  )
}
