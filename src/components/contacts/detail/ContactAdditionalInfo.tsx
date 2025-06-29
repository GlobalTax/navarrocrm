
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'
import { Contact } from '@/hooks/useContacts'
import { formatDate } from '../utils/contactUtils'

interface ContactAdditionalInfoProps {
  contact: Contact
}

export const ContactAdditionalInfo = ({ contact }: ContactAdditionalInfoProps) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-700">DNI/NIF:</span>
            <p className="text-sm mt-1">{contact.dni_nif || 'No especificado'}</p>
          </div>
          
          {contact.hourly_rate && (
            <div>
              <span className="text-sm font-medium text-gray-700">Tarifa por hora:</span>
              <p className="text-sm mt-1 font-semibold text-green-600">
                €{contact.hourly_rate}/hora
              </p>
            </div>
          )}

          <div>
            <span className="text-sm font-medium text-gray-700">Método de pago:</span>
            <p className="text-sm mt-1 capitalize">
              {contact.payment_method || 'No especificado'}
            </p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-700">Idioma preferido:</span>
            <p className="text-sm mt-1">
              {contact.preferred_language === 'es' ? 'Español' : 
               contact.preferred_language === 'en' ? 'Inglés' : 
               contact.preferred_language || 'No especificado'}
            </p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-700">Creado:</span>
            <p className="text-sm mt-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(contact.created_at)}
            </p>
          </div>
        </CardContent>
      </Card>

      {contact.internal_notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notas Internas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {contact.internal_notes}
            </p>
          </CardContent>
        </Card>
      )}
    </>
  )
}
