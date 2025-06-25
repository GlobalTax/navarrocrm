
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Plus, Loader2 } from 'lucide-react'
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
    hasMore,
    loadMore,
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

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      loadMore()
    }
  }

  const hasFilters = Boolean(searchTerm || statusFilter !== 'all' || typeFilter !== 'all')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {filteredClients.length} {filteredClients.length === 1 ? 'Cliente' : 'Clientes'}
            {hasMore && <span className="text-sm text-gray-500 ml-2">(cargando más...)</span>}
          </CardTitle>
          <div className="flex items-center gap-2">
            {error && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
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
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="text-center py-8 text-red-600">
            <p className="font-medium">Error al cargar clientes</p>
            <p className="text-sm">{error.message}</p>
            <Button variant="outline" onClick={handleRefresh} className="mt-2">
              Reintentar
            </Button>
          </div>
        )}
        
        {!error && isLoading && filteredClients.length === 0 && (
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Cargando clientes...</div>
          </div>
        )}
        
        {!error && !isLoading && filteredClients.length === 0 && (
          <ClientEmptyState
            hasFilters={hasFilters}
            onCreateClient={onCreateClient}
          />
        )}
        
        {!error && filteredClients.length > 0 && (
          <div className="space-y-4">
            <ClientTable
              clients={filteredClients}
              onViewClient={onViewClient}
              onEditClient={onEditClient}
            />
            
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    'Cargar más clientes'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
