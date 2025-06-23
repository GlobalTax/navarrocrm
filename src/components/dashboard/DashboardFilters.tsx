
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Filter, 
  RefreshCw,
  Clock,
  BarChart3
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface DashboardFiltersProps {
  dateRange: 'week' | 'month' | 'quarter'
  onDateRangeChange: (range: 'week' | 'month' | 'quarter') => void
  onRefresh: () => void
  isRefreshing?: boolean
}

export const DashboardFilters = ({ 
  dateRange, 
  onDateRangeChange, 
  onRefresh,
  isRefreshing = false 
}: DashboardFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false)

  const dateRangeOptions = [
    { value: 'week' as const, label: '7 días', icon: Clock },
    { value: 'month' as const, label: '30 días', icon: Calendar },
    { value: 'quarter' as const, label: '90 días', icon: BarChart3 }
  ]

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {dateRangeOptions.map((option) => {
                const Icon = option.icon
                return (
                  <Button
                    key={option.value}
                    variant={dateRange === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => onDateRangeChange(option.value)}
                    className={cn(
                      "gap-2",
                      dateRange === option.value && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </Button>
                )
              })}
            </div>
            
            {showFilters && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">Filtros activos</Badge>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              Actualizar
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Tipo de datos</label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">Todos</Badge>
                  <Badge variant="secondary">Facturables</Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Usuario</label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">Todos</Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Estado</label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">Activos</Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
