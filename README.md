# Automação SauceDemo — Playwright + Cucumber

Projeto de automação E2E em **BDD (Cucumber)** com **Playwright** e **Page Object Pattern**, cobrindo login/navegação e checkout e acessibilidade no [SauceDemo](https://www.saucedemo.com/).

## Tecnologias e versões

| Tecnologia | Versão | Papel |
|---|---|---|
| Node.js | 22 (CI) | Runtime |
| [Playwright](https://playwright.dev) (`@playwright/test`) | `^1.50.0` | Automação de browser e assertions web-first |
| Chromium (via Playwright) | instalado com `npx playwright install` | Browser padrão dos testes |
| [Cucumber](https://cucumber.io) (`@cucumber/cucumber`) | `^11.2.0` | BDD — features Gherkin em português |
| TypeScript | `^5.7.0` | Tipagem dos Page Objects e steps |
| Page Object Pattern | — | Separação de interação de UI e regras de cenário |
| [@axe-core/playwright](https://github.com/dequelabs/axe-core-npm) | `^4.10.1` | Análise de acessibilidade WCAG 2.A / 2.AA |
| dotenv | `^16.4.7` | Variáveis de ambiente (`.env`) |
| tsx | `^4.19.0` | Execução TypeScript no Cucumber |
| cross-env | `^7.0.3` | Variáveis de ambiente cross-platform nos scripts |

As versões exatas resolvidas ficam no `package-lock.json` (ex.: após `npm ci`, Playwright pode resolver para `1.62.0`). Use `npm ci` para reproduzir o mesmo lock.

## Cenários cobertos

**Total: 20 cenários** (6 login + 6 checkout + 8 acessibilidade).

### Tarefa 1 — Login e navegação (`@login`)

- Login válido e navegação para a página de produtos
- Login com senha incorreta
- Login com usuário inexistente
- Login com campos obrigatórios em branco
- Login com usuário bloqueado
- Login apenas com usuário preenchido (senha em branco)

### Tarefa 2 — Checkout (`@checkout`)

- Compra completa com dados válidos
- Adicionar múltiplos produtos e concluir compra
- Checkout com endereço de entrega incompleto - nome em branco
- Checkout com endereço de entrega incompleto - sobrenome em branco
- Checkout com endereço de entrega incompleto - CEP em branco
- Checkout com dados de pagamento/entrega inválidos - formulário vazio

> **Nota:** O SauceDemo **não possui campos de cartão de crédito**. O formulário de “pagamento/entrega” é `Checkout: Your Information` (First Name, Last Name, Postal Code).

### Acessibilidade (axe-core + teclado) (`@acessibilidade`)

**axe (`@axe`):**

- Página de login sem violações critical ou serious
- Página de produtos sem violações critical ou serious
- Página do carrinho sem violações critical ou serious
- Página de informações do checkout sem violações critical ou serious
- Página de resumo do checkout sem violações critical ou serious
- Página de compra concluída sem violações critical ou serious

**Teclado (`@teclado`):**

- Login — campos focáveis na ordem correta com TAB
- Checkout — campos de entrega focáveis na ordem correta com TAB

Tags WCAG: `wcag2a` + `wcag2aa` (WCAG 2.0 Nível A e AA). **Falha** apenas em violações `critical` ou `serious`. Relatórios JSON em `reports/a11y/`.

## Estrutura

```
playwright-e2e/
├── features/
│   ├── login/login.feature
│   ├── checkout/checkout.feature
│   ├── acessibilidade/acessibilidade.feature
│   ├── steps/              # common, login, checkout, a11y
│   └── support/            # world.ts, hooks.ts
├── src/
│   ├── pages/              # Page Objects (BasePage + domínios)
│   ├── data/               # users.json, checkout.json, resolver.ts
│   └── utils/              # acessibilidade.ts, teclado.ts
├── scripts/                # sumário, limpar reports, abrir HTML
├── reports/                # gerado (gitignored): HTML, evidencias, traces, a11y
├── .auth/                  # gerado (gitignored): storageState
├── .github/workflows/e2e.yml
├── cucumber.js
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

### Responsabilidades por pasta

| Pasta | Responsabilidade |
|---|---|
| `features/<domínio>/` | Cenários Gherkin agrupados por domínio (`login`, `checkout`, `acessibilidade`) |
| `features/steps/` | Step definitions (orquestração); `common.steps.ts` para auth/carrinho compartilhados |
| `features/support/` | `SauceWorld` (POs lazy) + hooks (browser, evidências, storageState) |
| `src/pages/` | Page Objects — interação de UI e asserts de página |
| `src/data/` | Massa de dados JSON + `resolver.ts` (perfis, clientes, mensagens) |
| `src/utils/` | Helpers transversais (axe-core, navegação TAB) |
| `scripts/` | Utilitários de relatório (`report:sumario`, `clean:reports`, abrir HTML) |
| `reports/` | Artefatos de execução (não versionar) |
| `.auth/` | `storageState` gerado no `BeforeAll` (não versionar) |
| `.github/` | CI (`workflows/e2e.yml`) |

> **Código-fonte vs. gerados:** versionar `features/`, `src/`, `scripts/`, configs e `.env.example`. Não versionar `reports/`, `.auth/`, `dist/` nem `.env` (já cobertos pelo `.gitignore`).

## Instalação

Pré-requisito: **Node.js 22** (versão usada no CI).

```bash
npm install
npx playwright install chromium
cp .env.example .env
```

## Execução

```bash
npm test                 # suite completa (+ sumário via posttest)
npm run test:login
npm run test:checkout
npm run test:positivo
npm run test:negativo
npm run test:a11y
npm run test:headed
npm run test:report      # abre o HTML
npm run typecheck
npm run clean:reports
```

Variáveis úteis: `HEADED`, `SLOW_MO`, `BROWSER`, `CUCUMBER_PARALLEL` (default `1`), `CI`.

### Como gerar e abrir o relatório

1. `npm test` (ou qualquer script `test:*`) executa o Cucumber, que gera automaticamente `reports/cucumber-report.html` e `reports/cucumber-report.json` (formatters em `cucumber.js`).
2. O hook `posttest` (ou `npm run report:sumario` nos scripts com tags) gera `reports/SUMARIO.md` a partir do JSON.
3. `npm run test:report` abre o relatório HTML no navegador.

## Boas práticas aplicadas

Alinhadas às docs oficiais do Playwright ([best practices](https://playwright.dev/docs/best-practices), [locators](https://playwright.dev/docs/locators), [assertions](https://playwright.dev/docs/test-assertions), [fixtures](https://playwright.dev/docs/test-fixtures)).

### Locators

Prioridade obrigatória (documentada em `src/pages/BasePage.ts`):

1. `getByRole` com `name`
2. `getByTestId` — SauceDemo usa `data-test` via `selectors.setTestIdAttribute('data-test')`
3. `getByLabel` / `getByPlaceholder` / `getByText` (conforme o tipo de elemento)
4. CSS **somente** como fallback pontual e curto

**Proibido:** XPath; cadeias longas de CSS; `nth` / `.first()` / `.last()` sem critério semântico.

Produtos no carrinho/overview são validados **escopados** ao item (`inventory-item` + texto), não com `getByText` global.

### Assertions web-first

- Usar `expect` com auto-retry: `toBeVisible`, `toHaveText`, `toHaveURL`, `toBeFocused`, `toHaveCount`, etc.
- **Proibido:** `expect(await locator.isVisible()).toBe(true)` e asserts booleanos sem retry
- Asserts de negócio ficam nos Page Objects ou steps `Then` — estado persistido na UI, não toast/classe CSS

### Sincronização

- Sem `waitForTimeout` como sincronização (só pausa intencional de demonstração, com justificativa)
- Playwright auto-wait em `click` / `fill`; sem `waitFor({ visible })` redundante antes das ações
- Esperas por URL, visibilidade e foco observáveis

### Fixtures (equivalente Cucumber)

O runner é Cucumber (BDD); o espírito das fixtures do Playwright Test mapeia assim:

| Playwright Test | Neste projeto |
|---|---|
| fixture browser | `BeforeAll` / `AfterAll` (browser compartilhado) |
| fixture context/page | `Before` / `After` — **novo context por cenário** |
| fixture on-demand | getters lazy de Page Objects no `SauceWorld` |
| worker-scoped auth | `storageState` em `.auth/standard_user.json` |

Steps repetidos ficam em `features/steps/common.steps.ts`; jornadas longas de a11y usam steps compostos + `storageState`.

### Diagnóstico de falhas

| Evidência | Quando |
|---|---|
| Screenshot + `meta.json` | Somente em `FAILED` (`reports/evidencias/`) |
| Trace `.zip` | **on-first-retry** em CI (`reports/traces/`), anexado ao Cucumber |
| Boletim axe / roteiro TAB | Anexados ao cenário de a11y |

### Isolamento, retry e paralelismo

- Isolamento por **BrowserContext** fresco (não compartilha cookies/storage entre cenários)
- `retry: 1` **somente** quando `CI=true` (não mascara flake local)
- `CUCUMBER_PARALLEL` default `1` — subir só se os cenários forem comprovadamente independentes
- `BROWSER=chromium|firefox|webkit` opcional

### Dados e manutenção

- Credenciais e mensagens em `src/data/users.json` e `src/data/checkout.json` (via `resolver.ts`)
- Features Gherkin usam **perfis/chaves** (`valido`, `semNome`, …) — senha não aparece no `.feature`
- `SENHA` do `.env` só substitui a senha canônica do demo; não mascara senhas de cenários negativos


### Redução de flakiness (checklist)

| Prática | Status |
|---|---|
| Locators semânticos + escopo | OK |
| Assertions com auto-retry | OK |
| Zero hard wait | OK |
| Context fresco por cenário | OK |
| Screenshot on failure | OK |
| Trace on-first-retry (CI) | OK |
| Parallel só se independente | OK (default `1`) |
| Dados centralizados (sem duplicar no Gherkin) | OK |

## Acessibilidade

```bash
npm run test:a11y
```

| Item | Detalhe |
|---|---|
| Política de falha | `critical` / `serious` |
| Exclusão | `select-name` **somente** na página Products |
| Teclado | ordem declarada no Gherkin; util só cobre elementos com `data-test` |

## Relatório e CI

| Artefato | Caminho |
|---|---|
| HTML Cucumber | `reports/cucumber-report.html` |
| JSON Cucumber | `reports/cucumber-report.json` |
| Sumário | `reports/SUMARIO.md` |
| Screenshots (falhas) | `reports/evidencias/` |
| Traces (retry CI) | `reports/traces/` |
| axe JSON | `reports/a11y/` |

CI (GitHub Actions): `npm ci` → Playwright Chromium → `tsc --noEmit` → `npm test` → upload de artifacts.

## Credenciais SauceDemo

Perfis em `src/data/users.json` (`valido`, `bloqueado`, `inexistente`, `senhaIncorreta`). Senha via `.env` (`SENHA`), sem literal nos `.feature`.


## Bugs encontrados × Pontos de atenção

| Tipo | Descrição |
|---|---|
| Limitação do app | SauceDemo **não tem campos de cartão de crédito**. Os cenários negativos de “pagamento” cobrem o formulário de entrega (First Name, Last Name, Postal Code); o formulário vazio é o equivalente funcional a dados de pagamento inválidos. |
| Bug / gap de a11y no app | Na página Products, o `<select>` de ordenação não possui nome acessível. A regra axe `select-name` é **excluída somente nessa página** para não mascarar outras violações. |
| Política de falha a11y | O suite falha apenas em violações `critical` ou `serious`. Violações `moderate`/`minor` são registradas, mas não quebram o teste. |
| Escopo do teste de teclado | A navegação por TAB valida apenas elementos com `data-test`, na ordem declarada no Gherkin. Não cobre Shift+TAB, leitores de tela nem focus trap de modais. |
| Paralelismo | `CUCUMBER_PARALLEL` default `1`. Aumentar sem validar independência dos cenários pode gerar interferência entre execuções. |
| Interpretação de negativos | Cenários `@negativo` que **PASSAM** significam que a aplicação rejeitou corretamente o input inválido (comportamento esperado). |

## Avaliação — checklist

| Critério | Status |
|---|---|
| Estrutura clara (features / pages / steps) | OK |
| Page Object Pattern + locators padronizados | OK |
| Fluxos positivos e negativos (login/checkout) | OK |
| Dados centralizados em JSON | OK |
| Screenshot on failure + trace on-first-retry | OK |
| CI com typecheck e artifacts | OK |
| Acessibilidade (axe + TAB) | OK |
| Estabilidade (sem hard waits) | OK |

## Referências (Documentação)

- [SauceDemo](https://www.saucedemo.com/) — aplicação sob teste
- [Playwright](https://playwright.dev/docs/intro) — documentação oficial
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Locators](https://playwright.dev/docs/locators)
- [Playwright Assertions](https://playwright.dev/docs/test-assertions)
- [Playwright Fixtures](https://playwright.dev/docs/test-fixtures)
- [Cucumber](https://cucumber.io/docs/cucumber/) — BDD e Gherkin
- [@axe-core/playwright](https://github.com/dequelabs/axe-core-npm/blob/develop/packages/playwright/README.md) — análise de acessibilidade
- [WCAG 2 Overview](https://www.w3.org/WAI/standards-guidelines/wcag/) — critérios A/AA; teclado [2.1.1](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html)
