import * as fs from 'fs';
import * as path from 'path';

const reportsDir = path.resolve(process.cwd(), 'reports');
const pastas = ['evidencias', 'a11y', 'traces'];

fs.mkdirSync(reportsDir, { recursive: true });

for (const pasta of pastas) {
  const dir = path.join(reportsDir, pasta);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    continue;
  }
  for (const entry of fs.readdirSync(dir)) {
    if (entry === '.gitkeep') continue;
    const full = path.join(dir, entry);
    fs.rmSync(full, { recursive: true, force: true });
  }
}

for (const arquivo of ['cucumber-report.html', 'cucumber-report.json', 'SUMARIO.md']) {
  const full = path.join(reportsDir, arquivo);
  if (fs.existsSync(full)) fs.unlinkSync(full);
}

console.log('[Relatório] Pasta reports/ limpa (evidencias, a11y, traces e relatórios).');
