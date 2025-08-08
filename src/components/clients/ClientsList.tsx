
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CompactCard, CompactCardContent, CompactCardHeader, CompactCardTitle } from '@/components/ui/compact-card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Plus } from 'lucide-react'
import { useClients, Client } from '@/hooks/useClients'
import { ClientFilters } from './ClientFilters'
import { ClientTable } from './ClientTable'
import { ClientEmptyState } from './ClientEmptyState'

interface ClientsListProps {
  onCreateClient: () => void
  onViewClient: (client: Client) => void
  onEditClient: (client: Client) => void
}

export const ClientsList = ({ onCreateClient, onViewClient, onEditClient }: ClientsListProps) => {
  const {
    filteredClients,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter
  } = useClients()

  const handleRefresh = () => {
    refetch()
  }

  const hasFilters = Boolean(searchTerm || statusFilter !== 'all' || typeFilter !== 'all')

  return (
    <CompactCard>
      <CompactCardHeader>
        <div className="flex items-center justify-between">
          <CompactCardTitle className="crm-section-title">
            {filteredClients.length} {filteredClients.length === 1 ? 'Cliente' : 'Clientes'}
          </CompactCardTitle>
          <div className="flex items-center gap-1">
            {error && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-1 h-7 px-2"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reintentar
              </Button>
            )}
          </div>
        </div>
        
        <ClientFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
        />
      </CompactCardHeader>
      
      <CompactCardContent>
        {error && (
          <div className="text-center py-6 text-red-600">
            <p className="crm-compact-title">Error al cargar clientes</p>
            <p className="crm-compact-text">{error.message}</p>
            <Button variant="outline" onClick={handleRefresh} className="mt-2" size="sm">
              Reintentar
            </Button>
          </div>
        )}
        
        {!error && isLoading && (
          <div className="flex justify-center py-6">
            <div className="crm-compact-text">Cargando clientes...</div>
          </div>
        )}
        
        {!error && !isLoading && filteredClients.length === 0 && (
          <ClientEmptyState
            hasFilters={hasFilters}
            onCreateClient={onCreateClient}
          />
        )}
        
        {!error && !isLoading && filteredClients.length > 0 && (
          <ClientTable
            clients={filteredClients}
            onViewClient={onViewClient}
            onEditClient={onEditClient}
          />
        )}
      </CompactCardContent>
    </CompactCard>
  )
}
