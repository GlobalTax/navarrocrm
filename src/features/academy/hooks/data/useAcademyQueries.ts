// Placeholder for academy queries
export const useAcademyQueries = () => {
  return {
    courses: [],
    categories: [],
    userProgress: null,
    isLoading: false,
    error: null
  }
}

export const useAcademyAdminQueries = () => {
  return {
    useAllCategories: () => ({ data: [], isLoading: false, error: null }),
    useAllCourses: () => ({ data: [], isLoading: false, error: null }),
    useAdminStats: () => ({ data: null, isLoading: false, error: null })
  }
}