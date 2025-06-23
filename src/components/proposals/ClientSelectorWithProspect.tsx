
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, Check } from 'lucide-react'
import { useClients } from '@/hooks/useClients'
import { ProspectToClientForm } from './ProspectToClientForm'
import { useProspectToClient } from '@/hooks/proposals/useProspectToClient'

interface ClientSelectorWithProspectProps {
  selectedClientId: string
  onClientSelected: (clientId: string) => void
}

export const ClientSelectorWithProspect: React.FC<ClientSelectorWithProspectProps> = ({
  selectedClientId,
  onClientSelected
}) => {
  const { clients } = useClients()
  const [mode, setMode] = useState<'existing' | 'new'>('existing')
  
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
              <div>
                <Label htmlFor="client-select">Cliente</Label>
                <Select value={selectedClientId} onValueChange={onClientSelected}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{client.name}</span>
                          <Badge variant="outline" className="ml-2">
                            {client.client_type === 'empresa' ? 'Empresa' : 'Particular'}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedClient && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    Cliente seleccionado: <strong>{selectedClient.name}</strong>
                  </span>
                </div>
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
