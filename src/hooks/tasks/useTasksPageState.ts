
import { useState } from 'react'

export type TaskViewMode = 'board' | 'list'

export const useTasksPageState = () => {
  const [viewMode, setViewMode] = useState<TaskViewMode>('board')
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)

  const handleCreateTask = () => {
    setSelectedTask(null)
    setIsTaskDialogOpen(true)
  }

  const handleEditTask = (task: any) => {
    if (!task || !task.id) {
      console.warn('⚠️ Attempted to edit invalid task:', task)
      return
    }
    console.log('🔍 Editing task:', task)
    setSelectedTask(task)
    setIsTaskDialogOpen(true)
  }

  const closeTaskDialog = () => {
    setIsTaskDialogOpen(false)
  }

  return {
    viewMode,
    setViewMode,
    isTaskDialogOpen,
    selectedTask,
    handleCreateTask,
    handleEditTask,
    closeTaskDialog
  }
}
