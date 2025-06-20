
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface SetupLayoutProps {
  title: string
  description: string
  children: React.ReactNode
}

export const SetupLayout = ({ title, description, children }: SetupLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Configuración Inicial</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  )
}
