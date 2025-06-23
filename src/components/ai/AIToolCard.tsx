
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronRight, Star, Clock, Users } from 'lucide-react'

interface AIToolCardProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado'
  timeToUse: string
  usedBy: number
  isPopular?: boolean
  children: React.ReactNode
  onLearnMore?: () => void
}

const difficultyColors = {
  'Principiante': 'bg-green-100 text-green-800',
  'Intermedio': 'bg-yellow-100 text-yellow-800',
  'Avanzado': 'bg-red-100 text-red-800'
}

export function AIToolCard({ 
  title, 
  description, 
  icon: Icon, 
  difficulty, 
  timeToUse, 
  usedBy, 
  isPopular,
  children,
  onLearnMore
}: AIToolCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{title}</CardTitle>
                {isPopular && (
                  <Badge variant="secondary" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                )}
              </div>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 pt-2">
          <Badge variant="outline" className={difficultyColors[difficulty]}>
            {difficulty}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timeToUse}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-3 w-3" />
            {usedBy} usuarios
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {children}
        
        {onLearnMore && (
          <Button 
            variant="ghost" 
            onClick={onLearnMore}
            className="w-full justify-between group-hover:bg-muted/50"
          >
            Aprender más
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
