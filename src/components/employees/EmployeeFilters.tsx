import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, Search, X } from 'lucide-react'
import { useTeams } from '@/hooks/useTeams'

export interface EmployeeFilters {
  search: string
  department: string
  status: string
  contract_type: string
  position: string
  skills: string[]
  languages: string[]
  education_level: string
  hire_date_from: string
  hire_date_to: string
}

interface EmployeeFiltersProps {
  filters: EmployeeFilters
  onFiltersChange: (filters: EmployeeFilters) => void
  employeeCount: number
}

export function EmployeeFilters({ filters, onFiltersChange, employeeCount }: EmployeeFiltersProps) {
  const { departments } = useTeams()
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  const updateFilter = (key: keyof EmployeeFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      department: '',
      status: '',
      contract_type: '',
      position: '',
      skills: [],
      languages: [],
      education_level: '',
      hire_date_from: '',
      hire_date_to: ''
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== ''
  )

  const activeFiltersCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'search') return count
    if (Array.isArray(value)) return count + (value.length > 0 ? 1 : 0)
    return count + (value !== '' ? 1 : 0)
  }, 0)

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Filtros y Búsqueda
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              {employeeCount} empleado{employeeCount !== 1 ? 's' : ''} encontrado{employeeCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Búsqueda básica */}
        <div className="space-y-2">
          <Label htmlFor="search">Búsqueda General</Label>
          <Input
            id="search"
            placeholder="Buscar por nombre, email, posición..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>

        {/* Filtros básicos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Departamento</Label>
            <Select value={filters.department} onValueChange={(value) => updateFilter('department', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los departamentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los departamentos</SelectItem>
                <SelectItem value="none">Sin departamento</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Estado</Label>
            <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
                <SelectItem value="on_leave">De Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Contrato</Label>
            <Select value={filters.contract_type} onValueChange={(value) => updateFilter('contract_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los tipos</SelectItem>
                <SelectItem value="indefinido">Indefinido</SelectItem>
                <SelectItem value="temporal">Temporal</SelectItem>
                <SelectItem value="practicas">Prácticas</SelectItem>
                <SelectItem value="formacion">Formación</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtros avanzados */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 w-full justify-center">
              <span>Filtros Avanzados</span>
              {activeFiltersCount > 0 && (
                <span className="bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Posición</Label>
                <Input
                  placeholder="Filtrar por posición..."
                  value={filters.position}
                  onChange={(e) => updateFilter('position', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Nivel de Educación</Label>
                <Select value={filters.education_level} onValueChange={(value) => updateFilter('education_level', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los niveles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los niveles</SelectItem>
                    <SelectItem value="eso">ESO</SelectItem>
                    <SelectItem value="bachillerato">Bachillerato</SelectItem>
                    <SelectItem value="fp_medio">FP Grado Medio</SelectItem>
                    <SelectItem value="fp_superior">FP Grado Superior</SelectItem>
                    <SelectItem value="universitario">Universitario</SelectItem>
                    <SelectItem value="master">Máster</SelectItem>
                    <SelectItem value="doctorado">Doctorado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de Contratación - Desde</Label>
                <Input
                  type="date"
                  value={filters.hire_date_from}
                  onChange={(e) => updateFilter('hire_date_from', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Fecha de Contratación - Hasta</Label>
                <Input
                  type="date"
                  value={filters.hire_date_to}
                  onChange={(e) => updateFilter('hire_date_to', e.target.value)}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}