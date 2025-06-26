
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { ContactDetailDialog } from '@/components/contacts/ContactDetailDialog'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit } from 'lucide-react'
import { useState } from 'react'
import { ContactFormDialog } from '@/components/contacts/ContactFormDialog'
import { useApp } from '@/contexts/AppContext'
import type { Contact } from '@/hooks/useContacts'

const ContactDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useApp()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { data: contact, isLoading, error, refetch } = useQuery({
    queryKey: ['contact-detail', id],
    queryFn: async (): Promise<Contact | null> => {
      if (!id || !user?.org_id) return null

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .eq('org_id', user.org_id)
        .maybeSingle()

      if (error) {
        console.error('Error fetching contact:', error)
        throw error
      }

      return data
    },
    enabled: !!id && !!user?.org_id
  })

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false)
    refetch()
  }

  if (isLoading) {
    return (
      <StandardPageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando contacto...</p>
          </div>
        </div>
      </StandardPageContainer>
    )
  }

  if (error) {
    return (
      <StandardPageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error al cargar el contacto</p>
            <Button onClick={() => navigate('/contacts')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Contactos
            </Button>
          </div>
        </div>
      </StandardPageContainer>
    )
  }

  if (!contact) {
    return (
      <StandardPageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Contacto no encontrado</p>
            <Button onClick={() => navigate('/contacts')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Contactos
            </Button>
          </div>
        </div>
      </StandardPageContainer>
    )
  }

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title={contact.name}
        description="Detalles del contacto"
        actions={
          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/contacts')}
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <Button
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        }
      />

      <ContactDetailDialog
        contact={contact}
        open={true}
        onClose={() => navigate('/contacts')}
      />

      <ContactFormDialog
        contact={contact}
        open={isEditDialogOpen}
        onClose={handleEditSuccess}
      />
    </StandardPageContainer>
  )
}

export default ContactDetail
