
import { TaskCard } from './TaskCard'
import { TaskDetailDrawer } from './TaskDetailDrawer'
import { VirtualizedList } from '@/components/virtualized/VirtualizedList'
import { TaskWithRelations } from '@/hooks/tasks/types'
import { useTasks } from '@/hooks/useTasks'
import { useState } from 'react'

interface VirtualizedTasksListProps {
  tasks: TaskWithRelations[]
  onEditTask: (task: TaskWithRelations) => void
}

export const VirtualizedTasksList = ({ tasks, onEditTask }: VirtualizedTasksListProps) => {
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { updateTask } = useTasks()

  const handleTaskClick = (task: TaskWithRelations) => {
    setSelectedTask(task)
    setIsDrawerOpen(true)
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTask({ id: taskId, status: newStatus as any })
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedTask(null)
  }

  const renderTaskItem = (task: TaskWithRelations, index: number) => (
    <div
      className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
      onClick={() => handleTaskClick(task)}
    >
      <TaskCard
        task={task}
        onEdit={() => onEditTask(task)}
        onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)}
        showStatusSelector={false}
      />
    </div>
  )

  const emptyState = (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas</h3>
      <p className="text-gray-500">Crea tu primera tarea para comenzar</p>
    </div>
  )

  return (
    <>
      <VirtualizedList
        items={tasks}
        height={600}
        itemHeight={120}
        renderItem={renderTaskItem}
        className="bg-white rounded-lg border"
        emptyState={emptyState}
        overscan={10}
      />

      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          onEdit={onEditTask}
        />
      )}
    </>
  )
}
