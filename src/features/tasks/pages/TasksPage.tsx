import { useState } from 'react'
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
            <button
              onClick={handleBulkAssignment}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Asignar ({selectedTasks.length})
            </button>
          )}
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Nueva Tarea
          </button>
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