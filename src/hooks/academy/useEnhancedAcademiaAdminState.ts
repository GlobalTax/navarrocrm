
import { useState, useCallback } from 'react'
import type { AcademyCourse, AcademyCategory, AcademyLesson } from '@/types/academy'
import { createLogger } from '@/utils/logger'

/**
 * Estado mejorado de administración de Academia
 * @interface EnhancedAcademiaAdminState
 */
interface EnhancedAcademiaAdminState {
  /** Estados de diálogos */
  courseDialogOpen: boolean
  categoryDialogOpen: boolean
  lessonDialogOpen: boolean
  lessonsManagementDialogOpen: boolean
  aiCourseDialogOpen: boolean
  
  /** Elementos seleccionados */
  selectedCourse: AcademyCourse | null
  selectedCategory: AcademyCategory | null
  selectedLesson: AcademyLesson | null
  selectedCourseForLesson: string
  selectedCourseForManagement: { id: string; title: string } | null
  
  /** Estados de carga */
  isGeneratingWithAI: boolean
  isDeletingCourse: boolean
  isDeletingCategory: boolean
  
  /** Estados de error */
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

/**
 * Hook mejorado para gestionar el estado de administración de Academia
 * Proporciona un estado más completo con manejo de errores y carga
 * 
 * @returns {Object} Objeto con estado y acciones disponibles
 * @returns {EnhancedAcademiaAdminState} returns.state - Estado actual
 * @returns {Object} returns.actions - Acciones disponibles
 * 
 * @example
 * ```typescript
 * const { state, actions } = useEnhancedAcademiaAdminState()
 * 
 * // Abrir diálogo con manejo de errores
 * actions.openCourseDialog(course)
 * 
 * // Gestionar estados de carga
 * actions.setGeneratingWithAI(true)
 * 
 * // Gestionar errores
 * actions.setError('Error al procesar')
 * ```
 * 
 * @since 1.1.0
 */
export const useEnhancedAcademiaAdminState = () => {
  const logger = createLogger('useEnhancedAcademiaAdminState')
  const [state, setState] = useState<EnhancedAcademiaAdminState>(initialState)

  /**
   * Abre el diálogo de curso con validación mejorada
   * @param {AcademyCourse} [course] - Curso a editar (opcional)
   */
  const openCourseDialog = useCallback((course?: AcademyCourse) => {
    try {
      if (course && (!course.id || !course.title)) {
        logger.error('Datos de curso inválidos', { course })
        setState(prev => ({ ...prev, lastError: 'Datos de curso inválidos' }))
        return
      }

      setState(prev => ({
        ...prev,
        courseDialogOpen: true,
        selectedCourse: course || null,
        lastError: null
      }))

      logger.debug('Diálogo de curso abierto', { 
        courseId: course?.id, 
        mode: course ? 'edit' : 'create' 
      })
    } catch (error) {
      logger.error('Error al abrir diálogo de curso', { error })
      setState(prev => ({ ...prev, lastError: 'Error al abrir diálogo de curso' }))
    }
  }, [logger])

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
