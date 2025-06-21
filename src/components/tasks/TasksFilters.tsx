
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Scale } from 'lucide-react'

interface TasksFiltersProps {
  filters: {
    status: string
    priority: string
    assignee: string
    search: string
  }
  onFiltersChange: (filters: any) => void
}

export const TasksFilters = ({ filters, onFiltersChange }: TasksFiltersProps) => {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar escritos, comparecencias..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Estado procesal" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="pending">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              Pendiente
            </div>
          </SelectItem>
          <SelectItem value="investigation">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              Investigación
            </div>
          </SelectItem>
          <SelectItem value="drafting">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              Redacción
            </div>
          </SelectItem>
          <SelectItem value="review">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              Revisión
            </div>
          </SelectItem>
          <SelectItem value="filing">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Presentación
            </div>
          </SelectItem>
          <SelectItem value="hearing">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              Audiencia
            </div>
          </SelectItem>
          <SelectItem value="completed">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              Completada
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value)}>
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Urgencia legal" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las urgencias</SelectItem>
          <SelectItem value="critical">
            <div className="flex items-center gap-2">
              <Scale className="h-3 w-3 text-red-600" />
              <span className="text-red-600 font-medium">Vencimiento crítico</span>
            </div>
          </SelectItem>
          <SelectItem value="urgent">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Urgente (24-48h)
            </div>
          </SelectItem>
          <SelectItem value="high">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Alta (esta semana)
            </div>
          </SelectItem>
          <SelectItem value="medium">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              Normal (este mes)
            </div>
          </SelectItem>
          <SelectItem value="low">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Baja
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
