
import { test, expect } from '../fixtures/auth';

test.describe('Gestión de Contactos', () => {
  test('Lista de contactos se carga correctamente', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/contacts');
    
    // Verificar elementos principales
    await expect(authenticatedPage.locator('h1')).toContainText('Contactos');
    await expect(authenticatedPage.locator('[data-testid="contacts-table"]')).toBeVisible();
  });

  test('Crear nuevo contacto', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/contacts');
    
    // Abrir formulario de nuevo contacto
    await authenticatedPage.click('[data-testid="new-contact-button"]');
    
    // Llenar formulario básico
    await authenticatedPage.fill('[data-testid="contact-name"]', 'Test Contact E2E');
    await authenticatedPage.fill('[data-testid="contact-email"]', 'test.e2e@example.com');
    await authenticatedPage.fill('[data-testid="contact-phone"]', '+34 123 456 789');
    
    // Guardar contacto
    await authenticatedPage.click('[data-testid="save-contact-button"]');
    
    // Verificar que el contacto fue creado
    await expect(authenticatedPage.locator('text=Test Contact E2E')).toBeVisible();
  });

  test('Buscar contactos', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/contacts');
    
    // Usar el buscador
    const searchInput = authenticatedPage.locator('[data-testid="search-input"]');
    await searchInput.fill('test');
    
    // Verificar que los resultados se filtran
    await expect(authenticatedPage.locator('[data-testid="contacts-table"] tbody tr')).not.toHaveCount(0);
  });

  test('Filtros de contactos', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/contacts');
    
    // Abrir filtros si existen
    const filtersButton = authenticatedPage.locator('[data-testid="filters-button"]');
    if (await filtersButton.isVisible()) {
      await filtersButton.click();
      
      // Aplicar filtro por tipo
      await authenticatedPage.selectOption('[data-testid="contact-type-filter"]', 'company');
      
      // Verificar que se aplicó el filtro
      await expect(authenticatedPage.locator('[data-testid="active-filters"]')).toBeVisible();
    }
  });
});
