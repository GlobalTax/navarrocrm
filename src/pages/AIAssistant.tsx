
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot } from 'lucide-react'

const AIAssistant = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Asistente IA</h1>
      <Card className="border-0.5 border-black rounded-[10px] shadow-sm">
        <CardHeader className="text-center py-12">
          <Bot className="h-8 w-8 text-green-600 mx-auto mb-4" />
          <CardTitle>Asistente Inteligente</CardTitle>
          <CardDescription>Ayuda automatizada para el despacho. En desarrollo.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default AIAssistant
