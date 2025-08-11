
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface DeedDetailsProps {
  deed: {
    id: string
    title: string
    deed_type: string
    status?: string | null
    signing_date?: string | null
    contact_id: string
    notary_office?: string | null
    notary_name?: string | null
    protocol_number?: string | null
    registry_office?: string | null
    registry_reference?: string | null
    registry_status?: string | null
    created_at: string
    updated_at: string
    // Nuevos campos opcionales para mostrar SLAs si existen
    model600_deadline?: string | null
    asiento_expiration_date?: string | null
    qualification_deadline?: string | null
  }
  contactName: string
  onClose: () => void
}

export default function DeedDetails({ deed, contactName, onClose }: DeedDetailsProps) {
  return (
    <Card className="p-4 border rounded-[10px] shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{deed.title}</h3>
          <p className="text-sm text-muted-foreground">Detalle de la escritura</p>
        </div>
        <Button variant="outline" onClick={onClose} className="rounded-[10px]">Cerrar</Button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Detail label="Tipo" value={deed.deed_type.replace(/_/g, ' ')} />
        <Detail label="Estado" value={deed.status ?? '—'} />
        <Detail label="Fecha firma" value={deed.signing_date ? new Date(deed.signing_date).toLocaleDateString('es-ES') : '-'} />
        <Detail label="Cliente" value={contactName} />
        <Detail label="Notaría" value={deed.notary_office || '-'} />
        <Detail label="Protocolo" value={deed.protocol_number || '-'} />
        <Detail label="Registro" value={deed.registry_office || '-'} />
        <Detail label="Ref. Registro" value={deed.registry_reference || '-'} />
        <Detail label="Estado Registro" value={deed.registry_status || '-'} />
        {/* Plazos SLA si existen */}
        <Detail label="Límite Modelo 600" value={deed.model600_deadline ? new Date(deed.model600_deadline).toLocaleDateString('es-ES') : '-'} />
        <Detail label="Vencimiento Asiento" value={deed.asiento_expiration_date ? new Date(deed.asiento_expiration_date).toLocaleDateString('es-ES') : '-'} />
        <Detail label="Límite Calificación" value={deed.qualification_deadline ? new Date(deed.qualification_deadline).toLocaleDateString('es-ES') : '-'} />
        <Detail label="Creada" value={new Date(deed.created_at).toLocaleString('es-ES')} />
        <Detail label="Actualizada" value={new Date(deed.updated_at).toLocaleString('es-ES')} />
      </div>
    </Card>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm mt-0.5">{value}</div>
    </div>
  )
}
