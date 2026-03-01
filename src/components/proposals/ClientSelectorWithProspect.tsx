
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, Check, AlertCircle, ChevronsUpDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { useClients } from '@/hooks/useClients'
import { useContacts } from '@/hooks/useContacts'
import { useProspectToClient } from '@/hooks/proposals/useProspectToClient'
import { ProspectToClientForm } from './ProspectToClientForm'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ClientSelectorWithProspectProps {
  selectedClientId: string
  onClientSelected: (clientId: string) => void
}

export const ClientSelectorWithProspect: React.FC<ClientSelectorWithProspectProps> = ({
  selectedClientId,
  onClientSelected
}) => {
  const { clients, isLoading, error } = useClients()
  const { contacts } = useContacts()
  const [mode, setMode] = useState<'existing' | 'convert' | 'new'>('existing')
  const [selectedProspect, setSelectedProspect] = useState<any>(null)
  
  const {
    prospectData,
    setProspectData,
    createClientFromProspect,
    isCreating,
    resetProspectData
  } = useProspectToClient()

  const handleCreateClient = async () => {
    try {
      const newClient = await createClientFromProspect.mutateAsync(prospectData)
      onClientSelected(newClient.id)
      setMode('existing')
      resetProspectData()
    } catch (error) {
      console.error('Error creating client:', error)
    }
  }

  const selectedClient = clients.find(c => c.id === selectedClientId)

  // Debug info
  console.log('ClientSelector - clients:', clients.length, 'isLoading:', isLoading, 'error:', error)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Cliente / Prospecto</Label>
          <p className="text-sm text-gray-600">Cargando clientes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Cliente / Prospecto</Label>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar clientes: {error.message}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">Cliente / Prospecto</Label>
        <p className="text-sm text-gray-600">
          Selecciona un cliente existente o crea uno nuevo desde prospecto
        </p>
      </div>

      {/* Selector de modo */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === 'existing' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('existing')}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Cliente Existente
        </Button>
        <Button
          type="button"
          variant={mode === 'new' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('new')}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Nuevo Prospecto
        </Button>
      </div>

      {mode === 'existing' ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Users className="h-5 w-5" />
              Seleccionar Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clients.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No hay clientes disponibles. Ve a la página de <strong>Contactos</strong> para crear algunos clientes primero, 
                    o usa la opción "Nuevo Prospecto" para crear uno desde aquí.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div>
                    <Label>Cliente ({clients.length} disponibles)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between font-light"
                        >
                          {selectedClient ? selectedClient.name : "Buscar cliente..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar por nombre o email..." />
                          <CommandList className="max-h-[300px]">
                            <CommandEmpty>No se encontró ningún cliente.</CommandEmpty>
                            <CommandGroup>
                              {clients.map((client) => (
                                <CommandItem
                                  key={client.id}
                                  value={`${client.name} ${client.email || ''}`}
                                  onSelect={() => onClientSelected(client.id)}
                                  className="flex items-center justify-between"
                                >
                                  <div className="flex flex-col">
                                    <span>{client.name}</span>
                                    {client.email && (
                                      <span className="text-xs text-muted-foreground">{client.email}</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">
                                      {client.client_type === 'empresa' ? 'Empresa' : 'Particular'}
                                    </Badge>
                                    {client.id === selectedClientId && (
                                      <Check className="h-4 w-4 text-primary" />
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {selectedClient && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700">
                        Cliente seleccionado: <strong>{selectedClient.name}</strong>
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <ProspectToClientForm
          prospectData={prospectData}
          onProspectDataChange={setProspectData}
          onCreateClient={handleCreateClient}
          isCreating={isCreating}
        />
      )}
    </div>
  )
}
