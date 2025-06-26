
import { test, expect } from '../fixtures/auth';

test.describe('Navegación', () => {
  test('Navegación principal funciona correctamente', async ({ authenticatedPage }) => {
    // Verificar que estamos en el dashboard
    await expect(authenticatedPage).toHaveURL('/dashboard');
    
    // Test navegación a diferentes secciones
    const sections = [
      { name: 'Contactos', url: '/contacts' },
      { name: 'Casos', url: '/cases' },
      { name: 'Tareas', url: '/tasks' },
      { name: 'Propuestas', url: '/proposals' },
      { name: 'Time Tracking', url: '/time-tracking' }
    ];
    
    for (const section of sections) {
      // Navegar a la sección
      await authenticatedPage.click(`text=${section.name}`);
      await expect(authenticatedPage).toHaveURL(section.url);
      
      // Verificar que la página se cargó correctamente
      await expect(authenticatedPage.locator('h1')).toBeVisible();
    }
  });

  test('Sidebar es responsive', async ({ authenticatedPage }) => {
    // En desktop, sidebar debe estar visible
    await expect(authenticatedPage.locator('[data-testid="sidebar"]')).toBeVisible();
    
    // Simular mobile viewport
    await authenticatedPage.setViewportSize({ width: 375, height: 667 });
    
    // En mobile, sidebar puede estar colapsado
    const sidebarToggle = authenticatedPage.locator('[data-testid="sidebar-toggle"]');
    if (await sidebarToggle.isVisible()) {
      await sidebarToggle.click();
      await expect(authenticatedPage.locator('[data-testid="sidebar"]')).toBeVisible();
    }
  });
});
