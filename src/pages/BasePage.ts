import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Classe base com ações comuns a todos os Page Objects.
 *
 * Prioridade de locators (obrigatória):
 * 1. getByRole com name
 * 2. getByTestId (testIdAttribute: data-test no BrowserContext)
 * 3. getByLabel / getByPlaceholder / getByText (conforme o tipo de elemento)
 * 4. CSS somente como fallback pontual e curto
 *
 * Proibido: XPath; cadeias longas de CSS; nth / .first() / .last() sem critério semântico.
 * Proibido: waitForTimeout como sincronização; expect(await locator.isVisible()).toBe(true).
 * Assertions: usar expect web-first com auto-retry (toBeVisible, toHaveText, toHaveURL, etc.).
 */
export class BasePage {
  constructor(readonly page: Page) {}

  async navegarPara(path = '/') {
    await this.page.goto(path);
  }

  async aguardarUrl(fragmento: string | RegExp) {
    await expect(this.page).toHaveURL(fragmento);
  }

  /** Atalho tipado para data-test do SauceDemo (via testIdAttribute). */
  porTestId(valor: string): Locator {
    return this.page.getByTestId(valor);
  }

  async preencherCampo(locator: Locator, valor: string) {
    await locator.clear();
    await locator.fill(valor);
  }

  async clicar(locator: Locator) {
    await locator.click();
  }
}
