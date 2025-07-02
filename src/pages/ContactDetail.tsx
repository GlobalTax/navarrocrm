
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { ContactFormDialog } from '@/components/contacts/ContactFormDialog'
import { ContactDetailHeader } from '@/components/contacts/detail/ContactDetailHeader'
import { ContactDetailTabs } from '@/components/contacts/detail/ContactDetailTabs'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { Contact } from '@/hooks/useContacts'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'

// Definir el tipo de caso simplificado para esta página
interface CaseForContact {
  id: string
  title: string
  description: string | null
  status: 'open' | 'on_hold' | 'closed'
  practice_area: string | null
  created_at: string
  contact?: {
    id: string
    name: string
    email: string | null
  }
}

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useApp()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Fetch contact data
  const { data: contact, isLoading: contactLoading, error: contactError, refetch } = useQuery({
    queryKey: ['contact', id],
    queryFn: async (): Promise<Contact> => {
      if (!id || !user?.org_id) throw new Error('Missing ID or org_id')
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .eq('org_id', user.org_id)
        .maybeSingle()

      if (error) throw error
      return data as Contact
    },
    enabled: !!id && !!user?.org_id,
  })

  // Fetch related cases
  const { data: relatedCases = [], isLoading: casesLoading } = useQuery({
    queryKey: ['contact-cases', id],
    queryFn: async (): Promise<CaseForContact[]> => {
      if (!id || !user?.org_id) return []
      
      const { data, error } = await supabase
        .from('cases')
        .select(`
          id,
          title,
          description,
          status,
          practice_area,
          created_at,
          contact:contacts(id, name, email)
        `)
        .eq('contact_id', id)
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as CaseForContact[]
    },
    enabled: !!id && !!user?.org_id,
  })

  const handleEditContact = () => {
    setIsEditDialogOpen(true)
  }

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false)
    // Recargar los datos del contacto después de editar
    refetch()
  }

  const handleCaseClick = (caseId: string) => {
    navigate(`/case/${caseId}`)
  }

  if (contactLoading) {
    return (
      <StandardPageContainer>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </StandardPageContainer>
    )
  }

  if (contactError || !contact) {
    return (
      <StandardPageContainer>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Contacto no encontrado</h2>
          <p className="text-gray-600 mb-4">El contacto que buscas no existe o no tienes permisos para verlo.</p>
          <Button onClick={() => navigate('/contacts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Contactos
          </Button>
        </div>
      </StandardPageContainer>
    )
  }

  return (
    <StandardPageContainer>
      <ContactDetailHeader
        contact={contact}
        onBack={() => navigate('/contacts')}
        onEdit={handleEditContact}
      />

      <ContactDetailTabs
        contact={contact}
        relatedCases={relatedCases}
        casesLoading={casesLoading}
        onCaseClick={handleCaseClick}
      />

      {/* Diálogo de edición */}
      <ContactFormDialog
        contact={contact}
        open={isEditDialogOpen}
        onClose={handleCloseEditDialog}
      />
    </StandardPageContainer>
  )
}
