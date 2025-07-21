
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield } from 'lucide-react'

const AIAdmin = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin IA</h1>
      <Card className="border-0.5 border-black rounded-[10px] shadow-sm">
        <CardHeader className="text-center py-12">
          <Shield className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <CardTitle>Administración de IA</CardTitle>
          <CardDescription>Configuración avanzada del sistema IA. En desarrollo.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default AIAdmin
