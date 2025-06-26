
import { test, expect } from '../fixtures/auth';
import { DashboardPage } from '../page-objects/DashboardPage';

test.describe('Dashboard', () => {
  test('Visualización correcta del dashboard', async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage);
    
    await dashboardPage.navigate();
    
    // Verificar elementos principales
    await expect(dashboardPage.dashboardTitle).toBeVisible();
    await expect(dashboardPage.metricsCards.first()).toBeVisible();
    await expect(dashboardPage.sidebarMenu).toBeVisible();
  });

  test('Navegación desde dashboard', async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage);
    
    await dashboardPage.navigate();
    
    // Test navegación a contactos
    await dashboardPage.navigateToContacts();
    await expect(authenticatedPage).toHaveURL('/contacts');
    
    // Volver al dashboard
    await dashboardPage.navigate();
    
    // Test navegación a casos
    await dashboardPage.navigateToCases();
    await expect(authenticatedPage).toHaveURL('/cases');
  });

  test('Timer funcional', async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage);
    
    await dashboardPage.navigate();
    
    // Verificar que el timer está visible
    await expect(dashboardPage.timerSection).toBeVisible();
    
    // Iniciar timer (si hay botón de start)
    const startButton = authenticatedPage.locator('[data-testid="timer-start"]');
    if (await startButton.isVisible()) {
      await startButton.click();
      
      // Verificar que el timer está corriendo
      await expect(authenticatedPage.locator('[data-testid="timer-running"]')).toBeVisible();
    }
  });
});
