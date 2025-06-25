
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, X } from 'lucide-react'

interface NotificationCenterProps {
  onClose: () => void
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  return (
    <Card className="w-80 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Bell className="h-4 w-4" />
          Notificaciones
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-muted-foreground text-center py-4">
          No hay notificaciones nuevas
        </div>
      </CardContent>
    </Card>
  )
}
