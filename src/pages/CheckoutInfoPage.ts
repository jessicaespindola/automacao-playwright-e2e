import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export type DadosCheckout = {
  firstName: string;
  lastName: string;
  postalCode: string;
};

/**
 * Etapa 1 do checkout (Your Information).
 * Nota: SauceDemo não possui campos de cartão de crédito — a "forma de pagamento"
 * nesta demo é o formulário de dados de entrega (nome + CEP).
 */
export class CheckoutInfoPage extends BasePage {
  readonly titulo: Locator;
  readonly campoNome: Locator;
  readonly campoSobrenome: Locator;
  readonly campoCep: Locator;
  readonly botaoContinuar: Locator;
  readonly mensagemErro: Locator;

  constructor(page: Page) {
    super(page);
    this.titulo = page.getByText('Checkout: Your Information', { exact: true });
    this.campoNome = this.porTestId('firstName');
    this.campoSobrenome = this.porTestId('lastName');
    this.campoCep = this.porTestId('postalCode');
    this.botaoContinuar = this.porTestId('continue');
    this.mensagemErro = this.porTestId('error');
  }

  async validarPaginaInformacoes() {
    await this.aguardarUrl(/checkout-step-one\.html/);
    await expect(this.titulo).toBeVisible();
  }

  async preencherDados(dados: DadosCheckout) {
    await this.preencherCampo(this.campoNome, dados.firstName);
    await this.preencherCampo(this.campoSobrenome, dados.lastName);
    await this.preencherCampo(this.campoCep, dados.postalCode);
  }

  async continuar() {
    await this.clicar(this.botaoContinuar);
  }

  async validarMensagemErro(mensagemEsperada: string) {
    await expect(this.mensagemErro).toBeVisible();
    await expect(this.mensagemErro).toContainText(mensagemEsperada);
  }

  async validarPermanenciaNaEtapaInformacoes() {
    await this.aguardarUrl(/checkout-step-one\.html/);
    await expect(this.titulo).toBeVisible();
  }
}
