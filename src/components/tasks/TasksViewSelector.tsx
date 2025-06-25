
import { Button } from '@/components/ui/button'
import { Grid3X3, List, LayoutList } from 'lucide-react'

interface TasksViewSelectorProps {
  viewMode: 'board' | 'list' | 'virtual'
  onViewModeChange: (mode: 'board' | 'list' | 'virtual') => void
}

export const TasksViewSelector = ({ viewMode, onViewModeChange }: TasksViewSelectorProps) => {
  return (
    <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
      <Button
        variant={viewMode === 'board' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('board')}
        className="flex items-center space-x-1"
      >
        <Grid3X3 className="h-4 w-4" />
        <span>Tablero</span>
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className="flex items-center space-x-1"
      >
        <List className="h-4 w-4" />
        <span>Lista</span>
      </Button>
      <Button
        variant={viewMode === 'virtual' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('virtual')}
        className="flex items-center space-x-1"
      >
        <LayoutList className="h-4 w-4" />
        <span>Virtual</span>
      </Button>
    </div>
  )
}
