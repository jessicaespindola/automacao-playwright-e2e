import { When, Then } from '@cucumber/cucumber';
import { SauceWorld } from '../support/world';
import {
  analisarAcessibilidade,
  assertSemViolacoesCriticasOuSerias,
  resumoJsonParaAnexo,
  regrasDesabilitadasParaPagina,
} from '../../src/utils/acessibilidade';
import { validarOrdemTab } from '../../src/utils/teclado';

When(
  'eu executo a análise de acessibilidade na página {string}',
  async function (this: SauceWorld, nomePagina: string) {
    const resumo = await analisarAcessibilidade(this.page, nomePagina, {
      disableRules: regrasDesabilitadasParaPagina(nomePagina),
    });
    this.ultimoResumoA11y = resumo;

    console.log(`\n${resumo.boletimTexto}\n`);
    await this.attach(resumo.boletimTexto, 'text/plain');
    await this.attach(JSON.stringify(resumoJsonParaAnexo(resumo), null, 2), 'application/json');
  },
);

Then(
  'a página deve estar livre de violações critical e serious segundo WCAG 2 nivel A e AA',
  function (this: SauceWorld) {
    if (!this.ultimoResumoA11y) {
      throw new Error('Nenhuma análise de acessibilidade foi executada neste cenário.');
    }
    console.log(
      `[Assert] Escopo: ${this.ultimoResumoA11y.escopo.padrao} Nível ${this.ultimoResumoA11y.escopo.niveis.join('+')} | ` +
        `critical=${this.ultimoResumoA11y.contagens.critical} serious=${this.ultimoResumoA11y.contagens.serious} | ` +
        `veredito=${this.ultimoResumoA11y.aprovado ? 'APROVADO' : 'REPROVADO'}`,
    );
    assertSemViolacoesCriticasOuSerias(this.ultimoResumoA11y);
  },
);

When(
  'eu navego com TAB na ordem {string}',
  async function (this: SauceWorld, ordemCsv: string) {
    const ordemEsperada = ordemCsv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const formulario = ordemEsperada.includes('username') ? 'Login' : 'Checkout Info';
    const resultado = await validarOrdemTab(this.page, formulario, ordemEsperada);
    this.ultimoRoteiroTab = resultado;
    console.log(`\n${resultado.roteiroTexto}\n`);
    await this.attach(resultado.roteiroTexto, 'text/plain');
  },
);

Then('a navegação por TAB deve estar aprovada', async function (this: SauceWorld) {
  if (!this.ultimoRoteiroTab) {
    throw new Error('Nenhuma navegação por TAB foi executada neste cenário.');
  }
  if (!this.ultimoRoteiroTab.aprovado) {
    throw new Error(this.ultimoRoteiroTab.roteiroTexto);
  }
  await this.attach(
    JSON.stringify(
      {
        criterio: 'WCAG 2.1.1 Keyboard',
        formulario: this.ultimoRoteiroTab.formulario,
        ordem: this.ultimoRoteiroTab.ordemEsperada,
        passos: this.ultimoRoteiroTab.passos,
        aprovado: true,
      },
      null,
      2,
    ),
    'application/json',
  );
});
