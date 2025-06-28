
import { useState } from 'react'
import { useClients } from '@/hooks/useClients'
import { PremiumPageHeader } from '@/components/layout/PremiumPageHeader'
import { PremiumFilters } from '@/components/layout/PremiumFilters'
import { ClientsList } from '@/components/clients/ClientsList'
import { ClientsDialogManager } from '@/components/clients/ClientsDialogManager'
import { ClientMetricsDashboard } from '@/components/clients/ClientMetricsDashboard'

export default function Clients() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const { clients } = useClients()

  const handleCreateClient = () => {
    setIsCreateDialogOpen(true)
  }

  const handleViewClient = (client: any) => {
    setSelectedClient(client)
    setIsViewDialogOpen(true)
  }

  const handleEditClient = (client: any) => {
    setSelectedClient(client)
    setIsEditDialogOpen(true)
  }

  const statusOptions = [
    { label: 'Todos los estados', value: 'all' },
    { label: 'Activos', value: 'activo' },
    { label: 'Inactivos', value: 'inactivo' },
    { label: 'Prospectos', value: 'prospecto' }
  ]

  const typeOptions = [
    { label: 'Todos los tipos', value: 'all' },
    { label: 'Empresas', value: 'empresa' },
    { label: 'Particulares', value: 'particular' },
    { label: 'Autónomos', value: 'autonomo' }
  ]

  const hasActiveFilters = Boolean(
    searchTerm || 
    statusFilter !== 'all' || 
    typeFilter !== 'all'
  )

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setTypeFilter('all')
  }

  return (
    <div className="min-h-screen bg-premium-gray-5 p-6">
      <div className="max-w-7xl mx-auto premium-spacing-xl">
        <PremiumPageHeader
          title="Clientes"
          description="Gestiona tu cartera de clientes y prospectos comerciales"
          badges={[
            { label: `${clients.length} clientes`, variant: 'primary' }
          ]}
          primaryAction={{
            label: 'Nuevo Cliente',
            onClick: handleCreateClient
          }}
        />

        <ClientMetricsDashboard />

        <div className="premium-spacing-lg">
          <PremiumFilters
            searchPlaceholder="Buscar clientes..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filters={[
              {
                placeholder: 'Estado',
                value: statusFilter,
                onChange: setStatusFilter,
                options: statusOptions
              },
              {
                placeholder: 'Tipo',
                value: typeFilter,
                onChange: setTypeFilter,
                options: typeOptions
              }
            ]}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
          />

          <div className="mt-6">
            <ClientsList 
              onCreateClient={handleCreateClient}
              onViewClient={handleViewClient}
              onEditClient={handleEditClient}
            />
          </div>
        </div>

        <ClientsDialogManager
          isCreateDialogOpen={isCreateDialogOpen}
          setIsCreateDialogOpen={setIsCreateDialogOpen}
          isViewDialogOpen={isViewDialogOpen}
          setIsViewDialogOpen={setIsViewDialogOpen}
          isEditDialogOpen={isEditDialogOpen}
          setIsEditDialogOpen={setIsEditDialogOpen}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
        />
      </div>
    </div>
  )
}
