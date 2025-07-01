
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Building2, User, Briefcase } from 'lucide-react'
import { Person } from '@/hooks/usePersons'
import { useNavigate } from 'react-router-dom'

interface PersonsTableProps {
  persons: Person[]
  onEditPerson: (person: Person) => void
}

export const PersonsTable = ({ persons, onEditPerson }: PersonsTableProps) => {
  const navigate = useNavigate()

  const handleViewPerson = (person: Person) => {
    navigate(`/contacts/${person.id}`)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'particular': return <User className="h-4 w-4" />
      case 'autonomo': return <Briefcase className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'particular': return 'Particular'
      case 'autonomo': return 'Autónomo'
      default: return type
    }
  }

  const getStatusBadge = (status: string | null) => {
    if (!status) return null
    
    const statusConfig = {
      'activo': { variant: 'default' as const, label: 'Activo' },
      'inactivo': { variant: 'secondary' as const, label: 'Inactivo' },
      'prospecto': { variant: 'outline' as const, label: 'Prospecto' },
      'bloqueado': { variant: 'destructive' as const, label: 'Bloqueado' }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return <Badge variant="outline">{status}</Badge>

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Relación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {persons.map((person) => (
            <TableRow 
              key={person.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleViewPerson(person)}
            >
              <TableCell className="font-medium">{person.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getTypeIcon(person.client_type)}
                  {getTypeLabel(person.client_type)}
                </div>
              </TableCell>
              <TableCell>{person.email || '-'}</TableCell>
              <TableCell>{person.phone || '-'}</TableCell>
              <TableCell>
                {person.company ? (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{person.company.name}</span>
                  </div>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                {getStatusBadge(person.status)}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {person.relationship_type === 'cliente' ? 'Cliente' : 
                   person.relationship_type === 'prospecto' ? 'Prospecto' : 
                   'Ex-cliente'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditPerson(person)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
