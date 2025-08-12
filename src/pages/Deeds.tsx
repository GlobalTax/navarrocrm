import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import DeedsForm from '@/pages/deeds/DeedsForm'
import DeedsFilters, { DeedsFiltersState } from '@/pages/deeds/DeedsFilters'
import DeedsTable from '@/pages/deeds/DeedsTable'

import { useContactsBasic } from '@/hooks/useContactsBasic'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DeedsKanban from '@/pages/deeds/DeedsKanban'
import DeedDetailTabs from '@/pages/deeds/DeedDetailTabs'
import DeedsKPIDashboard from '@/components/deeds/DeedsKPIDashboard'
import { VisibleCard } from '@/components/ui/VisibleCard'
import { useUIPreferences } from '@/hooks/useUIPreferences'
import { VisibleCard } from '@/components/ui/VisibleCard'
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
  registry_submission_date?: string | null
  registration_date?: string | null
  registry_entry_number?: string | null
  model600_deadline?: string | null
  asiento_expiration_date?: string | null
  qualification_started_at?: string | null
  qualification_deadline?: string | null
  notary_fees?: number | null
  registry_fees?: number | null
  other_fees?: number | null
  total_fees?: number | null
  assigned_to?: string | null
  created_by: string
  created_at: string
  updated_at: string
}


const useDeeds = () => {
  return useQuery<PublicDeed[]>({
    queryKey: ['deeds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deeds')
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
  const { data: contacts = [] } = useContactsBasic()
  const { data: users = [] } = useQuery<{ id: string; email: string }[]>({
    queryKey: ['users-basic'],
    queryFn: async () => {
      const { data, error } = await supabase.from('users').select('id, email').order('email')
      if (error) throw error
      return (data as { id: string; email: string }[]) || []
    }
  })

  // Realtime: refrescar automáticamente la lista ante cambios
  useEffect(() => {
    const channel = supabase
      .channel('public:deeds')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deeds' }, () => {
        qc.invalidateQueries({ queryKey: ['deeds'] })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [qc])

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
    notary_office: '',
    notary_name: '',
    protocol_number: '',
    registry_office: '',
    registry_reference: '',
    registry_status: '',
    registry_submission_date: '',
    registration_date: '',
    notary_fees: '',
    registry_fees: '',
    other_fees: '',
    assigned_to: ''
  })

  const [filters, setFilters] = useState<DeedsFiltersState>({ search: '', type: 'all', status: 'all', sort: 'created_desc' })
  const { showKpis, toggleKpis } = useUIPreferences('deeds', { showKpis: false })

  const deedTypes = useMemo(
    () => ['compraventa', 'hipoteca', 'poderes', 'constitucion_sociedad', 'arrendamiento', 'otros'],
    []
  )

  const filteredDeeds = useMemo(() => {
    let list = [...deeds]
    if (filters.type !== 'all') list = list.filter(d => d.deed_type === filters.type)
    if (filters.status !== 'all') list = list.filter(d => (d.status ?? 'draft') === filters.status)
    if (filters.search) {
      const term = filters.search.toLowerCase()
      list = list.filter(d =>
        d.title.toLowerCase().includes(term) ||
        (contactNameById.get(d.contact_id)?.toLowerCase().includes(term) ?? false)
      )
    }
    return list
  }, [deeds, filters, contactNameById])

  const sortedDeeds = useMemo(() => {
    const list = [...filteredDeeds]
    switch (filters.sort) {
      case 'created_asc':
        return list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      case 'signing_desc':
        return list.sort((a, b) => new Date(b.signing_date || 0).getTime() - new Date(a.signing_date || 0).getTime())
      case 'signing_asc':
        return list.sort((a, b) => new Date(a.signing_date || 0).getTime() - new Date(b.signing_date || 0).getTime())
      case 'title_asc':
        return list.sort((a, b) => a.title.localeCompare(b.title))
      case 'title_desc':
        return list.sort((a, b) => b.title.localeCompare(a.title))
      case 'created_desc':
      default:
        return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
  }, [filteredDeeds, filters.sort])

  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const totalPages = Math.max(1, Math.ceil(sortedDeeds.length / pageSize))

  useEffect(() => {
    setPage(1)
  }, [filters.search, filters.type, filters.status, filters.sort])

  const paginatedDeeds = useMemo(() => {
    const start = (page - 1) * pageSize
    return sortedDeeds.slice(start, start + pageSize)
  }, [sortedDeeds, page, pageSize])

  const tableDeeds = useMemo(() => paginatedDeeds.map(d => ({
    id: d.id,
    title: d.title,
    deed_type: d.deed_type,
    status: d.status ?? 'draft',
    signing_date: d.signing_date,
    contact_id: d.contact_id
  })), [paginatedDeeds])

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedDeed = useMemo(() => deeds.find(d => d.id === selectedId) || null, [deeds, selectedId])


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

      const notaryFees = form.notary_fees ? Number(form.notary_fees) : null
      const registryFees = form.registry_fees ? Number(form.registry_fees) : null
      const otherFees = form.other_fees ? Number(form.other_fees) : null
      const totalFees = [notaryFees, registryFees, otherFees]
        .filter((v) => typeof v === 'number')
        .reduce((acc, v) => acc + (v as number), 0)

      const payload = {
        org_id: orgIdData as string,
        contact_id: form.contact_id,
        deed_type: form.deed_type,
        title: form.title,
        signing_date: form.signing_date || null,
        notary_office: form.notary_office || null,
        notary_name: form.notary_name || null,
        protocol_number: form.protocol_number || null,
        registry_office: form.registry_office || null,
        registry_reference: form.registry_reference || null,
        registry_status: form.registry_status || null,
        registry_submission_date: form.registry_submission_date || null,
        registration_date: form.registration_date || null,
        notary_fees: notaryFees,
        registry_fees: registryFees,
        other_fees: otherFees,
        total_fees: totalFees || null,
        assigned_to: form.assigned_to || null,
        created_by: userId
      }

      const { error } = await supabase.from('deeds').insert(payload)
      if (error) throw error
    },
    onSuccess: async () => {
      setForm({
        title: '',
        deed_type: 'compraventa',
        contact_id: '',
        signing_date: '',
        notary_office: '',
        notary_name: '',
        protocol_number: '',
        registry_office: '',
        registry_reference: '',
        registry_status: '',
        registry_submission_date: '',
        registration_date: '',
        notary_fees: '',
        registry_fees: '',
        other_fees: '',
        assigned_to: ''
      })
      toast.success('Escritura creada')
      await qc.invalidateQueries({ queryKey: ['deeds'] })
    },
    onError: (e: any) => toast.error(e?.message || 'Error al crear la escritura')
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('deeds').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: async () => {
      toast.success('Estado actualizado')
      await qc.invalidateQueries({ queryKey: ['deeds'] })
    },
    onError: (e: any) => toast.error(e?.message || 'Error al actualizar estado')
  })

  const handleUpdateStatus = (id: string, status: string) => updateStatusMutation.mutate({ id, status })

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Escrituras públicas</h1>
          <p className="text-sm text-muted-foreground">Listado y alta rápida</p>
        </div>
        <Button variant="outline" onClick={toggleKpis}>
          {showKpis ? 'Ocultar KPIs' : 'Ver KPIs'}
        </Button>
      </header>

      {showKpis && (
        <VisibleCard pageKey="deeds" cardId="kpi-dashboard" title="KPIs">
          <DeedsKPIDashboard deeds={deeds as any} />
        </VisibleCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 border rounded-[10px] shadow-sm hover:shadow-lg transition-transform duration-200 ease-out">
          <h2 className="text-lg font-medium mb-3">Nueva escritura</h2>
          <DeedsForm
            form={form}
            deedTypes={deedTypes}
            contacts={contacts}
            users={users}
            isSubmitting={createMutation.isPending}
            onChange={(next) => setForm((f) => ({ ...f, ...next }))}
            onSubmit={() => createMutation.mutate()}
          />
        </Card>

        {/* Listado / Kanban */}
        <Card className="lg:col-span-2 p-4 border rounded-[10px] shadow-sm">
          <Tabs defaultValue="table">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Pipeline</h2>
              <TabsList>
                <TabsTrigger value="table">Tabla</TabsTrigger>
                <TabsTrigger value="kanban">Kanban</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="table">
              <DeedsFilters
                filters={filters}
                deedTypes={deedTypes}
                onChange={(next) => setFilters((f) => ({ ...f, ...next }))}
              />

              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-muted rounded" />
                  ))}
                </div>
              ) : (
                <>
                  <DeedsTable
                    deeds={tableDeeds}
                    getContactName={(id) => contactNameById.get(id)}
                    onRefresh={() => qc.invalidateQueries({ queryKey: ['deeds'] })}
                    onUpdateStatus={handleUpdateStatus}
                    onSelect={(id) => setSelectedId(id)}
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sortedDeeds.length)} de {sortedDeeds.length}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</Button>
                      <span className="text-sm">Página {page} / {totalPages}</span>
                      <Button variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Siguiente</Button>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="kanban">
              <DeedsKanban
                deeds={deeds}
                getContactName={(id) => contactNameById.get(id)}
                onUpdateStatus={handleUpdateStatus}
                onSelect={(id) => setSelectedId(id)}
              />
            </TabsContent>
          </Tabs>

          {selectedDeed && (
            <div className="mt-4">
              <DeedDetailTabs
                deed={selectedDeed}
                contactName={contactNameById.get(selectedDeed.contact_id) || selectedDeed.contact_id}
                onClose={() => setSelectedId(null)}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
