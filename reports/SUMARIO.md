# Relatório E2E — SauceDemo (Playwright + Cucumber)

Gerado em: 2026-07-31T02:52:15.941Z

## Resumo

| Métrica | Valor |
|--------|------:|
| Total de cenários | 20 |
| Passou | 20 |
| Falhou | 0 |
| Pulado | 0 |

## Cenários

| Feature | Cenário | Tipo | Status |
|---------|---------|------|--------|
| Acessibilidade WCAG no SauceDemo | Página de login sem violações critical ou serious | A11y | PASSED |
| Acessibilidade WCAG no SauceDemo | Página de produtos sem violações critical ou serious | A11y | PASSED |
| Acessibilidade WCAG no SauceDemo | Página do carrinho sem violações critical ou serious | A11y | PASSED |
| Acessibilidade WCAG no SauceDemo | Página de informações do checkout sem violações critical ou serious | A11y | PASSED |
| Acessibilidade WCAG no SauceDemo | Página de resumo do checkout sem violações critical ou serious | A11y | PASSED |
| Acessibilidade WCAG no SauceDemo | Página de compra concluída sem violações critical ou serious | A11y | PASSED |
| Acessibilidade WCAG no SauceDemo | Login — campos focáveis na ordem correta com TAB | A11y | PASSED |
| Acessibilidade WCAG no SauceDemo | Checkout — campos de entrega focáveis na ordem correta com TAB | A11y | PASSED |
| Checkout no e-commerce SauceDemo | Compra completa com dados válidos | Positivo | PASSED |
| Checkout no e-commerce SauceDemo | Adicionar múltiplos produtos e concluir compra | Positivo | PASSED |
| Checkout no e-commerce SauceDemo | Checkout com endereço de entrega incompleto - nome em branco | Negativo | PASSED |
| Checkout no e-commerce SauceDemo | Checkout com endereço de entrega incompleto - sobrenome em branco | Negativo | PASSED |
| Checkout no e-commerce SauceDemo | Checkout com endereço de entrega incompleto - CEP em branco | Negativo | PASSED |
| Checkout no e-commerce SauceDemo | Checkout com dados de pagamento/entrega inválidos - formulário vazio | Negativo | PASSED |
| Login e navegação no SauceDemo | Login válido e navegação para a página de produtos | Positivo | PASSED |
| Login e navegação no SauceDemo | Login com senha incorreta | Negativo | PASSED |
| Login e navegação no SauceDemo | Login com usuário inexistente | Negativo | PASSED |
| Login e navegação no SauceDemo | Login com campos obrigatórios em branco | Negativo | PASSED |
| Login e navegação no SauceDemo | Login com usuário bloqueado | Negativo | PASSED |
| Login e navegação no SauceDemo | Login apenas com usuário preenchido (senha em branco) | Negativo | PASSED |

## Evidências

- Relatório HTML interativo: `reports/cucumber-report.html`
- Screenshots (somente falhas): `reports/evidencias/`
- Traces (on-first-retry em CI): `reports/traces/`
- Relatórios axe-core: `reports/a11y/`
- JSON bruto: `reports/cucumber-report.json`

## Observações

- Cenários **negativos** que **passam** significam que a aplicação rejeitou corretamente a entrada inválida (falha esperada do negócio, sucesso do teste).
- O SauceDemo não possui campo de cartão de crédito; validações de "pagamento" cobrem o formulário de entrega (First Name, Last Name, Postal Code).

## Como visualizar

```bash
npm run test:report
# ou abra reports/cucumber-report.html no navegador
```
