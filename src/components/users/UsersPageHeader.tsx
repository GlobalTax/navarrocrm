import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'

interface UsersPageHeaderProps {
  onInviteUser: () => void
  onBulkUpload: () => void
}

export const UsersPageHeader = ({ onInviteUser, onBulkUpload }: UsersPageHeaderProps) => {
  return (
    <StandardPageHeader
      title="Gestión de Usuarios"
      description="Administra los usuarios de tu asesoría con funcionalidades avanzadas"
      primaryAction={{
        label: 'Invitar Usuario',
        onClick: onInviteUser
      }}
    >
      <Button 
        variant="outline" 
        onClick={onBulkUpload}
        className="border-0.5 border-black rounded-[10px] hover-lift"
      >
        <Upload className="h-4 w-4 mr-2" />
        Importación Masiva
      </Button>
    </StandardPageHeader>
  )
}