import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'
import { useClients } from '@/hooks/useClients'
import { usePracticeAreas } from '@/hooks/usePracticeAreas'
import { useUsers } from '@/hooks/useUsers'

interface MatterDetailsFormProps {
  title: string
  description: string
  clientId: string
  practiceArea: string
  responsibleSolicitorId: string
  status: string
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
  onTitleChange,
  onDescriptionChange,
  onClientChange,
  onPracticeAreaChange,
  onResponsibleSolicitorChange,
  onStatusChange
}: MatterDetailsFormProps) {
  const { clients } = useClients()
  const { practiceAreas } = usePracticeAreas()
  const { users } = useUsers()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Detalles del Expediente
        </CardTitle>
        <CardDescription>
          Información básica del expediente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Título del expediente</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Ej: Constitución Sociedad Limitada - Empresa ABC"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Descripción detallada del expediente..."
            rows={3}
          />
        </div>

        <div className="grid gap-2">
          <Label>Cliente</Label>
          <Select value={clientId} onValueChange={onClientChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cliente" />
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

        <div className="grid gap-2">
          <Label>Área de práctica</Label>
          <Select value={practiceArea} onValueChange={onPracticeAreaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar área" />
            </SelectTrigger>
            <SelectContent>
              {practiceAreas.map((area) => (
                <SelectItem key={area.id} value={area.name}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Asesor responsable</Label>
          <Select value={responsibleSolicitorId} onValueChange={onResponsibleSolicitorChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar asesor" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Estado inicial</Label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Abierto</SelectItem>
              <SelectItem value="on_hold">En espera</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}