
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit } from 'lucide-react'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Contact } from '@/hooks/useContacts'

interface ContactDetailHeaderProps {
  contact: Contact
  onBack: () => void
  onEdit: () => void
}

export const ContactDetailHeader = ({ contact, onBack, onEdit }: ContactDetailHeaderProps) => {
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'activo': return 'bg-green-100 text-green-800 border-green-200'
      case 'inactivo': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'prospecto': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'bloqueado': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRelationshipTypeColor = (type: string) => {
    switch (type) {
      case 'cliente': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'prospecto': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'ex_cliente': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <StandardPageHeader
      title={contact.name}
      description="Detalle completo del contacto"
      badges={[
        {
          label: contact.relationship_type?.replace('_', ' ') || 'Sin definir',
          variant: 'outline',
          color: getRelationshipTypeColor(contact.relationship_type || '')
        },
        {
          label: contact.status || 'Sin estado',
          variant: 'outline', 
          color: getStatusColor(contact.status)
        }
      ]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <Button onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      }
    />
  )
}
