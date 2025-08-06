import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserCog } from 'lucide-react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'

const SystemUsersPage = () => {
  return (
    <StandardPageContainer>
      <StandardPageHeader 
        title="Usuarios del Sistema"
        description="Gestión de usuarios y accesos al sistema"
      >
        <UserCog className="h-8 w-8 text-primary" />
      </StandardPageHeader>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="invitations">Invitaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <div className="bg-white rounded-lg border p-6">
            <p className="text-center text-gray-500">Contenido de gestión de usuarios del sistema en desarrollo</p>
          </div>
        </TabsContent>

        <TabsContent value="invitations" className="mt-6">
          <div className="bg-white rounded-lg border p-6">
            <p className="text-center text-gray-500">Contenido de invitaciones en desarrollo</p>
          </div>
        </TabsContent>
      </Tabs>
    </StandardPageContainer>
  )
}

export default SystemUsersPage