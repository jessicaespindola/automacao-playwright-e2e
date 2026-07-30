import { When, Then } from '@cucumber/cucumber';
import { SauceWorld } from '../support/world';
import {
  obterCliente,
  obterMensagemErroCheckout,
  obterConfirmacaoCompra,
} from '../../src/data/resolver';

Then(
  'o produto {string} deve estar no carrinho',
  async function (this: SauceWorld, nomeProduto: string) {
    await this.cartPage.validarProdutoNoCarrinho(nomeProduto);
  },
);

Then(
  'o carrinho deve conter {int} itens',
  async function (this: SauceWorld, quantidade: number) {
    await this.cartPage.validarQuantidadeItens(quantidade);
  },
);

When(
  'eu preencho os dados de entrega do cliente {string}',
  async function (this: SauceWorld, chaveCliente: string) {
    await this.checkoutInfoPage.preencherDados(obterCliente(chaveCliente));
  },
);

When('eu continuo para o resumo do pedido', async function (this: SauceWorld) {
  await this.checkoutInfoPage.continuar();
});

Then(
  'o resumo deve exibir o produto {string}',
  async function (this: SauceWorld, nomeProduto: string) {
    await this.checkoutOverviewPage.validarPaginaResumo();
    await this.checkoutOverviewPage.validarProdutoNoResumo(nomeProduto);
  },
);

When('eu finalizo a compra', async function (this: SauceWorld) {
  await this.checkoutOverviewPage.finalizarCompra();
});

Then('eu devo ver a confirmação da compra', async function (this: SauceWorld) {
  await this.checkoutCompletePage.validarCompraConcluida(obterConfirmacaoCompra());
});

Then(
  'eu devo permanecer na etapa de informações do checkout',
  async function (this: SauceWorld) {
    await this.checkoutInfoPage.validarPermanenciaNaEtapaInformacoes();
  },
);

Then(
  'deve ser exibida a mensagem de erro do checkout {string}',
  async function (this: SauceWorld, chaveMensagem: string) {
    const mensagem = obterMensagemErroCheckout(chaveMensagem);
    await this.checkoutInfoPage.validarMensagemErro(mensagem);
  },
);
