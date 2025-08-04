import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface MatterPlaceholderCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

export function MatterPlaceholderCard({ 
  icon: Icon, 
  title, 
  description 
}: MatterPlaceholderCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Esta funcionalidad se configurará después de crear el expediente.
        </p>
      </CardContent>
    </Card>
  )
}