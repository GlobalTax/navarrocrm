
import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly sidebarMenu: Locator;
  readonly dashboardTitle: Locator;
  readonly metricsCards: Locator;
  readonly timerSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebarMenu = page.locator('[data-testid="sidebar-menu"]');
    this.dashboardTitle = page.locator('h1');
    this.metricsCards = page.locator('[data-testid="metric-card"]');
    this.timerSection = page.locator('[data-testid="timer-section"]');
  }

  async navigate() {
    await this.page.goto('/dashboard');
  }

  async navigateToContacts() {
    await this.page.click('text=Contactos');
    await this.page.waitForURL('/contacts');
  }

  async navigateToCases() {
    await this.page.click('text=Casos');
    await this.page.waitForURL('/cases');
  }

  async navigateToTasks() {
    await this.page.click('text=Tareas');
    await this.page.waitForURL('/tasks');
  }
}
