module.exports = {
  default: {
    requireModule: ['tsx/cjs'],
    require: [
      'features/support/world.ts',
      'features/support/hooks.ts',
      'features/steps/**/*.ts',
    ],
    paths: ['features/**/*.feature'],
    format: [
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json',
      'summary',
    ],
    formatOptions: {
      snippetInterface: 'async-await',
    },
    // Default 1 — subir CUCUMBER_PARALLEL só com cenários comprovadamente independentes
    parallel: Math.max(1, Number(process.env.CUCUMBER_PARALLEL || 1) || 1),
    retry: process.env.CI ? 1 : 0,
    timeout: 60_000,
  },
};
