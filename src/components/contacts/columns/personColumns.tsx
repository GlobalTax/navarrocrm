
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Edit, Building2, User, Briefcase, Mail, Phone } from 'lucide-react'
import { Person } from '@/hooks/usePersons'
import { ColumnDef } from '@/components/shared/ParametricTable'

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

const getStatusBadge = (status: string | null) => {
  if (!status) return <span className="text-muted-foreground text-sm">-</span>
  const cfg: Record<string, { label: string; className: string }> = {
    activo: { label: 'Activo', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    inactivo: { label: 'Inactivo', className: 'bg-gray-100 text-gray-800 border-gray-200' },
    prospecto: { label: 'Prospecto', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    bloqueado: { label: 'Bloqueado', className: 'bg-red-100 text-red-800 border-red-200' },
  }
  const c = cfg[status]
  if (!c) return <Badge variant="outline">{status}</Badge>
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

export const createPersonColumns = (
  onEditPerson: (person: Person) => void
): ColumnDef<Person>[] => [
  {
    key: 'name',
    header: 'Persona',
    sortable: true,
    width: '22%',
    render: (p) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
            {getInitials(p.name)}
          </AvatarFallback>
        </Avatar>
        <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
          {p.name}
        </span>
      </div>
    ),
  },
  {
    key: 'client_type',
    header: 'Tipo',
    sortable: true,
    width: '12%',
    render: (p) => (
      <div className="flex items-center gap-2 text-sm text-foreground">
        <span className="text-primary">
          {p.client_type === 'autonomo' ? <Briefcase className="h-4 w-4" /> : <User className="h-4 w-4" />}
        </span>
        <span className="font-medium">{p.client_type === 'autonomo' ? 'Autónomo' : 'Particular'}</span>
      </div>
    ),
  },
  {
    key: 'contact',
    header: 'Contacto',
    width: '20%',
    render: (p) => (
      <div className="space-y-0.5 min-w-0">
        {p.email && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{p.email}</span>
          </div>
        )}
        {p.phone && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{p.phone}</span>
          </div>
        )}
        {!p.email && !p.phone && <span className="text-muted-foreground text-sm">-</span>}
      </div>
    ),
  },
  {
    key: 'company',
    header: 'Empresa',
    width: '18%',
    render: (p) =>
      p.company ? (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium truncate">{p.company.name}</span>
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      ),
  },
  {
    key: 'status',
    header: 'Estado',
    sortable: true,
    width: '12%',
    render: (p) => getStatusBadge(p.status),
  },
  {
    key: 'actions',
    header: '',
    width: '6%',
    align: 'right',
    render: (p) => (
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
          onClick={(e) => {
            e.stopPropagation()
            onEditPerson(p)
          }}
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>
      </div>
    ),
  },
]
