
import { useState } from 'react'
import { TaskWithRelations } from './types'

export const useTasksPageState = () => {
  const [viewMode, setViewMode] = useState<'board' | 'list' | 'virtual'>('board')
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null)

  const handleCreateTask = () => {
    setSelectedTask(null)
    setIsTaskDialogOpen(true)
  }

  const handleEditTask = (task: TaskWithRelations) => {
    setSelectedTask(task)
    setIsTaskDialogOpen(true)
  }

  const closeTaskDialog = () => {
    setIsTaskDialogOpen(false)
    setSelectedTask(null)
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
