
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { integrationTestService } from './services/integrationTestService'
import { useTestRunner } from './hooks/useTestRunner'

export const useIntegrationTests = () => {
  const { user } = useApp()
  const { testResults, isRunning, setIsRunning, runTest, initializeTests } = useTestRunner()

  const runAllTests = async () => {
    setIsRunning(true)
    initializeTests()

    await runTest('Conexión Base de Datos', () => integrationTestService.testDatabaseConnection())
    await runTest('Integración Outlook', () => integrationTestService.testOutlookIntegration(user?.org_id || ''))
    await runTest('Tokens Usuario', () => integrationTestService.testUserTokens(user?.id || '', user?.org_id || ''))
    await runTest('Edge Functions', () => integrationTestService.testEdgeFunctions())

    setIsRunning(false)
    toast.success('Tests completados')
  }

  return {
    isRunning,
    testResults,
    runAllTests
  }
}
