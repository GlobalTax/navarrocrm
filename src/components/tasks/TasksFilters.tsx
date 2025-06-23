
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'

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
          placeholder="Buscar tareas..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="pending">Por Hacer</SelectItem>
          <SelectItem value="in_progress">En Curso</SelectItem>
          <SelectItem value="completed">Completadas</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value)}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Prioridad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="high">🔴 Alta</SelectItem>
          <SelectItem value="medium">🟡 Media</SelectItem>
          <SelectItem value="low">🟢 Baja</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
