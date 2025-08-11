import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

// Types
interface PublicDeed {
  id: string
  org_id: string
  case_id: string | null
  contact_id: string
  deed_type: string
  title: string
  status: string
  notary_office?: string | null
  notary_name?: string | null
  protocol_number?: string | null
  signing_date?: string | null
  registry_office?: string | null
  registry_reference?: string | null
  registry_status?: string | null
  registry_deadline?: string | null
  fees_detail?: any | null
  total_fees?: number | null
  assigned_to?: string | null
  created_by: string
  metadata: any
  created_at: string
  updated_at: string
}

interface ContactOption { id: string; name: string }

const useContacts = () => {
  return useQuery<{ id: string; name: string }[]>({
    queryKey: ['contacts-basic'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('id,name')
        .order('name', { ascending: true })
      if (error) throw error
      return data || []
    }
  })
}

const useDeeds = () => {
  return useQuery<PublicDeed[]>({
    queryKey: ['public_deeds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_deeds')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data as PublicDeed[]) || []
    }
  })
}

export default function DeedsPage() {
  // SEO minimal tags
  useEffect(() => {
    document.title = 'Escrituras públicas · CRM';
    const metaDesc = document.querySelector('meta[name="description"]') || document.createElement('meta')
    metaDesc.setAttribute('name', 'description')
    metaDesc.setAttribute('content', 'Gestión de escrituras públicas: alta, seguimiento de estado y plazos de registro.')
    if (!metaDesc.parentNode) document.head.appendChild(metaDesc)

    const linkCanonical = document.querySelector('link[rel="canonical"]') || document.createElement('link')
    linkCanonical.setAttribute('rel', 'canonical')
    linkCanonical.setAttribute('href', window.location.origin + '/escrituras')
    if (!linkCanonical.parentNode) document.head.appendChild(linkCanonical)
  }, [])

  const qc = useQueryClient()
  const { data: deeds = [], isLoading } = useDeeds()
  const { data: contacts = [] } = useContacts()
  const contactNameById = useMemo(() => {
    const m = new Map<string, string>()
    contacts.forEach((c) => m.set(c.id, c.name))
    return m
  }, [contacts])

  const [form, setForm] = useState({
    title: '',
    deed_type: 'compraventa',
    contact_id: '',
    signing_date: '',
    notary_office: ''
  })

  const deedTypes = useMemo(
    () => ['compraventa', 'hipoteca', 'poderes', 'constitucion_sociedad', 'arrendamiento', 'otros'],
    []
  )

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!form.title || !form.deed_type || !form.contact_id) {
        throw new Error('Rellena título, tipo y cliente')
      }
      const { data: orgIdData, error: orgErr } = await supabase.rpc('get_user_org_id')
      if (orgErr) throw orgErr
      const { data: userRes, error: userErr } = await supabase.auth.getUser()
      if (userErr) throw userErr
      const userId = userRes.user?.id
      if (!userId) throw new Error('Usuario no autenticado')

      const payload = {
        org_id: orgIdData as string,
        contact_id: form.contact_id,
        deed_type: form.deed_type,
        title: form.title,
        signing_date: form.signing_date || null,
        notary_office: form.notary_office || null,
        created_by: userId,
        metadata: {}
      }

      const { error } = await supabase.from('public_deeds').insert(payload)
      if (error) throw error
    },
    onSuccess: async () => {
      setForm({ title: '', deed_type: 'compraventa', contact_id: '', signing_date: '', notary_office: '' })
      toast.success('Escritura creada')
      await qc.invalidateQueries({ queryKey: ['public_deeds'] })
    },
    onError: (e: any) => toast.error(e?.message || 'Error al crear la escritura')
  })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Escrituras públicas</h1>
        <p className="text-sm text-muted-foreground">Listado y alta rápida</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de alta */}
        <Card className="p-4 border rounded-[10px] shadow-sm hover:shadow-lg transition-transform duration-200 ease-out">
          <h2 className="text-lg font-medium mb-3">Nueva escritura</h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.deed_type} onValueChange={(v) => setForm((f) => ({ ...f, deed_type: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  {deedTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cliente</Label>
              <Select value={form.contact_id} onValueChange={(v) => setForm((f) => ({ ...f, contact_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona cliente" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notaría</Label>
              <Input value={form.notary_office} onChange={(e) => setForm((f) => ({ ...f, notary_office: e.target.value }))} />
            </div>
            <div>
              <Label>Fecha firma</Label>
              <Input type="date" value={form.signing_date} onChange={(e) => setForm((f) => ({ ...f, signing_date: e.target.value }))} />
            </div>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creando…' : 'Crear escritura'}
            </Button>
          </div>
        </Card>

        {/* Listado */}
        <Card className="lg:col-span-2 p-4 border rounded-[10px] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium">Listado</h2>
            <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ['public_deeds'] })}>Refrescar</Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Título</th>
                    <th className="py-2 pr-4">Tipo</th>
                    <th className="py-2 pr-4">Estado</th>
                    <th className="py-2 pr-4">Fecha firma</th>
                    <th className="py-2 pr-4">Cliente</th>
                  </tr>
                </thead>
                <tbody>
                  {deeds.map((d) => (
                    <tr key={d.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-2 pr-4">{d.title}</td>
                      <td className="py-2 pr-4 capitalize">{d.deed_type.replace(/_/g, ' ')}</td>
                      <td className="py-2 pr-4">{d.status}</td>
                      <td className="py-2 pr-4">{d.signing_date ? new Date(d.signing_date).toLocaleDateString('es-ES') : '-'}</td>
                      <td className="py-2 pr-4">{contactNameById.get(d.contact_id) || d.contact_id}</td>
                    </tr>
                  ))}
                  {deeds.length === 0 && (
                    <tr>
                      <td className="py-6 text-muted-foreground" colSpan={5}>No hay escrituras aún.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
