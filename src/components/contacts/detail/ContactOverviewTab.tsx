
import { ContactMainInfo } from './ContactMainInfo'
import { ContactAdditionalInfo } from './ContactAdditionalInfo'
import { Contact } from '@/hooks/useContacts'

interface ContactOverviewTabProps {
  contact: Contact
}

export const ContactOverviewTab = ({ contact }: ContactOverviewTabProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Información principal */}
      <div className="lg:col-span-2 space-y-6">
        <ContactMainInfo contact={contact} />
      </div>

      {/* Información adicional */}
      <div className="space-y-6">
        <ContactAdditionalInfo contact={contact} />
      </div>
    </div>
  )
}
