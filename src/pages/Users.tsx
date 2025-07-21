
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserCog } from 'lucide-react'

const Users = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Usuarios</h1>
      <Card className="border-0.5 border-black rounded-[10px] shadow-sm">
        <CardHeader className="text-center py-12">
          <UserCog className="h-8 w-8 text-purple-600 mx-auto mb-4" />
          <CardTitle>Gestión de Usuarios</CardTitle>
          <CardDescription>Administración de usuarios y permisos. En desarrollo.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default Users
