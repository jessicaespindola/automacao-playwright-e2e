import { Given, When, Then } from '@cucumber/cucumber';
import * as fs from 'fs';
import { SauceWorld } from '../support/world';
import {
  obterBrowserCompartilhado,
  STORAGE_STATE_STANDARD,
} from '../support/hooks';
import {
  obterProdutoPorNome,
  resolverUsuarioParaLogin,
} from '../../src/data/resolver';

/**
 * Steps compartilhados (auth, carrinho, navegação).
 * Equivalente a fixtures reutilizáveis no mundo Cucumber.
 */
Given('que estou autenticado como {string}', async function (this: SauceWorld, usuario: string) {
  const credenciais = resolverUsuarioParaLogin(usuario);
  const podeUsarStorage =
    credenciais.username === 'standard_user' && fs.existsSync(STORAGE_STATE_STANDARD);

  if (podeUsarStorage) {
    const gravarTrace = this.gravandoTrace;
    await this.encerrarContexto();
    await this.iniciarContexto(obterBrowserCompartilhado(), {
      storageStatePath: STORAGE_STATE_STANDARD,
      gravarTrace,
    });
    await this.page.goto('/inventory.html');
    await this.inventoryPage.validarPaginaProdutos();
    return;
  }

  await this.loginPage.abrir();
  await this.loginPage.fazerLogin(credenciais.username, credenciais.password);
  await this.inventoryPage.validarPaginaProdutos();
});

Given('que estou na página de login do SauceDemo', async function (this: SauceWorld) {
  await this.loginPage.abrir();
});

When(
  'eu adiciono o produto {string} ao carrinho',
  async function (this: SauceWorld, nomeProduto: string) {
    const produto = obterProdutoPorNome(nomeProduto);
    this.produtoAtual = produto;
    await this.inventoryPage.adicionarProdutoAoCarrinho(produto.dataTestId);
  },
);

When('eu abro o carrinho', async function (this: SauceWorld) {
  await this.inventoryPage.abrirCarrinho();
  await this.cartPage.validarPaginaCarrinho();
});

When('eu inicio o checkout', async function (this: SauceWorld) {
  await this.cartPage.irParaCheckout();
  await this.checkoutInfoPage.validarPaginaInformacoes();
});

/** Atalho para reduzir setup repetido na suíte a11y / fluxos longos */
Given(
  'que estou na página do carrinho com o produto {string}',
  async function (this: SauceWorld, nomeProduto: string) {
    const credenciais = resolverUsuarioParaLogin('valido');
    if (fs.existsSync(STORAGE_STATE_STANDARD)) {
      const gravarTrace = this.gravandoTrace;
      await this.encerrarContexto();
      await this.iniciarContexto(obterBrowserCompartilhado(), {
        storageStatePath: STORAGE_STATE_STANDARD,
        gravarTrace,
      });
      await this.page.goto('/inventory.html');
      await this.inventoryPage.validarPaginaProdutos();
    } else {
      await this.loginPage.abrir();
      await this.loginPage.fazerLogin(credenciais.username, credenciais.password);
      await this.inventoryPage.validarPaginaProdutos();
    }
    const produto = obterProdutoPorNome(nomeProduto);
    this.produtoAtual = produto;
    await this.inventoryPage.adicionarProdutoAoCarrinho(produto.dataTestId);
    await this.inventoryPage.abrirCarrinho();
    await this.cartPage.validarPaginaCarrinho();
  },
);

Given(
  'que estou na etapa de informações do checkout com o produto {string}',
  async function (this: SauceWorld, nomeProduto: string) {
    // reutiliza o fluxo composto acima via steps internos
    const credenciais = resolverUsuarioParaLogin('valido');
    if (fs.existsSync(STORAGE_STATE_STANDARD)) {
      const gravarTrace = this.gravandoTrace;
      await this.encerrarContexto();
      await this.iniciarContexto(obterBrowserCompartilhado(), {
        storageStatePath: STORAGE_STATE_STANDARD,
        gravarTrace,
      });
      await this.page.goto('/inventory.html');
      await this.inventoryPage.validarPaginaProdutos();
    } else {
      await this.loginPage.abrir();
      await this.loginPage.fazerLogin(credenciais.username, credenciais.password);
      await this.inventoryPage.validarPaginaProdutos();
    }
    const produto = obterProdutoPorNome(nomeProduto);
    this.produtoAtual = produto;
    await this.inventoryPage.adicionarProdutoAoCarrinho(produto.dataTestId);
    await this.inventoryPage.abrirCarrinho();
    await this.cartPage.validarPaginaCarrinho();
    await this.cartPage.irParaCheckout();
    await this.checkoutInfoPage.validarPaginaInformacoes();
  },
);

Then(
  'o badge do carrinho deve exibir {string}',
  async function (this: SauceWorld, quantidade: string) {
    await this.inventoryPage.validarQuantidadeCarrinho(Number(quantidade));
  },
);
