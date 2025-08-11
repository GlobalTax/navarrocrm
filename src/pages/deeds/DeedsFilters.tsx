import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface DeedsFiltersState {
  search: string
  type: string
  status: string
}

interface Props {
  filters: DeedsFiltersState
  deedTypes: string[]
  onChange: (next: Partial<DeedsFiltersState>) => void
}

export default function DeedsFilters({ filters, deedTypes, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Input
        placeholder="Buscar por título o cliente"
        value={filters.search}
        onChange={(e) => onChange({ search: e.target.value })}
      />
      <Select value={filters.type} onValueChange={(v) => onChange({ type: v })}>
        <SelectTrigger>
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los tipos</SelectItem>
          {deedTypes.map((t) => (
            <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.status} onValueChange={(v) => onChange({ status: v })}>
        <SelectTrigger>
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="draft">Borrador</SelectItem>
          <SelectItem value="pending_signature">Pendiente firma</SelectItem>
          <SelectItem value="signed">Firmada</SelectItem>
          <SelectItem value="in_registry">En registro</SelectItem>
          <SelectItem value="completed">Completada</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
