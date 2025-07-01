
import { useState, useCallback } from 'react'
import type { AcademyCourse, AcademyCategory, AcademyLesson } from '@/types/academy'

interface EnhancedAcademiaAdminState {
  // Dialog states
  courseDialogOpen: boolean
  categoryDialogOpen: boolean
  lessonDialogOpen: boolean
  lessonsManagementDialogOpen: boolean
  aiCourseDialogOpen: boolean
  
  // Selected items
  selectedCourse: AcademyCourse | null
  selectedCategory: AcademyCategory | null
  selectedLesson: AcademyLesson | null
  selectedCourseForLesson: string
  selectedCourseForManagement: { id: string; title: string } | null
  
  // Loading states
  isGeneratingWithAI: boolean
  isDeletingCourse: boolean
  isDeletingCategory: boolean
  
  // Error states
  lastError: string | null
}

const initialState: EnhancedAcademiaAdminState = {
  courseDialogOpen: false,
  categoryDialogOpen: false,
  lessonDialogOpen: false,
  lessonsManagementDialogOpen: false,
  aiCourseDialogOpen: false,
  selectedCourse: null,
  selectedCategory: null,
  selectedLesson: null,
  selectedCourseForLesson: '',
  selectedCourseForManagement: null,
  isGeneratingWithAI: false,
  isDeletingCourse: false,
  isDeletingCategory: false,
  lastError: null
}

export const useEnhancedAcademiaAdminState = () => {
  const [state, setState] = useState<EnhancedAcademiaAdminState>(initialState)

  // Course actions
  const openCourseDialog = useCallback((course?: AcademyCourse) => {
    setState(prev => ({
      ...prev,
      courseDialogOpen: true,
      selectedCourse: course || null,
      lastError: null
    }))
  }, [])

  const closeCourseDialog = useCallback(() => {
    setState(prev => ({
      ...prev,
      courseDialogOpen: false,
      selectedCourse: null
    }))
  }, [])

  // Category actions
  const openCategoryDialog = useCallback((category?: AcademyCategory) => {
    setState(prev => ({
      ...prev,
      categoryDialogOpen: true,
      selectedCategory: category || null,
      lastError: null
    }))
  }, [])

  const closeCategoryDialog = useCallback(() => {
    setState(prev => ({
      ...prev,
      categoryDialogOpen: false,
      selectedCategory: null
    }))
  }, [])

  // Lesson actions
  const openLessonDialog = useCallback((courseId: string, lesson?: AcademyLesson) => {
    setState(prev => ({
      ...prev,
      lessonDialogOpen: true,
      selectedCourseForLesson: courseId,
      selectedLesson: lesson || null,
      lastError: null
    }))
  }, [])

  const closeLessonDialog = useCallback(() => {
    setState(prev => ({
      ...prev,
      lessonDialogOpen: false,
      selectedCourseForLesson: '',
      selectedLesson: null
    }))
  }, [])

  // Lessons Management actions
  const openLessonsManagementDialog = useCallback((courseId: string, courseTitle: string) => {
    setState(prev => ({
      ...prev,
      lessonsManagementDialogOpen: true,
      selectedCourseForManagement: { id: courseId, title: courseTitle }
    }))
  }, [])

  const closeLessonsManagementDialog = useCallback(() => {
    setState(prev => ({
      ...prev,
      lessonsManagementDialogOpen: false,
      selectedCourseForManagement: null
    }))
  }, [])

  // AI Generator actions
  const openAIDialog = useCallback(() => {
    setState(prev => ({
      ...prev,
      aiCourseDialogOpen: true,
      isGeneratingWithAI: false,
      lastError: null
    }))
  }, [])

  const closeAIDialog = useCallback(() => {
    setState(prev => ({
      ...prev,
      aiCourseDialogOpen: false,
      isGeneratingWithAI: false
    }))
  }, [])

  // Loading state management
  const setGeneratingWithAI = useCallback((isGenerating: boolean) => {
    setState(prev => ({
      ...prev,
      isGeneratingWithAI: isGenerating
    }))
  }, [])

  const setDeletingCourse = useCallback((isDeleting: boolean) => {
    setState(prev => ({
      ...prev,
      isDeletingCourse: isDeleting
    }))
  }, [])

  const setDeletingCategory = useCallback((isDeleting: boolean) => {
    setState(prev => ({
      ...prev,
      isDeletingCategory: isDeleting
    }))
  }, [])

  // Error management
  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      lastError: error
    }))
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      lastError: null
    }))
  }, [])

  // Reset all
  const resetState = useCallback(() => {
    setState(initialState)
  }, [])

  return {
    state,
    actions: {
      // Course
      openCourseDialog,
      closeCourseDialog,
      // Category
      openCategoryDialog,
      closeCategoryDialog,
      // Lesson
      openLessonDialog,
      closeLessonDialog,
      // Lessons Management
      openLessonsManagementDialog,
      closeLessonsManagementDialog,
      // AI Generator
      openAIDialog,
      closeAIDialog,
      // Loading states
      setGeneratingWithAI,
      setDeletingCourse,
      setDeletingCategory,
      // Error management
      setError,
      clearError,
      // Reset
      resetState
    }
  }
}
