
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Client } from '@/hooks/useClients'
import { PracticeArea } from '@/hooks/usePracticeAreas'
import { User } from '@/hooks/useUsers'

interface MatterDetailsFormProps {
  title: string
  description: string
  clientId: string
  practiceArea: string
  responsibleSolicitorId: string
  status: string
  clients: Client[]
  practiceAreas: PracticeArea[]
  users: User[]
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onClientChange: (value: string) => void
  onPracticeAreaChange: (value: string) => void
  onResponsibleSolicitorChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export function MatterDetailsForm({
  title,
  description,
  clientId,
  practiceArea,
  responsibleSolicitorId,
  status,
  clients,
  practiceAreas,
  users,
  onTitleChange,
  onDescriptionChange,
  onClientChange,
  onPracticeAreaChange,
  onResponsibleSolicitorChange,
  onStatusChange
}: MatterDetailsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles del Expediente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título del Expediente *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Ej: Compraventa inmueble - Juan Pérez"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="client">Cliente *</Label>
            <Select value={clientId} onValueChange={onClientChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cliente..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Área de Práctica</Label>
            <Select value={practiceArea || 'none'} onValueChange={onPracticeAreaChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar área..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin especificar</SelectItem>
                {practiceAreas.map((area) => (
                  <SelectItem key={area.id} value={area.name}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Abogado Responsable</Label>
            <Select value={responsibleSolicitorId || 'none'} onValueChange={onResponsibleSolicitorChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar abogado..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin asignar</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Estado</Label>
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Abierto</SelectItem>
                <SelectItem value="on_hold">En espera</SelectItem>
                <SelectItem value="closed">Cerrado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={description || ''}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Descripción detallada del expediente..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  )
}
