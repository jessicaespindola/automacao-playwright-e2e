import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const file = path.resolve(process.cwd(), 'reports/cucumber-report.html');
if (!fs.existsSync(file)) {
  console.error('[Relatório] reports/cucumber-report.html não encontrado. Execute npm test primeiro.');
  process.exit(1);
}

const cmd =
  process.platform === 'win32'
    ? `start "" "${file}"`
    : process.platform === 'darwin'
      ? `open "${file}"`
      : `xdg-open "${file}"`;

exec(cmd, (err) => {
  if (err) {
    console.error('[Relatório] Não foi possível abrir o HTML automaticamente:', err.message);
    console.error(`Abra manualmente: ${file}`);
    process.exit(1);
  }
  console.log(`[Relatório] Abrindo ${file}`);
});
