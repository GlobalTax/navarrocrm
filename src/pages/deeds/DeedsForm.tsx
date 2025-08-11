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
}

interface Props {
  form: DeedFormState
  deedTypes: string[]
  contacts: { id: string; name: string }[]
  isSubmitting: boolean
  onChange: (next: Partial<DeedFormState>) => void
  onSubmit: () => void
}

export default function DeedsForm({ form, deedTypes, contacts, isSubmitting, onChange, onSubmit }: Props) {
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
      <Button onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? 'Creando…' : 'Crear escritura'}
      </Button>
    </div>
  )
}
