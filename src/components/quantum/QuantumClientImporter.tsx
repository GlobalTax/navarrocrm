import { useState, useMemo } from 'react'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { useExistingContacts, detectDuplicate, type ExistingContact } from '@/hooks/useExistingContacts'
import { getUserOrgId } from '@/lib/quantum/orgId'
import { validateQuantumCustomer, validateContactForInsert } from '@/lib/quantum/validation'
import { handleQuantumError, createQuantumError } from '@/lib/quantum/errors'
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
  AlertCircle,
  Filter,
  Info,
  X
} from 'lucide-react'

interface QuantumCustomer {
  regid: string;
  nif: string;
  name: string;
  countryISO?: string;
  customerId: string;
  email?: string;
  phone?: string;
  streetType?: string;
  streetName?: string;
  streetNumber?: string;
  staircase?: string;
  floor?: string;
  room?: string;
  postCode?: string;
  cityCode?: string;
  iban?: string;
  swift?: string;
  paymentMethod?: string;
  family?: number;
  mandateReference?: string;
  mandateDate?: string;
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
    relationship_type: 'cliente', // CAMBIO: Por defecto cliente para Quantum
    status: 'activo'
  })
  const [isImporting, setIsImporting] = useState(false)
  const [filterMode, setFilterMode] = useState<'all' | 'new' | 'duplicates'>('all')

  const { data: clientsData, isLoading, error, refetch } = useQuery({
    queryKey: ['quantum-clients'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('quantum-clients')
      if (error) {
        console.error('Error en Edge Function:', error)
        throw new Error(`Error al conectar con Quantum: ${error.message}`)
      }
      if (!data?.success) {
        console.error('Error en API Quantum:', data?.error)
        throw new Error(data?.error || 'Error desconocido en la API de Quantum')
      }
      return data
    },
    retry: 2,
    retryDelay: 1000
  })

  const { data: existingContacts = [], isLoading: isLoadingContacts } = useExistingContacts()
  const customers: QuantumCustomer[] = clientsData?.data?.customers || []

  // Calcular duplicados y aplicar filtros
  const customersWithDuplicates = useMemo(() => {
    return customers.map(customer => ({
      ...customer,
      duplicateInfo: detectDuplicate(customer, existingContacts)
    }))
  }, [customers, existingContacts])

  const filteredCustomers = customersWithDuplicates.filter(customer => {
    const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.nif?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false

    // Aplicar filtro de duplicados
    if (filterMode === 'new' && customer.duplicateInfo.isDuplicate) return false
    if (filterMode === 'duplicates' && !customer.duplicateInfo.isDuplicate) return false
    
    return true
  })

  // Estadísticas
  const stats = useMemo(() => {
    const total = customersWithDuplicates.length
    const duplicates = customersWithDuplicates.filter(c => c.duplicateInfo.isDuplicate).length
    const newContacts = total - duplicates
    
    return { total, duplicates, newContacts }
  }, [customersWithDuplicates])

  const handleSelectAll = () => {
    // Solo seleccionar contactos que no son duplicados
    const selectableCustomers = filteredCustomers.filter(c => !c.duplicateInfo.isDuplicate)
    
    if (selectedClients.length === selectableCustomers.length) {
      setSelectedClients([])
    } else {
      setSelectedClients(selectableCustomers.map(customer => customer.customerId))
    }
  }

  const handleClientToggle = (customerId: string) => {
    // Verificar si es un duplicado antes de permitir la selección
    const customer = customersWithDuplicates.find(c => c.customerId === customerId)
    if (customer?.duplicateInfo.isDuplicate) return
    
    setSelectedClients(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    )
  }

  const handleImport = async () => {
    if (selectedClients.length === 0) {
      toast.error('Selecciona al menos un cliente para importar')
      return
    }

    setIsImporting(true)
    
    try {
      const customersToImport = customersWithDuplicates.filter(customer => 
        selectedClients.includes(customer.customerId) && !customer.duplicateInfo.isDuplicate
      )
      
      // Obtener org_id de forma centralizada
      const orgId = await getUserOrgId()

      // Validar y preparar datos para inserción
      const contactsData = []
      const validationErrors = []

      for (const customer of customersToImport) {
        // Validar customer de Quantum
        const customerValidation = validateQuantumCustomer(customer)
        if (!customerValidation.success) {
          validationErrors.push(`${customer.name}: ${customerValidation.error.issues.map(i => i.message).join(', ')}`)
          continue
        }

        // Determinar el tipo de cliente con heurística mejorada
        const nameUpper = (customer.name || '').toUpperCase().trim()
        const nifTrimmed = (customer.nif || '').trim()
        
        // Patrones de nombre de empresa
        const companyNamePatterns = [
          /\b(S\.?L\.?U?|S\.?A\.?|S\.?L\.?L\.?|S\.?C\.?|S\.?COOP)\b/i,
          /\b(LIMITED|LTD|GMBH|INC|CORP|LLC|PLC)\b/i,
          /\b(SOCIEDAD|FUNDACI[OÓ]N|ASOCIACI[OÓ]N|ASSOCIACI[OÓ]|COOPERATIVA)\b/i,
          /\b(COMMUNITY|GROUP|HOLDING|CAPITAL|CONSULTING|PARTNERS)\b/i,
        ]
        const nameMatchesCompany = companyNamePatterns.some(p => p.test(nameUpper))
        // NIF de empresa: letras A-H, J-N, P-S, U, V, W (excluye X,Y,Z que son NIE)
        const nifMatchesCompany = nifTrimmed && /^[A-HJ-NP-SUVW]/.test(nifTrimmed)
        const isCompany = nameMatchesCompany || nifMatchesCompany
        
        // Construir dirección completa
        const addressParts = [
          customer.streetType,
          customer.streetName,
          customer.streetNumber,
          customer.floor && `Piso ${customer.floor}`,
          customer.room && `Puerta ${customer.room}`
        ].filter(Boolean)
        
        const fullAddress = addressParts.length > 0 ? addressParts.join(' ') : null
        
        const contactData = {
          name: customer.name,
          email: customer.email || null,
          phone: customer.phone || null,
          dni_nif: customer.nif || null,
          client_type: isCompany ? 'empresa' : mapping.client_type,
          relationship_type: mapping.relationship_type,
          status: mapping.status,
          address_street: fullAddress,
          address_city: customer.cityCode || null,
          address_postal_code: customer.postCode || null,
          address_country: customer.countryISO === 'ES' ? 'España' : customer.countryISO || null,
          internal_notes: `Importado desde Quantum Economics - ID: ${customer.customerId} (RegID: ${customer.regid})`,
          tags: ['quantum-import'],
          org_id: orgId,
          quantum_customer_id: customer.customerId,
          source: 'quantum_import'
        }

        // Validar datos de contacto
        const contactValidation = validateContactForInsert(contactData)
        if (!contactValidation.success) {
          validationErrors.push(`${customer.name}: ${contactValidation.error.issues.map(i => i.message).join(', ')}`)
          continue
        }

        contactsData.push(contactData)
      }

      // Mostrar errores de validación si los hay
      if (validationErrors.length > 0) {
        console.warn('Errores de validación:', validationErrors)
        toast.error(`${validationErrors.length} contactos tienen errores de validación`)
      }

      if (contactsData.length === 0) {
        throw createQuantumError('VALIDATION_ERROR', 'No hay contactos válidos para importar')
      }

      const { error } = await supabase
        .from('contacts')
        .insert(contactsData)

      if (error) {
        throw createQuantumError('DATABASE_ERROR', `Error al insertar contactos: ${error.message}`)
      }

      toast.success(`${contactsData.length} contactos importados correctamente`)
      setSelectedClients([])
      
    } catch (error) {
      const quantumError = handleQuantumError(error, {
        component: 'QuantumClientImporter',
        action: 'handleImport'
      })
      
      console.error('Error al importar:', quantumError)
      toast.error(quantumError.userMessage)
    } finally {
      setIsImporting(false)
    }
  }

  if (isLoading || isLoadingContacts) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            {isLoading ? 'Cargando datos de Quantum Economics...' : 'Cargando contactos existentes...'}
          </span>
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
          <p className="text-muted-foreground mb-4 text-center">
            {error.message || 'No se pudieron obtener los datos de Quantum Economics'}
          </p>
          <div className="flex gap-2">
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
            <Button 
              onClick={() => window.open('https://supabase.com/dashboard/project/jzbbbwfnzpwxmuhpbdya/functions/quantum-clients/logs', '_blank')}
              variant="ghost"
              size="sm"
            >
              Ver logs
            </Button>
          </div>
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
          
          {/* Estadísticas de importación */}
          <div className="flex items-center gap-4 mt-4 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white">
                Total: {stats.total}
              </Badge>
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                Nuevos: {stats.newContacts}
              </Badge>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                Duplicados: {stats.duplicates}
              </Badge>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Los duplicados se detectan por email, DNI/NIF o nombre similar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          {/* Búsqueda y filtros */}
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
            
            {/* Filtro de duplicados */}
            <Select value={filterMode} onValueChange={(value: 'all' | 'new' | 'duplicates') => setFilterMode(value)}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos ({stats.total})</SelectItem>
                <SelectItem value="new">Solo nuevos ({stats.newContacts})</SelectItem>
                <SelectItem value="duplicates">Solo duplicados ({stats.duplicates})</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSelectAll}
              disabled={filteredCustomers.filter(c => !c.duplicateInfo.isDuplicate).length === 0}
            >
              {selectedClients.length === filteredCustomers.filter(c => !c.duplicateInfo.isDuplicate).length ? 'Deseleccionar' : 'Seleccionar'} Nuevos
            </Button>
          </div>

          {/* Lista de clientes */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {filteredCustomers.map((customer) => {
                const isCompany = customer.nif && /^[A-Z]/.test(customer.nif.trim())
                const addressParts = [
                  customer.streetType,
                  customer.streetName,
                  customer.streetNumber
                ].filter(Boolean).join(' ')
                
                const isDuplicate = customer.duplicateInfo.isDuplicate
                
                return (
                  <div 
                    key={customer.customerId} 
                    className={`flex items-center space-x-4 p-3 border rounded-lg transition-colors ${
                      isDuplicate 
                        ? 'bg-yellow-50 border-yellow-200 opacity-60' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Checkbox 
                              checked={selectedClients.includes(customer.customerId)}
                              onCheckedChange={() => handleClientToggle(customer.customerId)}
                              disabled={isDuplicate}
                              className={isDuplicate ? 'opacity-50' : ''}
                            />
                          </div>
                        </TooltipTrigger>
                        {isDuplicate && (
                          <TooltipContent>
                            <p>Ya existe: {customer.duplicateInfo.reason}</p>
                            {customer.duplicateInfo.existingContact && (
                              <p className="text-xs mt-1">
                                Contacto: {customer.duplicateInfo.existingContact.name}
                              </p>
                            )}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isCompany ? (
                          <Building className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <User className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className={`font-medium truncate ${isDuplicate ? 'line-through text-muted-foreground' : ''}`}>
                          {customer.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          ID: {customer.customerId}
                        </Badge>
                        {isCompany && (
                          <Badge variant="secondary" className="text-xs">
                            Empresa
                          </Badge>
                        )}
                        {isDuplicate && (
                          <Badge variant="destructive" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                            Ya existe
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {customer.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {customer.phone}
                          </div>
                        )}
                        {customer.nif && (
                          <div className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {customer.nif}
                          </div>
                        )}
                        {addressParts && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {addressParts}
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
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            Detalles del Cliente
                            {isDuplicate && (
                              <Badge variant="destructive" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                Duplicado
                              </Badge>
                            )}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {isDuplicate && customer.duplicateInfo.existingContact && (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <h4 className="font-medium text-yellow-800 mb-2">Contacto Existente</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <Label>Nombre existente</Label>
                                  <p className="text-muted-foreground">{customer.duplicateInfo.existingContact.name}</p>
                                </div>
                                <div>
                                  <Label>Email existente</Label>
                                  <p className="text-muted-foreground">{customer.duplicateInfo.existingContact.email || 'No disponible'}</p>
                                </div>
                                <div className="col-span-2">
                                  <Label>Motivo de duplicado</Label>
                                  <p className="text-yellow-800 font-medium">{customer.duplicateInfo.reason}</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div>
                            <Label>Nombre (Quantum)</Label>
                            <p className="text-sm text-muted-foreground">{customer.name}</p>
                          </div>
                          <div>
                            <Label>Datos Completos</Label>
                            <ScrollArea className="h-48 mt-2">
                              <pre className="text-xs bg-muted p-2 rounded">
                                {JSON.stringify(customer, null, 2)}
                              </pre>
                            </ScrollArea>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )
              })}
              
              {filteredCustomers.length === 0 && (
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