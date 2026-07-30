import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  readonly tituloProdutos: Locator;
  readonly linkCarrinho: Locator;
  readonly badgeCarrinho: Locator;

  constructor(page: Page) {
    super(page);
    // SauceDemo usa <span class="title"> — sem heading semântico no DOM
    this.tituloProdutos = page.getByText('Products', { exact: true });
    this.linkCarrinho = this.porTestId('shopping-cart-link');
    this.badgeCarrinho = this.porTestId('shopping-cart-badge');
  }

  async validarPaginaProdutos() {
    await this.aguardarUrl(/inventory\.html/);
    await expect(this.tituloProdutos).toBeVisible();
  }

  async validarTituloVisivel(titulo: string) {
    await expect(this.page.getByText(titulo, { exact: true })).toBeVisible();
  }

  async adicionarProdutoAoCarrinho(dataTestId: string) {
    await this.clicar(this.porTestId(`add-to-cart-${dataTestId}`));
  }

  async validarQuantidadeCarrinho(quantidade: number) {
    await expect(this.badgeCarrinho).toHaveText(String(quantidade));
  }

  async abrirCarrinho() {
    await this.clicar(this.linkCarrinho);
  }
}
