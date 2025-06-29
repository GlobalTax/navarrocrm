
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { MoreVertical, Calendar, CheckCircle2, Clock, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { MatterStage } from '@/hooks/useMatterStages'

interface StageCardProps {
  stage: MatterStage
  onEdit: (stage: MatterStage) => void
  onDelete: (stageId: string) => void
  onStatusChange: (stageId: string, status: MatterStage['status']) => void
  isUpdating?: boolean
}

export const StageCard: React.FC<StageCardProps> = ({
  stage,
  onEdit,
  onDelete,
  onStatusChange,
  isUpdating = false
}) => {
  const getStatusColor = (status: MatterStage['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: MatterStage['status']) => {
    switch (status) {
      case 'completed':
        return 'Completada'
      case 'in_progress':
        return 'En progreso'
      case 'pending':
        return 'Pendiente'
      default:
        return status
    }
  }

  const getStatusIcon = (status: MatterStage['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />
      case 'in_progress':
        return <Clock className="h-4 w-4" />
      case 'pending':
        return <Calendar className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const isOverdue = stage.due_date && new Date(stage.due_date) < new Date() && stage.status !== 'completed'

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      stage.status === 'completed' ? 'opacity-75' : ''
    } ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold">
              {stage.name}
            </CardTitle>
            {stage.description && (
              <CardDescription className="mt-1">
                {stage.description}
              </CardDescription>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(stage)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar etapa?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. La etapa "{stage.name}" será eliminada permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(stage.id)}>
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <Badge 
              variant="outline" 
              className={`${getStatusColor(stage.status)} transition-colors`}
            >
              <div className="flex items-center gap-1">
                {getStatusIcon(stage.status)}
                {getStatusLabel(stage.status)}
              </div>
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {stage.due_date && (
              <div className={`text-xs flex items-center gap-1 ${
                isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'
              }`}>
                <Calendar className="h-3 w-3" />
                {format(new Date(stage.due_date), 'dd MMM', { locale: es })}
                {isOverdue && ' (Vencida)'}
              </div>
            )}
          </div>
        </div>

        {stage.status !== 'completed' && (
          <div className="flex gap-1 mt-3">
            {stage.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(stage.id, 'in_progress')}
                disabled={isUpdating}
                className="text-xs"
              >
                Iniciar
              </Button>
            )}
            {stage.status === 'in_progress' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(stage.id, 'completed')}
                disabled={isUpdating}
                className="text-xs"
              >
                Completar
              </Button>
            )}
          </div>
        )}

        {stage.completed_at && (
          <div className="text-xs text-gray-500 mt-2">
            Completada: {format(new Date(stage.completed_at), 'dd MMM yyyy', { locale: es })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
