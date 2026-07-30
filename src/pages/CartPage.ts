import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly tituloCarrinho: Locator;
  readonly botaoCheckout: Locator;
  readonly itensCarrinho: Locator;

  constructor(page: Page) {
    super(page);
    this.tituloCarrinho = page.getByText('Your Cart', { exact: true });
    this.botaoCheckout = this.porTestId('checkout');
    this.itensCarrinho = this.porTestId('inventory-item');
  }

  async validarPaginaCarrinho() {
    await this.aguardarUrl(/cart\.html/);
    await expect(this.tituloCarrinho).toBeVisible();
  }

  async validarProdutoNoCarrinho(nomeProduto: string) {
    const item = this.itensCarrinho.filter({
      has: this.page.getByText(nomeProduto, { exact: true }),
    });
    await expect(item).toBeVisible();
  }

  async validarQuantidadeItens(quantidade: number) {
    await expect(this.itensCarrinho).toHaveCount(quantidade);
  }

  async irParaCheckout() {
    await this.clicar(this.botaoCheckout);
  }
}
