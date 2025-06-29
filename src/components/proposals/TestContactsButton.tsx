
import React from 'react'
import { Button } from '@/components/ui/button'
import { UserPlus, Loader2 } from 'lucide-react'
import { useCreateTestContacts } from '@/hooks/useCreateTestContacts'

export const TestContactsButton: React.FC = () => {
  const { createTestContacts, isCreating } = useCreateTestContacts()

  return (
    <Button
      onClick={() => createTestContacts()}
      disabled={isCreating}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      {isCreating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      {isCreating ? 'Creando...' : 'Crear Contactos de Prueba'}
    </Button>
  )
}
