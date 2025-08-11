import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface DeedFormState {
  title: string
  deed_type: string
  contact_id: string
  signing_date: string
  notary_office: string
  notary_name?: string
  protocol_number?: string
  registry_office?: string
  registry_reference?: string
  registry_status?: string
  registry_submission_date?: string
  registration_date?: string
  notary_fees?: string
  registry_fees?: string
  other_fees?: string
  assigned_to?: string
}

interface Props {
  form: DeedFormState
  deedTypes: string[]
  contacts: { id: string; name: string }[]
  users?: { id: string; email: string }[]
  isSubmitting: boolean
  onChange: (next: Partial<DeedFormState>) => void
  onSubmit: () => void
}

export default function DeedsForm({ form, deedTypes, contacts, users = [], isSubmitting, onChange, onSubmit }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="title">Título</Label>
        <Input id="title" value={form.title} onChange={(e) => onChange({ title: e.target.value })} />
      </div>
      <div>
        <Label>Tipo</Label>
        <Select value={form.deed_type} onValueChange={(v) => onChange({ deed_type: v })}>
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
        <Select value={form.contact_id} onValueChange={(v) => onChange({ contact_id: v })}>
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
        <Input value={form.notary_office} onChange={(e) => onChange({ notary_office: e.target.value })} />
      </div>
      <div>
        <Label>Fecha firma</Label>
        <Input type="date" value={form.signing_date} onChange={(e) => onChange({ signing_date: e.target.value })} />
      </div>

      {/* Campos adicionales */}
      <div>
        <Label>Notario/a</Label>
        <Input value={form.notary_name || ''} onChange={(e) => onChange({ notary_name: e.target.value })} />
      </div>
      <div>
        <Label>Nº protocolo</Label>
        <Input value={form.protocol_number || ''} onChange={(e) => onChange({ protocol_number: e.target.value })} />
      </div>
      <div>
        <Label>Registro - Oficina</Label>
        <Input value={form.registry_office || ''} onChange={(e) => onChange({ registry_office: e.target.value })} />
      </div>
      <div>
        <Label>Registro - Referencia</Label>
        <Input value={form.registry_reference || ''} onChange={(e) => onChange({ registry_reference: e.target.value })} />
      </div>
      <div>
        <Label>Registro - Estado</Label>
        <Input value={form.registry_status || ''} onChange={(e) => onChange({ registry_status: e.target.value })} />
      </div>
      <div>
        <Label>Fecha presentación en registro</Label>
        <Input type="date" value={form.registry_submission_date || ''} onChange={(e) => onChange({ registry_submission_date: e.target.value })} />
      </div>
      <div>
        <Label>Fecha inscripción</Label>
        <Input type="date" value={form.registration_date || ''} onChange={(e) => onChange({ registration_date: e.target.value })} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label>Coste notaría (€)</Label>
          <Input type="number" inputMode="decimal" value={form.notary_fees || ''} onChange={(e) => onChange({ notary_fees: e.target.value })} />
        </div>
        <div>
          <Label>Coste registro (€)</Label>
          <Input type="number" inputMode="decimal" value={form.registry_fees || ''} onChange={(e) => onChange({ registry_fees: e.target.value })} />
        </div>
        <div>
          <Label>Otros costes (€)</Label>
          <Input type="number" inputMode="decimal" value={form.other_fees || ''} onChange={(e) => onChange({ other_fees: e.target.value })} />
        </div>
      </div>

      {!!users.length && (
        <div>
          <Label>Asignado a</Label>
          <Select value={form.assigned_to || ''} onValueChange={(v) => onChange({ assigned_to: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona usuario" />
            </SelectTrigger>
            <SelectContent>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.email}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? 'Creando…' : 'Crear escritura'}
      </Button>
    </div>
  )
}
