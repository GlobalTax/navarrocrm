
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'

interface TaskCardHeaderProps {
  title: string
  onEdit: () => void
}

export const TaskCardHeader = ({ title, onEdit }: TaskCardHeaderProps) => {
  return (
    <div className="flex items-start justify-between mb-2">
      <h4 className="font-medium text-gray-900 flex-1 pr-2 line-clamp-2">
        {title}
      </h4>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          onEdit()
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover-lift"
      >
        <MoreHorizontal className="h-3 w-3" />
      </Button>
    </div>
  )
}
