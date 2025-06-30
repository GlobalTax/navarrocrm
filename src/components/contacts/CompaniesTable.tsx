
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Edit, Building2, Users, Mail, Phone } from 'lucide-react'
import { Company } from '@/hooks/useCompanies'

interface CompaniesTableProps {
  companies: Company[]
  onViewCompany: (company: Company) => void
  onEditCompany: (company: Company) => void
}

export const CompaniesTable = ({ companies, onViewCompany, onEditCompany }: CompaniesTableProps) => {
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
            <TableHead>Empresa</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead>Contacto Principal</TableHead>
            <TableHead>Email/Teléfono</TableHead>
            <TableHead>Total Contactos</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Relación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  {company.name}
                </div>
              </TableCell>
              <TableCell>{company.business_sector || '-'}</TableCell>
              <TableCell>
                {company.primary_contact ? (
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{company.primary_contact.name}</span>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {company.primary_contact.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {company.primary_contact.email}
                        </div>
                      )}
                      {company.primary_contact.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {company.primary_contact.phone}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col text-sm">
                  {company.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-gray-400" />
                      {company.email}
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-gray-400" />
                      {company.phone}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{company.total_contacts || 0}</span>
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(company.status)}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {company.relationship_type === 'cliente' ? 'Cliente' : 
                   company.relationship_type === 'prospecto' ? 'Prospecto' : 
                   'Ex-cliente'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewCompany(company)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditCompany(company)}
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
