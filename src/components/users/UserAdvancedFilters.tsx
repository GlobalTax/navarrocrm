
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X, Calendar } from 'lucide-react'

export interface UserFilters {
  search: string
  role: string
  status: string
  lastLoginDays?: number
  createdAfter?: string
  createdBefore?: string
}

interface UserAdvancedFiltersProps {
  filters: UserFilters
  onFiltersChange: (filters: UserFilters) => void
  userCount: number
}

export const UserAdvancedFilters = ({ filters, onFiltersChange, userCount }: UserAdvancedFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== '' && value !== 'all' && value !== undefined
  ).length

  const resetFilters = () => {
    onFiltersChange({
      search: '',
      role: 'all',
      status: 'all'
    })
  }

  const hasActiveFilters = activeFiltersCount > 0

  return (
    <Card className="border-slate-200">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Filtros básicos */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por email o nombre..."
                value={filters.search}
                onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                className="pl-10 border-slate-300"
              />
            </div>

            <div className="flex gap-2">
              <Select 
                value={filters.role} 
                onValueChange={(value) => onFiltersChange({ ...filters, role: value })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="area_manager">Area Manager</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="finance">Finanzas</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.status} 
                onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex items-center gap-2 ${isExpanded ? 'bg-slate-50' : ''}`}
              >
                <Filter className="h-4 w-4" />
                Más filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Filtros avanzados */}
          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Últimos días activo</label>
                <Select 
                  value={filters.lastLoginDays?.toString() || ''} 
                  onValueChange={(value) => onFiltersChange({ 
                    ...filters, 
                    lastLoginDays: value ? parseInt(value) : undefined 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquier momento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Cualquier momento</SelectItem>
                    <SelectItem value="7">Últimos 7 días</SelectItem>
                    <SelectItem value="30">Últimos 30 días</SelectItem>
                    <SelectItem value="90">Últimos 90 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Creado después de</label>
                <Input
                  type="date"
                  value={filters.createdAfter || ''}
                  onChange={(e) => onFiltersChange({ ...filters, createdAfter: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Creado antes de</label>
                <Input
                  type="date"
                  value={filters.createdBefore || ''}
                  onChange={(e) => onFiltersChange({ ...filters, createdBefore: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Resultados y reset */}
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              {userCount} usuario{userCount !== 1 ? 's' : ''} encontrado{userCount !== 1 ? 's' : ''}
            </span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-slate-600 hover:text-slate-900"
              >
                <X className="h-4 w-4 mr-1" />
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
