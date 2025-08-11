import { useEffect, useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { countdownTo, elapsedBusinessDaysSince } from '@/utils/businessDays'
import { supabase } from '@/integrations/supabase/client'

interface DeedLike {
  id: string
  title: string
  contact_id: string
  deed_type: string
  status: string | null
  registry_entry_number?: string | null
  asiento_expiration_date?: string | null
  qualification_started_at?: string | null
  qualification_deadline?: string | null
}

interface Props {
  deed: DeedLike
  contactName: string
  onClose: () => void
}

export default function DeedDetailTabs({ deed, contactName, onClose }: Props) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(i)
  }, [])

  const countdown = useMemo(() => countdownTo(deed.asiento_expiration_date || null), [deed.asiento_expiration_date, tick])

  // Cargar tributos
  const [tributos, setTributos] = useState<any | null>(null)
  useEffect(() => {
    let mounted = true
    supabase.from('expedientes_tributos').select('*').eq('expediente_id', deed.id).maybeSingle().then(({ data, error }) => {
      if (mounted) setTributos(data || null)
    })
    return () => { mounted = false }
  }, [deed.id])

  const califElapsed = elapsedBusinessDaysSince(deed.qualification_started_at || null)
  const califColor = califElapsed >= 15 ? 'bg-destructive/10 text-destructive' : califElapsed >= 10 ? 'bg-warning/10 text-warning-foreground' : 'bg-success/10 text-success-foreground'

  return (
    <Card className="p-4 border rounded-[10px]">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold">{deed.title}</h3>
          <p className="text-sm text-muted-foreground">{contactName} · {deed.deed_type.replace(/_/g, ' ')} · {deed.status?.replace(/_/g, ' ')}</p>
        </div>
        <button onClick={onClose} className="text-sm underline">Cerrar</button>
      </div>

      <Tabs defaultValue="resumen">
        <TabsList className="mb-3">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="tributos">Tributos</TabsTrigger>
          <TabsTrigger value="registro">Registro</TabsTrigger>
          <TabsTrigger value="calificacion">Calificación</TabsTrigger>
          <TabsTrigger value="tareas">Tareas</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
          <TabsTrigger value="comentarios">Comentarios</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Info label="Cliente" value={contactName} />
            <Info label="Tipo" value={deed.deed_type.replace(/_/g, ' ')} />
            <Info label="Estado" value={deed.status?.replace(/_/g, ' ') || '-'} />
          </section>
        </TabsContent>

        <TabsContent value="documentos">
          <section className="text-sm text-muted-foreground">Próximamente</section>
        </TabsContent>

        <TabsContent value="tributos">
          <section className="space-y-2">
            <h4 className="font-medium">ITP/AJD</h4>
            <p className="text-sm">{tributos?.itp_ajd_procede ? (tributos?.itp_ajd_fecha ? 'Acreditado' : 'Pendiente de acreditar') : 'No procede'}</p>
            <h4 className="font-medium mt-2">IIVTNU (plusvalía)</h4>
            <p className="text-sm">{tributos?.iivtnu_procede ? (tributos?.iivtnu_fecha ? 'Acreditado' : 'Pendiente de acreditar') : 'No procede'}</p>
            <p className="text-xs text-muted-foreground">No se podrá pasar a EN_CALIFICACION sin acreditar los tributos cuando proceda.</p>
          </section>
        </TabsContent>

        <TabsContent value="registro">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
            <Info label="Asiento" value={deed.registry_entry_number || '-'} />
            <Info label="Caducidad asiento" value={deed.asiento_expiration_date ? new Date(deed.asiento_expiration_date).toLocaleDateString('es-ES') : '-'} />
            <div className="text-sm">
              <div className="text-muted-foreground mb-1">Cuenta atrás</div>
              <div className="text-base font-semibold">{countdown.days}d {countdown.hours}h {countdown.minutes}m</div>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="calificacion">
          <section className="flex items-center gap-3">
            <Badge className={`border rounded-[10px] ${califColor}`}>SLA 15 hábiles · {califElapsed}d transcurridos</Badge>
            {deed.qualification_deadline && (
              <span className="text-sm text-muted-foreground">Límite: {new Date(deed.qualification_deadline).toLocaleDateString('es-ES')}</span>
            )}
          </section>
        </TabsContent>

        <TabsContent value="tareas"><section className="text-sm text-muted-foreground">Próximamente</section></TabsContent>
        <TabsContent value="historial"><section className="text-sm text-muted-foreground">Próximamente</section></TabsContent>
        <TabsContent value="comentarios"><section className="text-sm text-muted-foreground">Próximamente</section></TabsContent>
      </Tabs>
    </Card>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <div className="text-muted-foreground mb-1">{label}</div>
      <div className="font-medium break-words border rounded-[10px] px-2 py-1">{value || '-'}</div>
    </div>
  )
}
