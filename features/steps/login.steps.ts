import { When, Then } from '@cucumber/cucumber';
import { SauceWorld } from '../support/world';
import {
  obterCredenciais,
  obterMensagemErroLogin,
} from '../../src/data/resolver';

When(
  'eu faço login com o perfil {string}',
  async function (this: SauceWorld, perfil: string) {
    const { username, password } = obterCredenciais(perfil);
    await this.loginPage.fazerLogin(username, password);
  },
);

When('eu tento fazer login sem preencher usuário e senha', async function (this: SauceWorld) {
  await this.loginPage.clicarLogin();
});

When(
  'eu preencho apenas o usuário do perfil {string} e deixo a senha em branco',
  async function (this: SauceWorld, perfil: string) {
    const { username } = obterCredenciais(perfil);
    await this.loginPage.preencherUsuario(username);
  },
);

When('eu clico no botão de login', async function (this: SauceWorld) {
  await this.loginPage.clicarLogin();
});

Then('eu devo ser redirecionado para a página de produtos', async function (this: SauceWorld) {
  await this.inventoryPage.validarPaginaProdutos();
});

Then('o título {string} deve estar visível', async function (this: SauceWorld, titulo: string) {
  await this.inventoryPage.validarTituloVisivel(titulo);
});

Then('eu devo permanecer na página de login', async function (this: SauceWorld) {
  await this.loginPage.validarPermanenciaNaTelaLogin();
});

Then(
  'deve ser exibida a mensagem de erro de login {string}',
  async function (this: SauceWorld, chaveMensagem: string) {
    const mensagem = obterMensagemErroLogin(chaveMensagem);
    await this.loginPage.validarMensagemErro(mensagem);
  },
);
