
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

const Academia = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Academia</h1>
      <Card className="border-0.5 border-black rounded-[10px] shadow-sm">
        <CardHeader className="text-center py-12">
          <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-4" />
          <CardTitle>Academia del Despacho</CardTitle>
          <CardDescription>Recursos formativos y documentación. En desarrollo.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default Academia
