
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Edit, Building2, User, Briefcase, Mail, Phone } from 'lucide-react'
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
      'activo': { 
        variant: 'default' as const, 
        label: 'Activo',
        className: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200'
      },
      'inactivo': { 
        variant: 'secondary' as const, 
        label: 'Inactivo',
        className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
      },
      'prospecto': { 
        variant: 'outline' as const, 
        label: 'Prospecto',
        className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
      },
      'bloqueado': { 
        variant: 'destructive' as const, 
        label: 'Bloqueado',
        className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return <Badge variant="outline">{status}</Badge>

    return (
      <Badge 
        variant={config.variant} 
        className={`${config.className} transition-colors duration-200`}
      >
        {config.label}
      </Badge>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-100 hover:bg-transparent bg-gray-50/50">
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Persona</TableHead>
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Tipo</TableHead>
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Contacto</TableHead>
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Empresa</TableHead>
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Estado</TableHead>
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Relación</TableHead>
            <TableHead className="text-right font-semibold text-gray-900 py-4 px-6">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {persons.map((person, index) => (
            <TableRow 
              key={person.id}
              className="border-gray-50 hover:bg-gray-25 transition-all duration-200 group cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleViewPerson(person)}
            >
              <TableCell className="py-4 px-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-white shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                      {getInitials(person.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                      {person.name}
                    </div>
                  </div>
                </div>
              </TableCell>
              
              <TableCell className="py-4 px-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="text-blue-500">
                    {getTypeIcon(person.client_type)}
                  </div>
                  <span className="text-sm font-medium">{getTypeLabel(person.client_type)}</span>
                </div>
              </TableCell>
              
              <TableCell className="py-4 px-6">
                <div className="space-y-1.5">
                  {person.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail className="h-3.5 w-3.5 text-gray-400" />
                      <span>{person.email}</span>
                    </div>
                  )}
                  {person.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      <span>{person.phone}</span>
                    </div>
                  )}
                  {!person.email && !person.phone && (
                    <span className="text-gray-400 text-sm">Sin información</span>
                  )}
                </div>
              </TableCell>
              
              <TableCell className="py-4 px-6">
                {person.company ? (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{person.company.name}</span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">-</span>
                )}
              </TableCell>
              
              <TableCell className="py-4 px-6">
                {getStatusBadge(person.status)}
              </TableCell>
              
              <TableCell className="py-4 px-6">
                <Badge 
                  variant="outline" 
                  className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 transition-colors"
                >
                  {person.relationship_type === 'cliente' ? 'Cliente' : 
                   person.relationship_type === 'prospecto' ? 'Prospecto' : 
                   'Ex-cliente'}
                </Badge>
              </TableCell>
              
              <TableCell className="text-right py-4 px-6">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditPerson(person)
                    }}
                  >
                    <Edit className="h-3.5 w-3.5" />
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
