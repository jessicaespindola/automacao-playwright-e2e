import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  Status,
  setDefaultTimeout,
  type ITestCaseHookParameter,
} from '@cucumber/cucumber';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import type { Browser } from '@playwright/test';
import { selectors } from '@playwright/test';
import { SauceWorld, resolverBrowserType } from './world';
import { obterCredenciais } from '../../src/data/resolver';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
setDefaultTimeout(60_000);

const REPORTS_DIR = path.resolve(__dirname, '../../reports');
const EVIDENCIAS_DIR = path.join(REPORTS_DIR, 'evidencias');
const TRACES_DIR = path.join(REPORTS_DIR, 'traces');
const AUTH_DIR = path.resolve(__dirname, '../../.auth');
export const STORAGE_STATE_STANDARD = path.join(AUTH_DIR, 'standard_user.json');

let browserCompartilhado: Browser | undefined;

/** Tentativa atual por pickle.id — 0 = primeira execução; 1+ = retry */
const tentativasPorCenario = new Map<string, number>();

BeforeAll(async function () {
  selectors.setTestIdAttribute('data-test');

  fs.mkdirSync(EVIDENCIAS_DIR, { recursive: true });
  fs.mkdirSync(TRACES_DIR, { recursive: true });
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const headed = process.env.HEADED === 'true';
  const slowMo = Number(process.env.SLOW_MO || 0);
  const browserType = resolverBrowserType();

  browserCompartilhado = await browserType.launch({
    headless: !headed,
    slowMo: Number.isFinite(slowMo) ? slowMo : 0,
  });

  await gerarStorageStatePadrao(browserCompartilhado);
  console.log('[Hooks] Suite SauceDemo — Playwright + Cucumber iniciada (browser compartilhado)');
});

Before(async function (this: SauceWorld, { pickle }: ITestCaseHookParameter) {
  if (!browserCompartilhado) {
    throw new Error('Browser compartilhado não inicializado');
  }

  const tentativa = tentativasPorCenario.get(pickle.id) ?? 0;
  // Equivalente a trace: 'on-first-retry' do Playwright Test
  const gravarTrace = Boolean(process.env.CI) && tentativa >= 1;

  await this.iniciarContexto(browserCompartilhado, { gravarTrace });
});

After(async function (
  this: SauceWorld,
  { pickle, result, willBeRetried }: ITestCaseHookParameter & { willBeRetried?: boolean },
) {
  const status = result?.status;
  const nome = pickle.name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const falhou = status === Status.FAILED;

  if (falhou && this.page) {
    const pastaCenario = path.join(EVIDENCIAS_DIR, `${timestamp}_${nome}`);
    fs.mkdirSync(pastaCenario, { recursive: true });

    const screenshotPath = path.join(pastaCenario, 'screenshot.png');
    await this.page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});

    const meta = {
      cenario: pickle.name,
      tags: pickle.tags.map((t) => t.name),
      status: status ?? 'UNKNOWN',
      url: this.page.url(),
      timestamp: new Date().toISOString(),
      mensagemErro: result?.message?.split('\n')[0] ?? null,
    };
    fs.writeFileSync(path.join(pastaCenario, 'meta.json'), JSON.stringify(meta, null, 2));

    if (fs.existsSync(screenshotPath)) {
      const buffer = fs.readFileSync(screenshotPath);
      await this.attach(buffer, 'image/png');
      await this.attach(JSON.stringify(meta, null, 2), 'application/json');
    }
  }

  if (this.gravandoTrace && this.context) {
    const tracePath = path.join(TRACES_DIR, `${timestamp}_${nome}.zip`);
    try {
      await this.context.tracing.stop({ path: tracePath });
      this.gravandoTrace = false;
      if (falhou && fs.existsSync(tracePath)) {
        await this.attach(fs.readFileSync(tracePath), 'application/zip');
      } else if (fs.existsSync(tracePath) && !falhou) {
        fs.unlinkSync(tracePath);
      }
    } catch {
      await this.context.tracing.stop().catch(() => {});
      this.gravandoTrace = false;
    }
  }

  if (willBeRetried) {
    tentativasPorCenario.set(pickle.id, (tentativasPorCenario.get(pickle.id) ?? 0) + 1);
  } else {
    tentativasPorCenario.delete(pickle.id);
  }

  await this.encerrarContexto();
});

AfterAll(async function () {
  await browserCompartilhado?.close();
  browserCompartilhado = undefined;
  console.log('[Hooks] Suite finalizada — relatório em reports/cucumber-report.html');
});

export function obterBrowserCompartilhado(): Browser {
  if (!browserCompartilhado) {
    throw new Error('Browser compartilhado não inicializado');
  }
  return browserCompartilhado;
}

async function gerarStorageStatePadrao(browser: Browser) {
  const { username, password } = obterCredenciais('valido');
  const context = await browser.newContext({
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
  });
  const page = await context.newPage();
  try {
    await page.goto('/');
    await page.getByTestId('username').fill(username);
    await page.getByTestId('password').fill(password);
    await page.getByTestId('login-button').click();
    await page.waitForURL(/inventory\.html/);
    await context.storageState({ path: STORAGE_STATE_STANDARD });
    console.log('[Hooks] storageState gerado para standard_user');
  } catch (erro) {
    console.warn('[Hooks] Falha ao gerar storageState — login via UI será usado:', erro);
  } finally {
    await context.close();
  }
}
