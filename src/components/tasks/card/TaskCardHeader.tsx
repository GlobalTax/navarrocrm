
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'

interface TaskCardHeaderProps {
  title: string
  onEdit: () => void
}

export const TaskCardHeader = ({ title, onEdit }: TaskCardHeaderProps) => {
  return (
    <div className="flex items-start justify-between mb-3">
      <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
        {title || 'Sin título'}
      </h4>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          onEdit()
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
      >
        <Edit className="h-4 w-4" />
      </Button>
    </div>
  )
}
