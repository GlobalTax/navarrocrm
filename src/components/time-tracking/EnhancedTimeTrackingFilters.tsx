import { Search, Filter, CalendarDays, DollarSign, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { useCasesList } from '@/features/cases'

export const EnhancedTimeTrackingFilters = () => {
  const { 
    searchTerm, 
    setSearchTerm,
    caseFilter, 
    setCaseFilter,
    billableFilter, 
    setBillableFilter,
    billingStatusFilter,
    setBillingStatusFilter,
    filteredTimeEntries 
  } = useTimeEntries()
  
  const { cases } = useCasesList()

  const getTotalHours = () => {
    const totalMinutes = filteredTimeEntries.reduce((sum, entry) => sum + entry.duration_minutes, 0)
    return (totalMinutes / 60).toFixed(1)
  }

  const getBillableHours = () => {
    const billableMinutes = filteredTimeEntries
      .filter(entry => entry.is_billable && entry.billing_status === 'unbilled')
      .reduce((sum, entry) => sum + entry.duration_minutes, 0)
    return (billableMinutes / 60).toFixed(1)
  }

  return (
    <div className="space-y-4">
      {/* Filtros principales */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por descripción, caso o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={caseFilter} onValueChange={setCaseFilter}>
          <SelectTrigger className="w-[200px]">
            <CalendarDays className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar por caso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los casos</SelectItem>
            {cases.map((case_) => (
              <SelectItem key={case_.id} value={case_.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{case_.title}</span>
                  {case_.contact && (
                    <span className="text-xs text-muted-foreground">
                      {case_.contact.name}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={billableFilter} onValueChange={setBillableFilter}>
          <SelectTrigger className="w-[150px]">
            <DollarSign className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="billable">Facturables</SelectItem>
            <SelectItem value="non-billable">No facturables</SelectItem>
          </SelectContent>
        </Select>

        <Select value={billingStatusFilter} onValueChange={setBillingStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Estado facturación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="unbilled">Sin facturar</SelectItem>
            <SelectItem value="billed">Facturado</SelectItem>
            <SelectItem value="invoiced">Cobrado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resumen de filtros aplicados */}
      <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-lg border border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {filteredTimeEntries.length} entradas
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <span className="text-sm">
              <strong>{getTotalHours()}h</strong> total
            </span>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm">
              <strong>{getBillableHours()}h</strong> sin facturar
            </span>
          </div>
        </div>

        {/* Badges de filtros activos */}
        <div className="flex items-center gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="text-xs">
              Búsqueda: {searchTerm}
            </Badge>
          )}
          {caseFilter !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Caso específico
            </Badge>
          )}
          {billableFilter !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              {billableFilter === 'billable' ? 'Solo facturables' : 'No facturables'}
            </Badge>
          )}
          {billingStatusFilter !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              {billingStatusFilter === 'unbilled' ? 'Sin facturar' : 
               billingStatusFilter === 'billed' ? 'Facturado' : 'Cobrado'}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}