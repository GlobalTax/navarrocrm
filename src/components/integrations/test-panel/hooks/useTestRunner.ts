
import { useState } from 'react'
import { TestResult } from '../types'

export const useTestRunner = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTest = async (testName: string, testFn: () => Promise<TestResult>) => {
    setTestResults(prev => prev.map(result => 
      result.name === testName 
        ? { ...result, status: 'pending', message: 'Ejecutando...' }
        : result
    ))

    try {
      const result = await testFn()
      setTestResults(prev => prev.map(r => r.name === testName ? result : r))
    } catch (error) {
      setTestResults(prev => prev.map(r => 
        r.name === testName 
          ? { 
              name: testName, 
              status: 'error', 
              message: 'Error inesperado',
              details: error instanceof Error ? error.message : 'Error desconocido'
            }
          : r
      ))
    }
  }

  const initializeTests = () => {
    setTestResults([
      { name: 'Conexión Base de Datos', status: 'pending', message: 'Iniciando...' },
      { name: 'Integración Outlook', status: 'pending', message: 'Iniciando...' },
      { name: 'Tokens Usuario', status: 'pending', message: 'Iniciando...' },
      { name: 'Edge Functions', status: 'pending', message: 'Iniciando...' }
    ])
  }

  return {
    testResults,
    isRunning,
    setIsRunning,
    runTest,
    initializeTests
  }
}
