import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import {
  Browser,
  BrowserContext,
  Page,
  chromium,
  firefox,
  webkit,
  type BrowserType,
} from '@playwright/test';
import {
  LoginPage,
  InventoryPage,
  CartPage,
  CheckoutInfoPage,
  CheckoutOverviewPage,
  CheckoutCompletePage,
} from '../../src/pages';
import type { Produto } from '../../src/data/resolver';

const BROWSERS: Record<string, BrowserType> = {
  chromium,
  firefox,
  webkit,
};

export type OpcoesContexto = {
  storageStatePath?: string;
  gravarTrace?: boolean;
};

export class SauceWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  gravandoTrace = false;

  private _loginPage?: LoginPage;
  private _inventoryPage?: InventoryPage;
  private _cartPage?: CartPage;
  private _checkoutInfoPage?: CheckoutInfoPage;
  private _checkoutOverviewPage?: CheckoutOverviewPage;
  private _checkoutCompletePage?: CheckoutCompletePage;

  /** Contexto compartilhado entre steps do mesmo cenário */
  produtoAtual?: Produto;
  ultimoResumoA11y?: import('../../src/utils/acessibilidade').ResumoAcessibilidade;
  ultimoRoteiroTab?: import('../../src/utils/teclado').ResultadoNavegacaoTab;

  constructor(options: IWorldOptions) {
    super(options);
  }

  get loginPage(): LoginPage {
    return (this._loginPage ??= new LoginPage(this.page));
  }

  get inventoryPage(): InventoryPage {
    return (this._inventoryPage ??= new InventoryPage(this.page));
  }

  get cartPage(): CartPage {
    return (this._cartPage ??= new CartPage(this.page));
  }

  get checkoutInfoPage(): CheckoutInfoPage {
    return (this._checkoutInfoPage ??= new CheckoutInfoPage(this.page));
  }

  get checkoutOverviewPage(): CheckoutOverviewPage {
    return (this._checkoutOverviewPage ??= new CheckoutOverviewPage(this.page));
  }

  get checkoutCompletePage(): CheckoutCompletePage {
    return (this._checkoutCompletePage ??= new CheckoutCompletePage(this.page));
  }

  private limparPageObjects() {
    this._loginPage = undefined;
    this._inventoryPage = undefined;
    this._cartPage = undefined;
    this._checkoutInfoPage = undefined;
    this._checkoutOverviewPage = undefined;
    this._checkoutCompletePage = undefined;
  }

  async iniciarContexto(browser: Browser, opcoes: OpcoesContexto = {}) {
    this.browser = browser;
    this.limparPageObjects();

    this.context = await browser.newContext({
      baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
      viewport: { width: 1280, height: 720 },
      locale: 'en-US',
      ...(opcoes.storageStatePath ? { storageState: opcoes.storageStatePath } : {}),
    });

    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(15_000);
    this.page.setDefaultNavigationTimeout(30_000);

    this.gravandoTrace = Boolean(opcoes.gravarTrace);
    if (this.gravandoTrace) {
      await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true });
    }
  }

  async encerrarContexto() {
    if (this.context) {
      if (this.gravandoTrace) {
        await this.context.tracing.stop().catch(() => {});
      }
      await this.context.close().catch(() => {});
    }
    this.limparPageObjects();
  }
}

export function resolverBrowserType(): BrowserType {
  const nome = (process.env.BROWSER || 'chromium').toLowerCase();
  const tipo = BROWSERS[nome];
  if (!tipo) {
    throw new Error(`BROWSER inválido: "${nome}". Use: chromium | firefox | webkit`);
  }
  return tipo;
}

setWorldConstructor(SauceWorld);
