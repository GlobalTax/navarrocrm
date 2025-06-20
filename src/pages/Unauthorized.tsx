
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Unauthorized() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldX className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-xl font-bold">Acceso Denegado</CardTitle>
          <CardDescription>
            No tienes permisos para acceder a esta página
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => navigate('/dashboard')} className="w-full">
            Volver al Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
