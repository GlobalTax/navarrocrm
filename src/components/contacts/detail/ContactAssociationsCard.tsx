
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, ArrowRight, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Contact } from '@/hooks/useContacts'

interface ContactAssociationsCardProps {
  contact: Contact
}

export const ContactAssociationsCard = ({ contact }: ContactAssociationsCardProps) => {
  const navigate = useNavigate()

  // Simular datos de asociaciones (en una implementación real, estos vendrían de hooks)
  const associatedCompany = contact.company_id ? {
    id: contact.company_id,
    name: 'Empresa Asociada S.L.',
    sector: 'Tecnología',
    employees: 15
  } : null

  const relatedContacts = [
    // Simular contactos relacionados por empresa
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Asociaciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Empresa asociada */}
        {associatedCompany && (
          <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">{associatedCompany.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{associatedCompany.sector}</span>
                    <span>•</span>
                    <span>{associatedCompany.employees} empleados</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(`/contacts/${associatedCompany.id}`)}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Tipo de relación */}
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-gray-600">Tipo de relación</span>
          <Badge variant="outline" className="capitalize">
            {contact.relationship_type?.replace('_', ' ') || 'No definido'}
          </Badge>
        </div>

        {/* Estado de la relación */}
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-gray-600">Estado</span>
          <Badge 
            variant="outline" 
            className={
              contact.status === 'activo' ? 'bg-green-100 text-green-800' :
              contact.status === 'prospecto' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }
          >
            {contact.status || 'Sin definir'}
          </Badge>
        </div>

        {/* Última actividad */}
        {contact.last_contact_date && (
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-gray-600">Último contacto</span>
            <span className="text-sm text-gray-500">
              {new Date(contact.last_contact_date).toLocaleDateString('es-ES')}
            </span>
          </div>
        )}

        {/* Botón para ver todas las asociaciones */}
        <Button variant="outline" className="w-full" size="sm">
          <ArrowRight className="h-4 w-4 mr-2" />
          Ver todas las asociaciones
        </Button>
      </CardContent>
    </Card>
  )
}
