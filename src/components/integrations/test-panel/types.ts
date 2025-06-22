
export interface TestResult {
  name: string
  status: 'success' | 'error' | 'warning' | 'pending'
  message: string
  details?: string
}
