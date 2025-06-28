
import { useState } from 'react'
import type { AcademiaAdminState, AcademyCourse, AcademyCategory } from '@/types/academy'

const initialState: AcademiaAdminState = {
  courseDialogOpen: false,
  categoryDialogOpen: false,
  lessonDialogOpen: false,
  aiCourseDialogOpen: false,
  selectedCourse: null,
  selectedCategory: null,
  selectedCourseForLesson: ''
}

export const useAcademiaAdminState = () => {
  const [state, setState] = useState<AcademiaAdminState>(initialState)

  const actions = {
    // Course actions
    openCourseDialog: (course?: AcademyCourse) => {
      setState(prev => ({
        ...prev,
        courseDialogOpen: true,
        selectedCourse: course || null
      }))
    },
    closeCourseDialog: () => {
      setState(prev => ({
        ...prev,
        courseDialogOpen: false,
        selectedCourse: null
      }))
    },

    // Category actions
    openCategoryDialog: (category?: AcademyCategory) => {
      setState(prev => ({
        ...prev,
        categoryDialogOpen: true,
        selectedCategory: category || null
      }))
    },
    closeCategoryDialog: () => {
      setState(prev => ({
        ...prev,
        categoryDialogOpen: false,
        selectedCategory: null
      }))
    },

    // Lesson actions
    openLessonDialog: (courseId: string) => {
      setState(prev => ({
        ...prev,
        lessonDialogOpen: true,
        selectedCourseForLesson: courseId
      }))
    },
    closeLessonDialog: () => {
      setState(prev => ({
        ...prev,
        lessonDialogOpen: false,
        selectedCourseForLesson: ''
      }))
    },

    // AI Generator actions
    openAIDialog: () => {
      setState(prev => ({
        ...prev,
        aiCourseDialogOpen: true
      }))
    },
    closeAIDialog: () => {
      setState(prev => ({
        ...prev,
        aiCourseDialogOpen: false
      }))
    },

    // Reset all
    resetState: () => {
      setState(initialState)
    }
  }

  return {
    state,
    actions
  }
}
