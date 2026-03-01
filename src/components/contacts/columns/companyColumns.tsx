
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Edit, Building2, Users, Mail, Phone } from 'lucide-react'
import { Company } from '@/hooks/useCompanies'
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

export const createCompanyColumns = (
  onEditCompany: (company: Company) => void
): ColumnDef<Company>[] => [
  {
    key: 'name',
    header: 'Empresa',
    sortable: true,
    width: '22%',
    render: (c) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-semibold">
            {getInitials(c.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <span className="font-semibold text-sm text-foreground group-hover:text-emerald-600 transition-colors truncate block">
            {c.name}
          </span>
          {c.business_sector && (
            <span className="text-xs text-muted-foreground truncate block">{c.business_sector}</span>
          )}
        </div>
      </div>
    ),
  },
  {
    key: 'sector',
    header: 'Sector',
    sortable: true,
    width: '14%',
    render: (c) => (
      <div className="flex items-center gap-2 text-sm">
        <Building2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
        <span className="truncate text-foreground">{c.business_sector || 'Sin especificar'}</span>
      </div>
    ),
  },
  {
    key: 'primary_contact',
    header: 'Contacto Principal',
    width: '18%',
    render: (c) =>
      c.primary_contact ? (
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">{c.primary_contact.name}</div>
          {c.primary_contact.email && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{c.primary_contact.email}</span>
            </div>
          )}
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">Sin contacto principal</span>
      ),
  },
  {
    key: 'info',
    header: 'Información',
    width: '16%',
    render: (c) => (
      <div className="space-y-0.5 min-w-0">
        {c.email && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{c.email}</span>
          </div>
        )}
        {c.phone && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{c.phone}</span>
          </div>
        )}
        {!c.email && !c.phone && <span className="text-muted-foreground text-sm">-</span>}
      </div>
    ),
  },
  {
    key: 'total_contacts',
    header: 'Contactos',
    sortable: true,
    width: '10%',
    align: 'center',
    render: (c) => (
      <div className="flex items-center justify-center gap-2">
        <div className="p-1.5 bg-blue-100 rounded-lg">
          <Users className="h-3.5 w-3.5 text-blue-600" />
        </div>
        <span className="text-sm font-medium">{c.total_contacts || 0}</span>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Estado',
    sortable: true,
    width: '10%',
    render: (c) => getStatusBadge(c.status),
  },
  {
    key: 'actions',
    header: '',
    width: '6%',
    align: 'right',
    render: (c) => (
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-emerald-100 hover:text-emerald-600"
          onClick={(e) => {
            e.stopPropagation()
            onEditCompany(c)
          }}
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>
      </div>
    ),
  },
]
