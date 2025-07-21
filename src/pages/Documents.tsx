
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderOpen } from 'lucide-react'

const Documents = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Documentos</h1>
      <Card className="border-0.5 border-black rounded-[10px] shadow-sm">
        <CardHeader className="text-center py-12">
          <FolderOpen className="h-8 w-8 text-blue-600 mx-auto mb-4" />
          <CardTitle>Gestión de Documentos</CardTitle>
          <CardDescription>Almacenamiento y organización de documentos. En desarrollo.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default Documents
