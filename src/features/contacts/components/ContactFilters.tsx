import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

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
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300)

  // Sincronizar el valor debounced con el estado padre
  useEffect(() => {
    setSearchTerm(debouncedSearchTerm)
  }, [debouncedSearchTerm, setSearchTerm])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar por nombre o email..."
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="active">Activo</SelectItem>
          <SelectItem value="inactive">Inactivo</SelectItem>
        </SelectContent>
      </Select>

      <Select value={relationshipFilter} onValueChange={setRelationshipFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Relación" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las relaciones</SelectItem>
          <SelectItem value="cliente">Cliente</SelectItem>
          <SelectItem value="prospecto">Prospecto</SelectItem>
          <SelectItem value="proveedor">Proveedor</SelectItem>
          <SelectItem value="colaborador">Colaborador</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}