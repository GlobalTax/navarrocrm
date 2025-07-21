
import { useState, useCallback } from 'react'
import type { AcademiaAdminState, AcademyCourse, AcademyCategory } from '@/types/academy'
import { createLogger } from '@/utils/logger'

/**
 * Estado inicial de la administración de Academia
 * @const {AcademiaAdminState} initialState
 */
const initialState: AcademiaAdminState = {
  courseDialogOpen: false,
  categoryDialogOpen: false,
  lessonDialogOpen: false,
  aiCourseDialogOpen: false,
  selectedCourse: null,
  selectedCategory: null,
  selectedCourseForLesson: ''
}

/**
 * Hook para gestionar el estado de administración de Academia
 * Proporciona un estado centralizado para diálogos y selecciones de la Academia
 * 
 * @returns {Object} Objeto con estado y acciones disponibles
 * @returns {AcademiaAdminState} returns.state - Estado actual de la administración
 * @returns {Object} returns.actions - Acciones disponibles para modificar el estado
 * 
 * @example
 * ```typescript
 * const { state, actions } = useAcademiaAdminState()
 * 
 * // Abrir diálogo de curso
 * actions.openCourseDialog(selectedCourse)
 * 
 * // Abrir diálogo de categoría
 * actions.openCategoryDialog()
 * 
 * // Reset del estado
 * actions.resetState()
 * ```
 * 
 * @since 1.0.0
 */
export const useAcademiaAdminState = () => {
  const logger = createLogger('useAcademiaAdminState')
  const [state, setState] = useState<AcademiaAdminState>(initialState)

  /**
   * Abre el diálogo de curso con curso opcional seleccionado
   * @param {AcademyCourse} [course] - Curso a editar (opcional)
   */
  const openCourseDialog = useCallback((course?: AcademyCourse) => {
    try {
      if (course && (!course.id || !course.title)) {
        throw new Error('Datos de curso inválidos')
      }

      setState(prev => ({
        ...prev,
        courseDialogOpen: true,
        selectedCourse: course || null
      }))

      logger.debug('Abriendo diálogo de curso', { 
        courseId: course?.id, 
        mode: course ? 'edit' : 'create' 
      })
    } catch (error) {
      logger.error('Error al abrir diálogo de curso', { error, course })
    }
  }, [logger])

  /**
   * Cierra el diálogo de curso y limpia la selección
   */
  const closeCourseDialog = useCallback(() => {
    setState(prev => ({
      ...prev,
      courseDialogOpen: false,
      selectedCourse: null
    }))
    logger.debug('Cerrando diálogo de curso')
  }, [logger])

  /**
   * Abre el diálogo de categoría con categoría opcional seleccionada
   * @param {AcademyCategory} [category] - Categoría a editar (opcional)
   */
  const openCategoryDialog = useCallback((category?: AcademyCategory) => {
    try {
      if (category && (!category.id || !category.name)) {
        throw new Error('Datos de categoría inválidos')
      }

      setState(prev => ({
        ...prev,
        categoryDialogOpen: true,
        selectedCategory: category || null
      }))

      logger.debug('Abriendo diálogo de categoría', { 
        categoryId: category?.id, 
        mode: category ? 'edit' : 'create' 
      })
    } catch (error) {
      logger.error('Error al abrir diálogo de categoría', { error, category })
    }
  }, [logger])

  /**
   * Cierra el diálogo de categoría y limpia la selección
   */
  const closeCategoryDialog = useCallback(() => {
    setState(prev => ({
      ...prev,
      categoryDialogOpen: false,
      selectedCategory: null
    }))
    logger.debug('Cerrando diálogo de categoría')
  }, [logger])

  /**
   * Abre el diálogo de lección para el curso especificado
   * @param {string} courseId - ID del curso para la lección
   */
  const openLessonDialog = useCallback((courseId: string) => {
    try {
      if (!courseId?.trim()) {
        throw new Error('ID de curso es requerido')
      }

      setState(prev => ({
        ...prev,
        lessonDialogOpen: true,
        selectedCourseForLesson: courseId
      }))

      logger.debug('Abriendo diálogo de lección', { courseId })
    } catch (error) {
      logger.error('Error al abrir diálogo de lección', { error, courseId })
    }
  }, [logger])

  /**
   * Cierra el diálogo de lección y limpia la selección
   */
  const closeLessonDialog = useCallback(() => {
    setState(prev => ({
      ...prev,
      lessonDialogOpen: false,
      selectedCourseForLesson: ''
    }))
    logger.debug('Cerrando diálogo de lección')
  }, [logger])

  /**
   * Abre el diálogo del generador AI
   */
  const openAIDialog = useCallback(() => {
    setState(prev => ({
      ...prev,
      aiCourseDialogOpen: true
    }))
    logger.debug('Abriendo diálogo de generador AI')
  }, [logger])

  /**
   * Cierra el diálogo del generador AI
   */
  const closeAIDialog = useCallback(() => {
    setState(prev => ({
      ...prev,
      aiCourseDialogOpen: false
    }))
    logger.debug('Cerrando diálogo de generador AI')
  }, [logger])

  /**
   * Resetea todo el estado al estado inicial
   */
  const resetState = useCallback(() => {
    setState(initialState)
    logger.debug('Estado reseteado a inicial')
  }, [logger])

  const actions = {
    openCourseDialog,
    closeCourseDialog,
    openCategoryDialog,
    closeCategoryDialog,
    openLessonDialog,
    closeLessonDialog,
    openAIDialog,
    closeAIDialog,
    resetState
  }

  return {
    state,
    actions
  }
}
