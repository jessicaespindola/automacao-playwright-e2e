import * as fs from 'fs';
import * as path from 'path';
import { type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { AxeResults, Result } from 'axe-core';

/** Impactos que falham o cenário (política do projeto). */
export const IMPACTOS_FALHA = ['critical', 'serious'] as const;

export type ImpactoFalha = (typeof IMPACTOS_FALHA)[number];

export const TAGS_WCAG = ['wcag2a', 'wcag2aa'] as const;

/**
 * Regras desabilitadas globalmente (vazio de propósito).
 * Preferir escopo por página via regrasDesabilitadasParaPagina().
 */
export const REGRAS_DESABILITADAS: string[] = [];

/**
 * Exclusões conscientes por página.
 * SauceDemo — inventário: o <select> de ordenação não possui label/aria-label/title.
 */
export const REGRAS_POR_PAGINA: Record<string, string[]> = {
  Products: ['select-name'],
};

export const JUSTIFICATIVA_REGRAS: Record<string, string> = {
  'select-name': 'SauceDemo — select de ordenação na página Products sem nome acessível',
};

export function regrasDesabilitadasParaPagina(nomePagina: string): string[] {
  return REGRAS_POR_PAGINA[nomePagina] ?? [];
}

export type ContagensA11y = {
  passes: number;
  violations: number;
  incomplete: number;
  inapplicable: number;
  porImpacto: Record<string, number>;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
};

export type EscopoA11y = {
  padrao: string;
  niveis: string[];
  tagsAxe: string[];
  politicaFalha: string[];
};

export type ResumoAcessibilidade = {
  pagina: string;
  url: string;
  timestamp: string;
  caminhoRelatorio: string;
  totalViolacoes: number;
  violacoesCriticasOuSerias: Result[];
  violacoesInformativas: Result[];
  contagens: ContagensA11y;
  escopo: EscopoA11y;
  regrasDesabilitadas: string[];
  /** Texto curto legado / erro */
  resumoTexto: string;
  /** Boletim didático completo para relatório e console */
  boletimTexto: string;
  resultados: AxeResults;
  aprovado: boolean;
};

const A11Y_DIR = path.resolve(__dirname, '../../reports/a11y');

function slugificar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 60);
}

function contarPorImpacto(violations: Result[]): Record<string, number> {
  return violations.reduce<Record<string, number>>((acc, v) => {
    const key = v.impact ?? 'unknown';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function criteriosWcag(tags: string[]): string {
  const criterios = tags
    .filter((t) => /^wcag\d+$/i.test(t))
    .map((t) => t.replace(/^wcag/i, '').replace(/(\d)(\d)(\d)/, '$1.$2.$3'));
  return criterios.length > 0 ? criterios.join(', ') : '—';
}

function formatarViolacao(v: Result): string {
  const nos = v.nodes
    .slice(0, 5)
    .map((n) => `    - ${n.target.join(' ')}: ${n.failureSummary ?? n.html.slice(0, 80)}`)
    .join('\n');
  return [
    `[${v.impact}] ${v.id} — ${v.help}`,
    `  Critérios WCAG (tags): ${criteriosWcag(v.tags)}`,
    `  ${v.helpUrl}`,
    nos,
  ].join('\n');
}

function montarBoletim(params: {
  pagina: string;
  url: string;
  escopo: EscopoA11y;
  regrasDesabilitadas: string[];
  contagens: ContagensA11y;
  violacoesCriticasOuSerias: Result[];
  violacoesInformativas: Result[];
  caminhoRelatorio: string;
  aprovado: boolean;
}): string {
  const {
    pagina,
    url,
    escopo,
    regrasDesabilitadas,
    contagens,
    violacoesCriticasOuSerias,
    violacoesInformativas,
    caminhoRelatorio,
    aprovado,
  } = params;

  const exclusoes =
    regrasDesabilitadas.length === 0
      ? '  (nenhuma)'
      : regrasDesabilitadas
          .map((r) => `  - ${r}: ${JUSTIFICATIVA_REGRAS[r] ?? 'sem justificativa documentada'}`)
          .join('\n');

  const informativas =
    violacoesInformativas.length === 0
      ? '  (nenhuma)'
      : violacoesInformativas
          .map((v) => `  - [${v.impact}] ${v.id}: ${v.help}`)
          .join('\n');

  const falhas =
    violacoesCriticasOuSerias.length === 0
      ? '  (nenhuma — critério de falha atendido)'
      : violacoesCriticasOuSerias.map(formatarViolacao).join('\n\n');

  const veredito = aprovado
    ? 'APROVADO — zero violações critical/serious no escopo WCAG 2.0 Nível A e AA'
    : `REPROVADO — ${violacoesCriticasOuSerias.length} violação(ões) critical/serious`;

  return [
    `=== Boletim de acessibilidade: ${pagina} ===`,
    `URL: ${url}`,
    ``,
    `Escopo: ${escopo.padrao} Nível ${escopo.niveis.join(' + ')}`,
    `  Tags axe: ${escopo.tagsAxe.join(', ')}`,
    `  (wcag2a = Level A | wcag2aa = Level AA)`,
    ``,
    `Política deste teste:`,
    `  FALHAR se existir violação critical OU serious`,
    `  REGISTRAR (não falha) moderate e minor`,
    ``,
    `Regras desabilitadas de propósito:`,
    exclusoes,
    ``,
    `Resultado da varredura axe-core:`,
    `  - Regras que passaram (passes): ${contagens.passes}`,
    `  - Violações totais: ${contagens.violations}`,
    `      critical: ${contagens.critical}  ← critério de falha`,
    `      serious:  ${contagens.serious}  ← critério de falha`,
    `      moderate: ${contagens.moderate}  (registrado, NÃO falha o teste)`,
    `      minor:    ${contagens.minor}  (registrado, NÃO falha o teste)`,
    `  - Incomplete (precisa revisão manual): ${contagens.incomplete}`,
    `  - Inapplicable (não se aplica à página): ${contagens.inapplicable}`,
    ``,
    `Violações critical/serious:`,
    falhas,
    ``,
    `Violações informativas (moderate/minor) — não falham o teste:`,
    informativas,
    ``,
    `Veredito: ${veredito}`,
    `Relatório JSON: ${caminhoRelatorio}`,
    ``,
    `Nota: axe cobre checagens automatizáveis no DOM (parte das regras WCAG).`,
    `Não substitui teste de teclado (TAB), leitor de tela nem revisão de conteúdo.`,
  ].join('\n');
}

/**
 * Executa análise axe (WCAG 2.0 Nível A e AA) na página atual,
 * persiste JSON completo e retorna boletim didático para assertivas/anexos.
 */
export async function analisarAcessibilidade(
  page: Page,
  nomePagina: string,
  opcoes?: { disableRules?: string[] },
): Promise<ResumoAcessibilidade> {
  fs.mkdirSync(A11Y_DIR, { recursive: true });

  const regrasDesabilitadas = [
    ...REGRAS_DESABILITADAS,
    ...(opcoes?.disableRules ?? []),
  ];

  let builder = new AxeBuilder({ page }).withTags([...TAGS_WCAG]);
  if (regrasDesabilitadas.length > 0) {
    builder = builder.disableRules(regrasDesabilitadas);
  }

  const resultados = await builder.analyze();
  const porImpacto = contarPorImpacto(resultados.violations);

  const violacoesCriticasOuSerias = resultados.violations.filter((v) =>
    IMPACTOS_FALHA.includes(v.impact as ImpactoFalha),
  );
  const violacoesInformativas = resultados.violations.filter(
    (v) => !IMPACTOS_FALHA.includes(v.impact as ImpactoFalha),
  );

  const contagens: ContagensA11y = {
    passes: resultados.passes.length,
    violations: resultados.violations.length,
    incomplete: resultados.incomplete.length,
    inapplicable: resultados.inapplicable.length,
    porImpacto,
    critical: porImpacto.critical ?? 0,
    serious: porImpacto.serious ?? 0,
    moderate: porImpacto.moderate ?? 0,
    minor: porImpacto.minor ?? 0,
  };

  const escopo: EscopoA11y = {
    padrao: 'WCAG 2.0',
    niveis: ['A', 'AA'],
    tagsAxe: [...TAGS_WCAG],
    politicaFalha: [...IMPACTOS_FALHA],
  };

  const aprovado = violacoesCriticasOuSerias.length === 0;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const arquivo = `${slugificar(nomePagina)}_${timestamp}.json`;
  const caminhoRelatorio = path.join(A11Y_DIR, arquivo);
  const isoTimestamp = new Date().toISOString();

  const boletimTexto = montarBoletim({
    pagina: nomePagina,
    url: page.url(),
    escopo,
    regrasDesabilitadas,
    contagens,
    violacoesCriticasOuSerias,
    violacoesInformativas,
    caminhoRelatorio,
    aprovado,
  });

  const payload = {
    pagina: nomePagina,
    url: page.url(),
    timestamp: isoTimestamp,
    escopo,
    regrasDesabilitadas,
    justificativaRegras: JUSTIFICATIVA_REGRAS,
    politicaFalha: IMPACTOS_FALHA,
    contagens,
    aprovado,
    boletimTexto,
    resultados,
  };

  fs.writeFileSync(caminhoRelatorio, JSON.stringify(payload, null, 2), 'utf-8');

  return {
    pagina: nomePagina,
    url: page.url(),
    timestamp: isoTimestamp,
    caminhoRelatorio,
    totalViolacoes: resultados.violations.length,
    violacoesCriticasOuSerias,
    violacoesInformativas,
    contagens,
    escopo,
    regrasDesabilitadas,
    resumoTexto: boletimTexto,
    boletimTexto,
    resultados,
    aprovado,
  };
}

export function assertSemViolacoesCriticasOuSerias(resumo: ResumoAcessibilidade): void {
  if (!resumo.aprovado) {
    throw new Error(resumo.boletimTexto);
  }
}

/** Payload JSON compacto para anexar no Cucumber */
export function resumoJsonParaAnexo(resumo: ResumoAcessibilidade) {
  return {
    pagina: resumo.pagina,
    url: resumo.url,
    escopo: resumo.escopo,
    aprovado: resumo.aprovado,
    contagens: resumo.contagens,
    regrasDesabilitadas: resumo.regrasDesabilitadas,
    caminhoRelatorio: resumo.caminhoRelatorio,
    violacoesCriticalSerious: resumo.violacoesCriticasOuSerias.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      wcag: criteriosWcag(v.tags),
      nodes: v.nodes.length,
    })),
    violacoesInformativas: resumo.violacoesInformativas.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.length,
    })),
  };
}
