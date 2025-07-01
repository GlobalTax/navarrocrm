
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Edit, Building2, Users, Mail, Phone } from 'lucide-react'
import { Company } from '@/hooks/useCompanies'
import { useNavigate } from 'react-router-dom'

interface CompaniesTableProps {
  companies: Company[]
  onEditCompany: (company: Company) => void
}

export const CompaniesTable = ({ companies, onEditCompany }: CompaniesTableProps) => {
  const navigate = useNavigate()

  const handleViewCompany = (company: Company) => {
    navigate(`/contacts/${company.id}`)
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
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Empresa</TableHead>
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Sector</TableHead>
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Contacto Principal</TableHead>
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Información</TableHead>
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Contactos</TableHead>
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Estado</TableHead>
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Relación</TableHead>
            <TableHead className="text-right font-semibold text-gray-900 py-4 px-6">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company, index) => (
            <TableRow 
              key={company.id}
              className="border-gray-50 hover:bg-gray-25 transition-all duration-200 group cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleViewCompany(company)}
            >
              <TableCell className="py-4 px-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-600 border-2 border-white shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-semibold">
                      {getInitials(company.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm group-hover:text-emerald-600 transition-colors">
                      {company.name}
                    </div>
                    {company.business_sector && (
                      <div className="text-xs text-gray-500 mt-0.5">{company.business_sector}</div>
                    )}
                  </div>
                </div>
              </TableCell>
              
              <TableCell className="py-4 px-6">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-gray-700">{company.business_sector || 'Sin especificar'}</span>
                </div>
              </TableCell>
              
              <TableCell className="py-4 px-6">
                {company.primary_contact ? (
                  <div className="space-y-1">
                    <div className="font-medium text-sm text-gray-900">{company.primary_contact.name}</div>
                    <div className="space-y-0.5">
                      {company.primary_contact.email && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Mail className="h-3 w-3" />
                          {company.primary_contact.email}
                        </div>
                      )}
                      {company.primary_contact.phone && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone className="h-3 w-3" />
                          {company.primary_contact.phone}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">Sin contacto principal</span>
                )}
              </TableCell>
              
              <TableCell className="py-4 px-6">
                <div className="space-y-1.5">
                  {company.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail className="h-3.5 w-3.5 text-gray-400" />
                      <span>{company.email}</span>
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      <span>{company.phone}</span>
                    </div>
                  )}
                  {!company.email && !company.phone && (
                    <span className="text-gray-400 text-sm">Sin información</span>
                  )}
                </div>
              </TableCell>
              
              <TableCell className="py-4 px-6">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Users className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{company.total_contacts || 0}</span>
                </div>
              </TableCell>
              
              <TableCell className="py-4 px-6">
                {getStatusBadge(company.status)}
              </TableCell>
              
              <TableCell className="py-4 px-6">
                <Badge 
                  variant="outline" 
                  className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  {company.relationship_type === 'cliente' ? 'Cliente' : 
                   company.relationship_type === 'prospecto' ? 'Prospecto' : 
                   'Ex-cliente'}
                </Badge>
              </TableCell>
              
              <TableCell className="text-right py-4 px-6">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditCompany(company)
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
