import { type Page, expect } from '@playwright/test';

export type PassoTab = {
  indice: number;
  dataTestEsperado: string;
  dataTestAtual: string | null;
  ok: boolean;
};

export type ResultadoNavegacaoTab = {
  formulario: string;
  ordemEsperada: string[];
  passos: PassoTab[];
  roteiroTexto: string;
  aprovado: boolean;
};

/**
 * Obtém o valor de data-test do elemento com foco (activeElement).
 * Limitação documentada: só detecta foco em elementos com data-test.
 */
async function dataTestDoFoco(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return null;
    return el.getAttribute('data-test');
  });
}

/**
 * Valida a ordem de tabulação (WCAG 2.1.1 Keyboard) entre elementos
 * identificados por data-test do SauceDemo (via getByTestId).
 */
export async function validarOrdemTab(
  page: Page,
  formulario: string,
  ordemDataTest: string[],
): Promise<ResultadoNavegacaoTab> {
  if (ordemDataTest.length === 0) {
    throw new Error('ordemDataTest não pode ser vazia');
  }

  const passos: PassoTab[] = [];

  const primeiro = page.getByTestId(ordemDataTest[0]);
  await expect(primeiro).toBeVisible();
  await primeiro.focus();

  let atual = await dataTestDoFoco(page);
  passos.push({
    indice: 1,
    dataTestEsperado: ordemDataTest[0],
    dataTestAtual: atual,
    ok: atual === ordemDataTest[0],
  });

  for (let i = 1; i < ordemDataTest.length; i++) {
    await page.keyboard.press('Tab');
    atual = await dataTestDoFoco(page);
    const esperado = ordemDataTest[i];
    passos.push({
      indice: i + 1,
      dataTestEsperado: esperado,
      dataTestAtual: atual,
      ok: atual === esperado,
    });

    const locatorEsperado = page.getByTestId(esperado);
    try {
      await expect(locatorEsperado).toBeFocused({ timeout: 3_000 });
    } catch {
      const roteiroParcial = montarRoteiro(formulario, ordemDataTest, passos, false);
      throw new Error(
        [
          `[TAB] Ordem de foco incorreta no formulário "${formulario}".`,
          `Passo ${i + 1}: esperado data-test="${esperado}", foco atual data-test="${atual ?? '(nenhum/sem data-test)'}".`,
          ``,
          roteiroParcial,
        ].join('\n'),
      );
    }
  }

  const aprovado = passos.every((p) => p.ok);
  const roteiroTexto = montarRoteiro(formulario, ordemDataTest, passos, aprovado);

  if (!aprovado) {
    throw new Error(roteiroTexto);
  }

  return {
    formulario,
    ordemEsperada: ordemDataTest,
    passos,
    roteiroTexto,
    aprovado,
  };
}

function montarRoteiro(
  formulario: string,
  ordemEsperada: string[],
  passos: PassoTab[],
  aprovado: boolean,
): string {
  const linhasPassos = passos
    .map((p) => {
      const status = p.ok ? 'OK' : 'FALHOU';
      return `  ${p.indice}. [${status}] esperado="${p.dataTestEsperado}" | foco="${p.dataTestAtual ?? '(vazio)'}"`;
    })
    .join('\n');

  return [
    `=== Roteiro de navegação por TAB: ${formulario} ===`,
    `Critério: WCAG 2.1.1 Keyboard (Nível A)`,
    `Ordem esperada: ${ordemEsperada.join(' → ')}`,
    ``,
    `Passos:`,
    linhasPassos,
    ``,
    `Veredito: ${aprovado ? 'APROVADO — ordem de TAB conforme esperado' : 'REPROVADO — ordem de TAB divergente'}`,
    ``,
    `Nota: este teste prova que os campos principais (com data-test) recebem foco na ordem esperada.`,
    `Não cobre Shift+TAB, elementos sem data-test, leitor de tela nem armadilha de foco em modais.`,
  ].join('\n');
}
