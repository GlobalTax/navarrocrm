
import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';

test.describe('Autenticación', () => {
  test('Login exitoso', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.navigate();
    await loginPage.login('admin@test.com', 'admin123');
    
    // Verificar redirección al dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('Login con credenciales incorrectas', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.navigate();
    await loginPage.login('wrong@email.com', 'wrongpassword');
    
    // Verificar que se muestra error
    await loginPage.expectLoginError();
  });

  test('Logout exitoso', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    // Login primero
    await loginPage.navigate();
    await loginPage.login('admin@test.com', 'admin123');
    await expect(page).toHaveURL('/dashboard');
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Cerrar sesión');
    
    // Verificar redirección al login
    await expect(page).toHaveURL('/login');
  });
});
