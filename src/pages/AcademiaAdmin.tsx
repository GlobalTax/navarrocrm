
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wrench } from 'lucide-react'

const AcademiaAdmin = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Academia</h1>
      <Card className="border-0.5 border-black rounded-[10px] shadow-sm">
        <CardHeader className="text-center py-12">
          <Wrench className="h-8 w-8 text-orange-600 mx-auto mb-4" />
          <CardTitle>Administración de Academia</CardTitle>
          <CardDescription>Gestión de contenidos formativos. En desarrollo.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default AcademiaAdmin
