import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TasksList, TaskFilters, BulkTaskAssignmentModal } from '../components'

export default function TasksPage() {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [isBulkAssignmentOpen, setIsBulkAssignmentOpen] = useState(false)

  const handleTaskSelect = (taskId: string, selected: boolean) => {
    setSelectedTasks(prev => 
      selected 
        ? [...prev, taskId]
        : prev.filter(id => id !== taskId)
    )
  }

  const handleBulkAssignment = () => {
    if (selectedTasks.length > 0) {
      setIsBulkAssignmentOpen(true)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tareas</h1>
        <div className="flex gap-2">
          {selectedTasks.length > 0 && (
            <Button
              onClick={handleBulkAssignment}
              variant="outline"
              className="border-0.5 border-black rounded-[10px] hover-lift"
            >
              Asignar ({selectedTasks.length})
            </Button>
          )}
          <Button variant="outline" className="border-0.5 border-black rounded-[10px] hover-lift">
            Nueva Tarea
          </Button>
        </div>
      </div>

      <TaskFilters />

      <TasksList
        onTaskSelect={handleTaskSelect}
        selectedTasks={selectedTasks}
      />

      <BulkTaskAssignmentModal
        isOpen={isBulkAssignmentOpen}
        onClose={() => setIsBulkAssignmentOpen(false)}
        selectedTaskIds={selectedTasks}
        taskTitles={[]} // TODO: Get task titles
      />
    </div>
  )
}