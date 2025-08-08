
import React from 'react'
import { Trophy, Target, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export function AcademiaProgress() {
  const achievements = [
    { name: 'Primer paso', icon: CheckCircle, completed: true },
    { name: 'Cliente Master', icon: Trophy, completed: true },
    { name: 'Experto en IA', icon: Target, completed: false }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tu progreso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Completado</span>
            <span>18/24</span>
          </div>
          <Progress value={75} className="h-2" />
        </div>
        
        <div>
          <h4 className="font-medium text-sm mb-2">Logros recientes</h4>
          <div className="space-y-2">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <achievement.icon 
                    className={`h-4 w-4 mr-2 ${
                      achievement.completed ? 'text-academia-success' : 'text-muted-foreground'
                    }`}
                  />
                  <span className="text-sm">{achievement.name}</span>
                </div>
                {achievement.completed && (
                  <Badge variant="secondary" className="text-xs">
                    ✓
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
