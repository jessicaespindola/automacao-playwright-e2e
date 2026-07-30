import * as fs from 'fs';
import * as path from 'path';

const reportsDir = path.resolve(process.cwd(), 'reports');
const jsonPath = path.join(reportsDir, 'cucumber-report.json');
const sumarioPath = path.join(reportsDir, 'SUMARIO.md');

function statusDoCenario(steps) {
  let scenarioStatus = 'PASSED';
  for (const step of steps) {
    if (step.keyword === 'Before' || step.keyword === 'After') continue;
    const st = step.result?.status;
    if (st === 'failed') {
      return 'FAILED';
    }
    if (st === 'skipped' || st === 'pending' || st === 'undefined') {
      if (scenarioStatus !== 'FAILED') scenarioStatus = 'SKIPPED';
    }
  }
  return scenarioStatus;
}

function main() {
  if (!fs.existsSync(jsonPath)) {
    console.warn('[Relatório] cucumber-report.json não encontrado — execute npm test primeiro.');
    return;
  }

  const report = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  const linhasCenarios = [];

  for (const feature of report) {
    const featureName = feature.name || 'Feature';
    for (const element of feature.elements || []) {
      if (element.type !== 'scenario') continue;
      const tags = (element.tags || []).map((t) => t.name).join(' ');
      const scenarioStatus = statusDoCenario(element.steps || []);

      if (scenarioStatus === 'PASSED') passed++;
      else if (scenarioStatus === 'FAILED') failed++;
      else skipped++;

      const tipo = tags.includes('@negativo')
        ? 'Negativo'
        : tags.includes('@positivo')
          ? 'Positivo'
          : tags.includes('@acessibilidade')
            ? 'A11y'
            : '—';
      linhasCenarios.push(
        `| ${featureName} | ${element.name} | ${tipo} | ${scenarioStatus} |`,
      );
    }
  }

  const total = passed + failed + skipped;
  const md = `# Relatório E2E — SauceDemo (Playwright + Cucumber)

Gerado em: ${new Date().toISOString()}

## Resumo

| Métrica | Valor |
|--------|------:|
| Total de cenários | ${total} |
| Passou | ${passed} |
| Falhou | ${failed} |
| Pulado | ${skipped} |

## Cenários

| Feature | Cenário | Tipo | Status |
|---------|---------|------|--------|
${linhasCenarios.join('\n')}

## Evidências

- Relatório HTML interativo: \`reports/cucumber-report.html\`
- Screenshots (somente falhas): \`reports/evidencias/\`
- Traces (on-first-retry em CI): \`reports/traces/\`
- Relatórios axe-core: \`reports/a11y/\`
- JSON bruto: \`reports/cucumber-report.json\`

## Observações

- Cenários **negativos** que **passam** significam que a aplicação rejeitou corretamente a entrada inválida (falha esperada do negócio, sucesso do teste).
- O SauceDemo não possui campo de cartão de crédito; validações de "pagamento" cobrem o formulário de entrega (First Name, Last Name, Postal Code).

## Como visualizar

\`\`\`bash
npm run test:report
# ou abra reports/cucumber-report.html no navegador
\`\`\`
`;

  fs.writeFileSync(sumarioPath, md, 'utf-8');
  console.log(`[Relatório] Sumário gerado em ${sumarioPath}`);
  console.log(`[Relatório] ${passed} passed | ${failed} failed | ${skipped} skipped (total ${total})`);
}

main();
