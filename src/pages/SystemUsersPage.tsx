import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserCog } from 'lucide-react'

const SystemUsersPage = () => {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <UserCog className="h-8 w-8 text-primary mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Usuarios del Sistema</h1>
        <p className="text-gray-600">Gestión de usuarios y accesos al sistema</p>
      </div>

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
    </div>
  )
}

export default SystemUsersPage