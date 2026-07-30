import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutCompletePage extends BasePage {
  readonly titulo: Locator;
  readonly cabecalhoConfirmacao: Locator;

  constructor(page: Page) {
    super(page);
    this.titulo = page.getByText('Checkout: Complete!', { exact: true });
    this.cabecalhoConfirmacao = this.porTestId('complete-header');
  }

  async validarCompraConcluida(mensagemEsperada: string) {
    await this.aguardarUrl(/checkout-complete\.html/);
    await expect(this.titulo).toBeVisible();
    await expect(this.cabecalhoConfirmacao).toHaveText(mensagemEsperada);
  }
}
