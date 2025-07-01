// Tipos centralizados para el módulo de Academia
export interface AcademyCategory {
  id: string
  name: string
  description?: string
  icon?: string
  color: string
  sort_order?: number
  is_active: boolean
  created_at: string
  updated_at: string
  org_id: string
}

export interface AcademyCourse {
  id: string
  title: string
  description?: string
  category_id: string
  level: 'beginner' | 'intermediate' | 'advanced'
  total_lessons: number
  estimated_duration?: number
  is_published: boolean
  sort_order: number
  created_at: string
  updated_at: string
  created_by: string
  org_id: string
  academy_categories?: {
    name: string
    color: string
  }
}

export interface AcademyLesson {
  id: string
  course_id: string
  org_id: string
  title: string
  content: string
  lesson_type: 'text' | 'interactive' | 'quiz'
  estimated_duration?: number
  sort_order: number
  is_published: boolean
  learning_objectives?: string[]
  prerequisites?: string[]
  practical_exercises?: any[]
  created_at: string
  updated_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  course_id: string
  lesson_id?: string
  status: 'not_started' | 'in_progress' | 'completed'
  progress_percentage: number
  time_spent: number
  completed_at?: string
  last_accessed_at: string
  notes?: string
  org_id: string
}

// Formularios
export interface CourseFormData {
  title: string
  description?: string
  category_id: string
  level: 'beginner' | 'intermediate' | 'advanced'
  estimated_duration?: number
  is_published: boolean
}

export interface CategoryFormData {
  name: string
  description?: string
  icon?: string
  color: string
  sort_order?: number
  is_active: boolean
}

export interface LessonFormData {
  title: string
  content: string
  lesson_type: 'text' | 'interactive' | 'quiz'
  estimated_duration?: number
  sort_order: number
  is_published: boolean
  learning_objectives: string[]
  prerequisites: string[]
}

export interface AIGenerationRequest {
  topic: string
  level: 'beginner' | 'intermediate' | 'advanced'
  category_id: string
  estimated_lessons: number
  target_audience: string
}

// Estados de UI
export interface AcademiaAdminState {
  courseDialogOpen: boolean
  categoryDialogOpen: boolean
  lessonDialogOpen: boolean
  aiCourseDialogOpen: boolean
  selectedCourse: AcademyCourse | null
  selectedCategory: AcademyCategory | null
  selectedCourseForLesson: string
}

// Constantes
export const COURSE_LEVELS = {
  beginner: 'Principiante',
  intermediate: 'Intermedio', 
  advanced: 'Avanzado'
} as const

export const LESSON_TYPES = {
  text: 'Texto/Lectura',
  interactive: 'Interactiva',
  quiz: 'Cuestionario'
} as const

export const PROGRESS_STATUS = {
  not_started: 'Sin iniciar',
  in_progress: 'En progreso',
  completed: 'Completado'
} as const
