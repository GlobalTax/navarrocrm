
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'

interface CompaniesFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  sectorFilter: string
  setSectorFilter: (value: string) => void
}

export const CompaniesFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sectorFilter,
  setSectorFilter
}: CompaniesFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar por nombre, email o contacto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="activo">Activo</SelectItem>
          <SelectItem value="inactivo">Inactivo</SelectItem>
          <SelectItem value="prospecto">Prospecto</SelectItem>
          <SelectItem value="bloqueado">Bloqueado</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sectorFilter} onValueChange={setSectorFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Sector" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los sectores</SelectItem>
          <SelectItem value="tecnologia">Tecnología</SelectItem>
          <SelectItem value="construccion">Construcción</SelectItem>
          <SelectItem value="comercio">Comercio</SelectItem>
          <SelectItem value="servicios">Servicios</SelectItem>
          <SelectItem value="industria">Industria</SelectItem>
          <SelectItem value="otros">Otros</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
