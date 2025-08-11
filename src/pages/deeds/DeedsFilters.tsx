
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface DeedsFiltersState {
  search: string
  type: string
  status: string
  sort: string
}

interface Props {
  filters: DeedsFiltersState
  deedTypes: string[]
  onChange: (next: Partial<DeedsFiltersState>) => void
}

const STATUS_FILTERS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'NOTARIO_FIRMADA', label: 'Notario: firmada' },
  { value: 'IMPUESTOS_PENDIENTES', label: 'Impuestos pendientes' },
  { value: 'IMPUESTOS_ACREDITADOS', label: 'Impuestos acreditados' },
  { value: 'EN_REGISTRO', label: 'En registro' },
  { value: 'EN_CALIFICACION', label: 'En calificación' },
  { value: 'DEFECTOS', label: 'Defectos' },
  { value: 'SUBSANACION', label: 'Subsanación' },
  { value: 'INSCRITA', label: 'Inscrita' },
  { value: 'BORME_PUBLICADO', label: 'BORME publicado' },
  { value: 'CIERRE_EXPEDIENTE', label: 'Cierre expediente' },
]

export default function DeedsFilters({ filters, deedTypes, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <Input
        placeholder="Buscar por título o cliente"
        value={filters.search}
        onChange={(e) => onChange({ search: e.target.value })}
        className="rounded-[10px]"
      />
      <Select value={filters.type} onValueChange={(v) => onChange({ type: v })}>
        <SelectTrigger className="rounded-[10px]">
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
        <SelectTrigger className="rounded-[10px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_FILTERS.map((s) => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.sort} onValueChange={(v) => onChange({ sort: v })}>
        <SelectTrigger className="rounded-[10px]">
          <SelectValue placeholder="Orden" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="created_desc">Recientes</SelectItem>
          <SelectItem value="created_asc">Antiguas</SelectItem>
          <SelectItem value="signing_desc">Firma más reciente</SelectItem>
          <SelectItem value="signing_asc">Firma más antigua</SelectItem>
          <SelectItem value="title_asc">Título A–Z</SelectItem>
          <SelectItem value="title_desc">Título Z–A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
