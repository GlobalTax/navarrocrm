import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, User, Building, ArrowRight, UserPlus } from 'lucide-react'
import { useContacts } from '@/hooks/useContacts'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ProspectSelectorProps {
  onProspectSelected: (prospect: any) => void
  onCreateNew: () => void
}

export const ProspectSelector: React.FC<ProspectSelectorProps> = ({
  onProspectSelected,
  onCreateNew
}) => {
  const { contacts, isLoading } = useContacts()
  const [searchTerm, setSearchTerm] = useState('')

  // Filtrar solo prospectos
  const prospects = contacts.filter(contact => 
    contact.relationship_type === 'prospecto'
  )

  // Filtrar por búsqueda
  const filteredProspects = prospects.filter(prospect =>
    prospect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prospect.email && prospect.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (prospect.business_sector && prospect.business_sector.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{prospects.length}</div>
            <div className="text-sm text-gray-600">Prospectos Totales</div>
          </CardContent>
        </Card>
        
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {prospects.filter(p => p.client_type === 'empresa').length}
            </div>
            <div className="text-sm text-gray-600">Empresas</div>
          </CardContent>
        </Card>
        
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {prospects.filter(p => p.client_type === 'particular').length}
            </div>
            <div className="text-sm text-gray-600">Particulares</div>
          </CardContent>
        </Card>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -y translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar por nombre, email o sector..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-0.5 border-black rounded-[10px]"
        />
      </div>

      {/* Lista de prospectos */}
      {filteredProspects.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300 rounded-[10px]">
          <CardContent className="p-8 text-center">
            <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {prospects.length === 0 ? 'No hay prospectos disponibles' : 'No se encontraron prospectos'}
            </h3>
            <p className="text-gray-600 mb-4">
              {prospects.length === 0 
                ? 'Necesitas crear algunos prospectos primero antes de convertirlos en clientes.'
                : 'Prueba con otros términos de búsqueda o crea un cliente nuevo.'
              }
            </p>
            <Button 
              onClick={onCreateNew}
              className="border-0.5 border-black rounded-[10px] bg-primary text-white hover:bg-primary/90"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Crear Cliente Nuevo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Prospectos Disponibles ({filteredProspects.length})
            </h3>
            <Button 
              variant="outline"
              onClick={onCreateNew}
              className="border-0.5 border-black rounded-[10px] hover-lift"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Crear Nuevo
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredProspects.map((prospect) => (
              <Card 
                key={prospect.id} 
                className="border-0.5 border-black rounded-[10px] hover-lift transition-all cursor-pointer"
                onClick={() => onProspectSelected(prospect)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-gray-100 rounded-[10px]">
                        {prospect.client_type === 'empresa' ? (
                          <Building className="h-5 w-5 text-gray-600" />
                        ) : (
                          <User className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 truncate">
                            {prospect.name}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className="border-0.5 border-black rounded-[10px]"
                          >
                            {prospect.client_type === 'empresa' ? 'Empresa' : 'Particular'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          {prospect.email && (
                            <div>{prospect.email}</div>
                          )}
                          {prospect.phone && (
                            <div>{prospect.phone}</div>
                          )}
                          {prospect.business_sector && (
                            <div className="font-medium">
                              Sector: {prospect.business_sector}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        className="border-0.5 border-black rounded-[10px] bg-primary text-white hover:bg-primary/90"
                      >
                        Convertir a Cliente
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Info adicional */}
      <Alert>
        <UserPlus className="h-4 w-4" />
        <AlertDescription>
          <strong>Conversión automática:</strong> Al seleccionar un prospecto, 
          se mantendrán todos sus datos existentes y solo se cambiará su estado a "cliente". 
          Podrás revisar y completar la información antes de finalizar.
        </AlertDescription>
      </Alert>
    </div>
  )
}