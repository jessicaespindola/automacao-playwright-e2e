import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly campoUsuario: Locator;
  readonly campoSenha: Locator;
  readonly botaoLogin: Locator;
  readonly mensagemErro: Locator;

  constructor(page: Page) {
    super(page);
    this.campoUsuario = this.porTestId('username');
    this.campoSenha = this.porTestId('password');
    this.botaoLogin = this.porTestId('login-button');
    this.mensagemErro = this.porTestId('error');
  }

  async abrir() {
    await this.navegarPara('/');
    await expect(this.botaoLogin).toBeVisible();
  }

  async preencherUsuario(usuario: string) {
    await this.preencherCampo(this.campoUsuario, usuario);
  }

  async preencherSenha(senha: string) {
    await this.preencherCampo(this.campoSenha, senha);
  }

  async clicarLogin() {
    await this.clicar(this.botaoLogin);
  }

  async fazerLogin(usuario: string, senha: string) {
    await this.preencherUsuario(usuario);
    await this.preencherSenha(senha);
    await this.clicarLogin();
  }

  async validarMensagemErro(mensagemEsperada: string) {
    await expect(this.mensagemErro).toBeVisible();
    await expect(this.mensagemErro).toContainText(mensagemEsperada);
  }

  async validarPermanenciaNaTelaLogin() {
    await expect(this.page).toHaveURL(/saucedemo\.com\/?$/);
    await expect(this.botaoLogin).toBeVisible();
  }
}
