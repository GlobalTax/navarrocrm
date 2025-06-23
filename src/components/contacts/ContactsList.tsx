
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Plus } from 'lucide-react'
import { useContacts, Contact } from '@/hooks/useContacts'
import { ContactFilters } from './ContactFilters'
import { ContactTable } from './ContactTable'
import { ContactEmptyState } from './ContactEmptyState'

interface ContactsListProps {
  onCreateContact: () => void
  onViewContact: (contact: Contact) => void
  onEditContact: (contact: Contact) => void
}

export const ContactsList = ({ onCreateContact, onViewContact, onEditContact }: ContactsListProps) => {
  const {
    filteredContacts,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    relationshipFilter,
    setRelationshipFilter
  } = useContacts()

  const handleRefresh = () => {
    refetch()
  }

  const hasFilters = Boolean(searchTerm || statusFilter !== 'all' || relationshipFilter !== 'all')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {filteredContacts.length} {filteredContacts.length === 1 ? 'Contacto' : 'Contactos'}
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
        
        <ContactFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          relationshipFilter={relationshipFilter}
          setRelationshipFilter={setRelationshipFilter}
        />
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="text-center py-8 text-red-600">
            <p className="font-medium">Error al cargar contactos</p>
            <p className="text-sm">{error.message}</p>
            <Button variant="outline" onClick={handleRefresh} className="mt-2">
              Reintentar
            </Button>
          </div>
        )}
        
        {!error && isLoading && (
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Cargando contactos...</div>
          </div>
        )}
        
        {!error && !isLoading && filteredContacts.length === 0 && (
          <ContactEmptyState
            hasFilters={hasFilters}
            onCreateContact={onCreateContact}
          />
        )}
        
        {!error && !isLoading && filteredContacts.length > 0 && (
          <ContactTable
            contacts={filteredContacts}
            onViewContact={onViewContact}
            onEditContact={onEditContact}
          />
        )}
      </CardContent>
    </Card>
  )
}
