import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { 
  RefreshCw, 
  Download, 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Hash,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface QuantumClient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  nif?: string;
  type?: string;
  status?: string;
  [key: string]: any;
}

interface ImportMapping {
  client_type: 'particular' | 'empresa';
  relationship_type: 'prospecto' | 'cliente' | 'ex_cliente';
  status: 'activo' | 'inactivo' | 'bloqueado';
}

interface QuantumClientImporterProps {
  type: 'clients' | 'companies'
}

export function QuantumClientImporter({ type }: QuantumClientImporterProps) {
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [mapping, setMapping] = useState<ImportMapping>({
    client_type: type === 'companies' ? 'empresa' : 'particular',
    relationship_type: 'prospecto',
    status: 'activo'
  })
  const [isImporting, setIsImporting] = useState(false)

  const { data: clientsData, isLoading, error, refetch } = useQuery({
    queryKey: ['quantum-clients'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('quantum-clients')
      if (error) throw error
      return data
    },
    retry: 1
  })

  const clients: QuantumClient[] = clientsData?.data?.clients || []

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.nif?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filtrar por tipo si es necesario
    if (type === 'companies') {
      return matchesSearch && (client.type === 'empresa' || client.type === 'company')
    } else {
      return matchesSearch && (client.type !== 'empresa' && client.type !== 'company')
    }
  })

  const handleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([])
    } else {
      setSelectedClients(filteredClients.map(client => client.id))
    }
  }

  const handleClientToggle = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    )
  }

  const handleImport = async () => {
    if (selectedClients.length === 0) {
      toast.error('Selecciona al menos un cliente para importar')
      return
    }

    setIsImporting(true)
    
    try {
      const clientsToImport = clients.filter(client => selectedClients.includes(client.id))
      
      // Obtener el org_id del usuario actual
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        throw new Error('Usuario no autenticado')
      }

      const { data: userProfile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', userData.user.id)
        .single()

      if (!userProfile?.org_id) {
        throw new Error('No se pudo obtener la organización del usuario')
      }

      // Preparar datos para inserción
      const contactsData = clientsToImport.map(client => ({
        name: client.name,
        email: client.email || null,
        phone: client.phone || null,
        dni_nif: client.nif || null,
        client_type: mapping.client_type,
        relationship_type: mapping.relationship_type,
        status: mapping.status,
        address_street: client.address || null,
        internal_notes: `Importado desde Quantum Economics - ID: ${client.id}`,
        tags: ['quantum-import'],
        org_id: userProfile.org_id
      }))

      const { error } = await supabase
        .from('contacts')
        .insert(contactsData)

      if (error) throw error

      toast.success(`${clientsToImport.length} contactos importados correctamente`)
      setSelectedClients([])
      
    } catch (error) {
      console.error('Error al importar:', error)
      toast.error('Error al importar contactos')
    } finally {
      setIsImporting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Cargando datos de Quantum Economics...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error al cargar datos</h3>
          <p className="text-muted-foreground mb-4">No se pudieron obtener los datos de Quantum Economics</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Configuración de importación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {type === 'companies' ? <Building className="w-5 h-5" /> : <User className="w-5 h-5" />}
            Configuración de Importación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_type">Tipo de Cliente</Label>
              <Select 
                value={mapping.client_type} 
                onValueChange={(value: 'particular' | 'empresa') => 
                  setMapping(prev => ({ ...prev, client_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="particular">Particular</SelectItem>
                  <SelectItem value="empresa">Empresa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="relationship_type">Tipo de Relación</Label>
              <Select 
                value={mapping.relationship_type} 
                onValueChange={(value: 'prospecto' | 'cliente' | 'ex_cliente') => 
                  setMapping(prev => ({ ...prev, relationship_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospecto">Prospecto</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="ex_cliente">Ex-Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select 
                value={mapping.status} 
                onValueChange={(value: 'activo' | 'inactivo' | 'bloqueado') => 
                  setMapping(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="bloqueado">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de clientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              {type === 'companies' ? 'Empresas' : 'Clientes'} de Quantum Economics
              <Badge variant="secondary">{filteredClients.length}</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => refetch()} 
                variant="outline" 
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={selectedClients.length === 0 || isImporting}
                size="sm"
              >
                {isImporting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Importar {selectedClients.length > 0 && `(${selectedClients.length})`}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Búsqueda */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre, email o NIF..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedClients.length === filteredClients.length ? 'Deseleccionar' : 'Seleccionar'} Todo
            </Button>
          </div>

          {/* Lista de clientes */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {filteredClients.map((client) => (
                <div 
                  key={client.id} 
                  className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-muted/50"
                >
                  <Checkbox 
                    checked={selectedClients.includes(client.id)}
                    onCheckedChange={() => handleClientToggle(client.id)}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {type === 'companies' ? (
                        <Building className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <User className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="font-medium truncate">{client.name}</span>
                      <Badge variant="outline" className="text-xs">
                        ID: {client.id}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {client.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {client.phone}
                        </div>
                      )}
                      {client.nif && (
                        <div className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          {client.nif}
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {client.address}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Ver Detalles
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Detalles del Cliente</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Nombre</Label>
                          <p className="text-sm text-muted-foreground">{client.name}</p>
                        </div>
                        <div>
                          <Label>Datos Completos</Label>
                          <ScrollArea className="h-48 mt-2">
                            <pre className="text-xs bg-muted p-2 rounded">
                              {JSON.stringify(client, null, 2)}
                            </pre>
                          </ScrollArea>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
              
              {filteredClients.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No se encontraron resultados' : 'No hay datos disponibles'}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}