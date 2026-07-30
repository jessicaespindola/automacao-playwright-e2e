import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutOverviewPage extends BasePage {
  readonly titulo: Locator;
  readonly botaoFinalizar: Locator;
  readonly resumoItens: Locator;

  constructor(page: Page) {
    super(page);
    this.titulo = page.getByText('Checkout: Overview', { exact: true });
    this.botaoFinalizar = this.porTestId('finish');
    this.resumoItens = this.porTestId('inventory-item');
  }

  async validarPaginaResumo() {
    await this.aguardarUrl(/checkout-step-two\.html/);
    await expect(this.titulo).toBeVisible();
  }

  async validarProdutoNoResumo(nomeProduto: string) {
    const item = this.resumoItens.filter({
      has: this.page.getByText(nomeProduto, { exact: true }),
    });
    await expect(item).toBeVisible();
  }

  async finalizarCompra() {
    await this.clicar(this.botaoFinalizar);
  }
}
