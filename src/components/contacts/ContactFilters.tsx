
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'

interface ContactFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  relationshipFilter: string
  setRelationshipFilter: (relationship: string) => void
}

export function ContactFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  relationshipFilter,
  setRelationshipFilter
}: ContactFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar contactos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="inactivo">Inactivo</SelectItem>
            <SelectItem value="prospecto">Prospecto</SelectItem>
            <SelectItem value="bloqueado">Bloqueado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={relationshipFilter} onValueChange={setRelationshipFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Relación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="prospecto">Prospecto</SelectItem>
            <SelectItem value="cliente">Cliente</SelectItem>
            <SelectItem value="ex_cliente">Ex-cliente</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
