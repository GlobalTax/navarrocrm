
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
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

  const hasFilters = searchTerm || statusFilter !== 'all' || typeFilter !== 'all'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Lista de Clientes ({filteredClients.length})
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
        </CardTitle>
        
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
        
        {!error && isLoading && (
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
        
        {!error && !isLoading && filteredClients.length > 0 && (
          <ClientTable
            clients={filteredClients}
            onViewClient={onViewClient}
            onEditClient={onEditClient}
          />
        )}
      </CardContent>
    </Card>
  )
}
